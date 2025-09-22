import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 8000;

// Excel file path - UPDATE THIS TO YOUR EXCEL FILE LOCATION
const EXCEL_FILE_PATH = path.join(__dirname, 'public', 'CAAT_Dashboard_Data_2025.xlsx');

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