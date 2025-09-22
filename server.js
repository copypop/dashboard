import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Excel file path - UPDATE THIS TO YOUR EXCEL FILE LOCATION
const EXCEL_FILE_PATH = path.join(__dirname, 'public', 'CAAT_Dashboard_Data_2025.xlsx');

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

app.use(cors());
app.use(express.json());

// Function to read and parse Excel file
function readExcelFile() {
  try {
    console.log('Checking if Excel file exists...');
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.log(`Excel file not found at: ${EXCEL_FILE_PATH}`);
      return null;
    }

    console.log('Getting file stats...');
    const stats = fs.statSync(EXCEL_FILE_PATH);
    const lastModified = stats.mtime;

    console.log('Reading Excel workbook...');
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const data = {};

    console.log(`Found ${workbook.SheetNames.length} sheets: ${workbook.SheetNames.join(', ')}`);

    // Parse each sheet
    workbook.SheetNames.forEach(sheetName => {
      console.log(`Processing sheet: ${sheetName}`);
      const sheet = workbook.Sheets[sheetName];
      data[sheetName] = XLSX.utils.sheet_to_json(sheet);
      console.log(`Sheet ${sheetName} processed: ${data[sheetName].length} rows`);
    });

    console.log(`Excel file loaded successfully at ${new Date().toLocaleTimeString()}`);
    return { data, lastModified };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return null;
  }
}

// Function to generate analysis prompts for different tab types
function getAnalysisPrompt(tabType, data, period, targets, compareMode, comparisonData) {
  const baseContext = `You are analyzing marketing data for CAAT Pension Plan for ${period.quarter} ${period.year}.
CAAT is a pension plan provider, so focus on insights relevant to financial services marketing.

CRITICAL INSTRUCTIONS:
- Base your analysis ONLY on the provided data - do not make assumptions or add information not present
- If data is missing or insufficient, state this clearly rather than making estimates
- Focus on factual observations from the actual numbers provided
- Avoid speculative language and stick to what the data directly shows
- Provide executive-level insights including trends, anomalies, performance vs targets, and actionable recommendations
- Keep your response concise but insightful, suitable for marketing leadership`;

  const dataContext = `Data for analysis:\n${JSON.stringify(data, null, 2)}`;

  let targetContext = '';
  if (targets && Object.keys(targets).length > 0) {
    targetContext = `\nPerformance targets:\n${JSON.stringify(targets, null, 2)}`;
  }

  let comparisonContext = '';
  if (compareMode && comparisonData) {
    comparisonContext = `\nComparison data (previous period):\n${JSON.stringify(comparisonData, null, 2)}`;
  }

  const tabSpecificPrompts = {
    overview: `Focus on overall performance across all channels. Highlight key wins, areas of concern, and strategic recommendations.`,
    website: `Analyze website traffic patterns, user behavior metrics, bounce rates, and session quality. Consider seasonal trends and user engagement.`,
    traffic: `Examine traffic source effectiveness, channel performance, and acquisition costs. Identify the most valuable traffic sources.`,
    social: `Review social media engagement trends, channel performance, content effectiveness, and audience growth across platforms.`,
    email: `Assess email marketing campaign performance, deliverability rates, engagement metrics, and subscriber behavior patterns.`,
    events: `Analyze event marketing performance including registration rates, attendance patterns, lead conversion funnel from events, and event source effectiveness. Focus on lead quality and pipeline impact.`,
    leads: `Evaluate lead generation pipeline health, conversion rates, lead quality metrics, and sales funnel performance.`
  };

  const specificPrompt = tabSpecificPrompts[tabType] || tabSpecificPrompts.overview;

  return `${baseContext}\n\n${specificPrompt}\n\n${dataContext}${targetContext}${comparisonContext}`;
}

// Function to call Claude API for analysis
async function getClaudeAnalysis(prompt) {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 12000,
      temperature: 0.0,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to generate analysis');
  }
}

// API endpoint to get the latest data
app.get('/api/dashboard-data', (req, res) => {
  console.log('API call received, attempting to read Excel file...');

  try {
    const result = readExcelFile();

    if (!result) {
      console.log('Failed to read Excel file');
      return res.status(404).json({
        error: 'Excel file not found or could not be read',
        path: EXCEL_FILE_PATH,
        message: 'Please ensure the Excel file exists at the specified location'
      });
    }

    console.log('Excel file read successfully, sending response...');
    res.json({
      data: result.data,
      lastModified: result.lastModified,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in API endpoint:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// API endpoint to check file status
app.get('/api/status', (req, res) => {
  const fileExists = fs.existsSync(EXCEL_FILE_PATH);
  let lastModified = null;

  if (fileExists) {
    try {
      const stats = fs.statSync(EXCEL_FILE_PATH);
      lastModified = stats.mtime;
    } catch (error) {
      console.error('Error getting file stats:', error);
    }
  }

  res.json({
    fileExists,
    filePath: EXCEL_FILE_PATH,
    lastModified,
    hasData: fileExists
  });
});

// API endpoint for AI analysis
app.post('/api/analyze', async (req, res) => {
  console.log('Analysis API call received...');

  try {
    const { tabType, data, period, targets, compareMode, comparisonData } = req.body;

    // Validate required fields
    if (!tabType || !data || !period) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'tabType, data, and period are required'
      });
    }

    // Check if Claude API key is configured
    if (!process.env.CLAUDE_API_KEY) {
      return res.status(500).json({
        error: 'Claude API key not configured',
        message: 'Please set CLAUDE_API_KEY environment variable'
      });
    }

    console.log(`Generating analysis for ${tabType} tab, period: ${period.quarter} ${period.year}`);

    // Generate prompt based on tab type and data
    const prompt = getAnalysisPrompt(tabType, data, period, targets, compareMode, comparisonData);

    // Call Claude API
    const analysis = await getClaudeAnalysis(prompt);

    console.log('Analysis generated successfully');

    res.json({
      analysis,
      tabType,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in analysis endpoint:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Dashboard API Server running on http://localhost:${PORT}`);
  console.log(`📊 Serving Excel file: ${EXCEL_FILE_PATH}`);
  console.log(`📡 File exists: ${fs.existsSync(EXCEL_FILE_PATH)}\n`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Please choose a different port.`);
  }
});

server.on('close', () => {
  console.log('Server closed');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close();
  process.exit(0);
});