import Anthropic from '@anthropic-ai/sdk';
import { validateApiKey, checkRateLimit, validateAnalysisInput } from './auth.js';

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
    const anthropic = new Anthropic({
      apiKey: process.env.CLAUDE_API_KEY,
    });

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

export default async function handler(req, res) {
  // Set secure CORS headers - restrict to your domain in production
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://your-app.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check rate limiting
  const rateLimitCheck = checkRateLimit(req);
  if (!rateLimitCheck.allowed) {
    return res.status(429).json({ error: rateLimitCheck.error });
  }

  // Validate API key
  const apiKeyValidation = validateApiKey(req);
  if (!apiKeyValidation.valid) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: apiKeyValidation.error,
      hint: 'Include X-API-Key header or ?key= parameter'
    });
  }

  console.log('Analysis API call received...');

  try {
    const { tabType, data, period, targets, compareMode, comparisonData } = req.body;

    // Validate input
    const inputValidation = validateAnalysisInput(req.body);
    if (!inputValidation.valid) {
      return res.status(400).json({
        error: 'Invalid input',
        message: inputValidation.error
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

    return res.json({
      analysis,
      tabType,
      period,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in analysis API:', error);
    return res.status(500).json({
      error: 'Analysis generation failed',
      message: error.message
    });
  }
}