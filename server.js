import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chokidar from 'chokidar';
import { WebSocketServer } from 'ws';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Excel file path - UPDATE THIS TO YOUR EXCEL FILE LOCATION
const EXCEL_FILE_PATH = path.join(path.dirname(__dirname), 'CAAT_Dashboard_Data_2025.xlsx');

app.use(cors());
app.use(express.json());

// Store the latest data
let latestData = null;
let lastModified = null;

// Function to read and parse Excel file
function readExcelFile() {
  try {
    if (!fs.existsSync(EXCEL_FILE_PATH)) {
      console.log(`Excel file not found at: ${EXCEL_FILE_PATH}`);
      return null;
    }

    const stats = fs.statSync(EXCEL_FILE_PATH);
    lastModified = stats.mtime;

    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const data = {};

    // Parse each sheet
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      data[sheetName] = XLSX.utils.sheet_to_json(sheet);
    });

    console.log(`Excel file loaded successfully at ${new Date().toLocaleTimeString()}`);
    return data;
  } catch (error) {
    console.error('Error reading Excel file:', error);
    return null;
  }
}

// Initial load
latestData = readExcelFile();

// API endpoint to get the latest data
app.get('/api/dashboard-data', (req, res) => {
  if (!latestData) {
    return res.status(404).json({ 
      error: 'Excel file not found',
      path: EXCEL_FILE_PATH,
      message: 'Please ensure the Excel file exists at the specified location'
    });
  }

  res.json({
    data: latestData,
    lastModified: lastModified,
    timestamp: new Date().toISOString()
  });
});

// API endpoint to check file status
app.get('/api/status', (req, res) => {
  res.json({
    fileExists: fs.existsSync(EXCEL_FILE_PATH),
    filePath: EXCEL_FILE_PATH,
    lastModified: lastModified,
    hasData: latestData !== null
  });
});

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Dashboard API Server running on http://localhost:${PORT}`);
  console.log(`📊 Watching Excel file: ${EXCEL_FILE_PATH}`);
  console.log(`📡 File exists: ${fs.existsSync(EXCEL_FILE_PATH)}\n`);
});

// Set up WebSocket server for real-time updates
const wss = new WebSocketServer({ server });

// Broadcast function to send updates to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify(data));
    }
  });
}

// Watch the Excel file for changes
const watcher = chokidar.watch(EXCEL_FILE_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

watcher
  .on('change', () => {
    console.log(`📝 Excel file changed at ${new Date().toLocaleTimeString()}`);
    const newData = readExcelFile();
    
    if (newData) {
      latestData = newData;
      
      // Broadcast update to all connected clients
      broadcast({
        type: 'data-update',
        data: latestData,
        lastModified: lastModified,
        timestamp: new Date().toISOString()
      });
      
      console.log('✅ Data updated and broadcast to clients');
    }
  })
  .on('add', () => {
    console.log('📁 Excel file added');
    const newData = readExcelFile();
    if (newData) {
      latestData = newData;
      broadcast({
        type: 'file-added',
        data: latestData,
        lastModified: lastModified
      });
    }
  })
  .on('unlink', () => {
    console.log('❌ Excel file deleted');
    latestData = null;
    lastModified = null;
    broadcast({
      type: 'file-deleted'
    });
  })
  .on('error', error => {
    console.error('Watcher error:', error);
  });

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('👤 New client connected');
  
  // Send initial data to new client
  if (latestData) {
    ws.send(JSON.stringify({
      type: 'initial-data',
      data: latestData,
      lastModified: lastModified,
      timestamp: new Date().toISOString()
    }));
  }
  
  ws.on('close', () => {
    console.log('👤 Client disconnected');
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  watcher.close();
  wss.close();
  server.close();
  process.exit(0);
});