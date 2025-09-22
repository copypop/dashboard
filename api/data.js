import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Function to read and parse Excel file
function readExcelFile() {
  try {
    const EXCEL_FILE_PATH = path.join(process.cwd(), 'public', 'CAAT_Dashboard_Data_2025.xlsx');

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
      try {
        console.log(`Processing sheet: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length > 0) {
          // Convert to object format with first row as headers
          const headers = jsonData[0];
          const rows = jsonData.slice(1);

          data[sheetName] = rows.map(row => {
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = row[index];
            });
            return obj;
          });
        } else {
          data[sheetName] = [];
        }
      } catch (error) {
        console.error(`Error processing sheet ${sheetName}:`, error);
        data[sheetName] = [];
      }
    });

    return { data, lastModified };
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return null;
  }
}

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { endpoint } = req.query;

  try {
    if (endpoint === 'status') {
      // Status endpoint
      const EXCEL_FILE_PATH = path.join(process.cwd(), 'public', 'CAAT_Dashboard_Data_2025.xlsx');
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

      return res.json({
        fileExists,
        filePath: EXCEL_FILE_PATH,
        lastModified,
        hasData: fileExists
      });
    } else {
      // Default: dashboard-data endpoint
      console.log('API call received, attempting to read Excel file...');

      const result = readExcelFile();

      if (!result) {
        console.log('Failed to read Excel file');
        return res.status(404).json({
          error: 'Excel file not found or could not be read',
          message: 'Please ensure the Excel file exists in the public directory'
        });
      }

      console.log('Excel file read successfully, sending response...');
      return res.json({
        data: result.data,
        lastModified: result.lastModified,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error in API endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}