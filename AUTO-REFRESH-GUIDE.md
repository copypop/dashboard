# 🔄 Auto-Refresh Dashboard Guide

## ✨ What's New

Your CAAT Dashboard now **automatically updates in real-time** when you modify the Excel file! No more manual uploads or page refreshes needed.

## 🚀 Quick Start

### One Command to Rule Them All:
```bash
npm run dashboard
```

This single command:
1. ✅ Starts the backend server (watches your Excel file)
2. ✅ Starts the frontend dashboard
3. ✅ Establishes real-time connection
4. ✅ Automatically refreshes when Excel changes

## 📊 How It Works

```
Excel File → File Watcher → WebSocket → Dashboard Updates
     ↑                                         ↓
     └──── You Edit Here              See Changes Instantly
```

1. **You edit** `CAAT_Dashboard_Data_2025.xlsx` in Excel
2. **Save the file** (Ctrl+S)
3. **Dashboard updates automatically** within 1-2 seconds
4. **No refresh needed!**

## 🎯 Features

### Real-Time Updates
- 🔄 **Automatic refresh** when Excel file changes
- 📡 **WebSocket connection** for instant updates
- 🟢 **Live connection indicator** in dashboard header
- ⏱️ **Last update timestamp** displayed

### Smart Monitoring
- 📁 Watches the Excel file for any changes
- 🛡️ Handles file locks (when Excel is open)
- 🔌 Auto-reconnects if connection drops
- ⚡ Efficient - only updates when file actually changes

### Connection Status Indicators
- 🟢 **Live** - Connected and monitoring
- 🔴 **Disconnected** - Connection lost (will auto-reconnect)
- 🔄 **Connecting...** - Establishing connection

## 📁 File Location

By default, the system looks for your Excel file at:
```
C:\dashboard\CAAT_Dashboard_Data_2025.xlsx
```

To change this location, edit `server.js` line 16:
```javascript
const EXCEL_FILE_PATH = path.join(path.dirname(__dirname), 'CAAT_Dashboard_Data_2025.xlsx');
```

## 🛠️ Manual Control

### Run Services Separately
If you prefer manual control:

**Terminal 1 - Backend Server:**
```bash
npm run server
```

**Terminal 2 - Frontend Dashboard:**
```bash
npm run dev
```

### Toggle Auto-Refresh
Click the **"Auto-refresh: ON/OFF"** button in the dashboard header to:
- **ON**: Dashboard updates automatically
- **OFF**: Dashboard won't update (manual mode)

## 📝 Workflow Example

1. **Morning:** Start dashboard with `npm run dashboard`
2. **Throughout the day:**
   - Open Excel file
   - Update your marketing metrics
   - Save (Ctrl+S)
   - See changes instantly in dashboard
   - Share insights with team
3. **End of day:** Close dashboard (Ctrl+C in terminal)

## 🔧 Troubleshooting

### Dashboard not updating?
1. Check connection indicator (should be green "Live")
2. Ensure Excel file is saved after changes
3. Verify file path in server console output
4. Check terminal for any error messages

### Excel file locked?
- The system handles file locks gracefully
- Updates will process once Excel releases the lock (on save)

### Connection keeps dropping?
- Check if Excel file exists at the specified path
- Ensure no antivirus is blocking file access
- Try restarting with `npm run dashboard`

## 📊 Best Practices

1. **Save frequently** in Excel to see updates
2. **Keep dashboard open** on a second monitor
3. **Use period selector** to analyze different quarters
4. **Check insights panel** for AI-powered recommendations
5. **Monitor connection status** for any issues

## 🎨 Dashboard URLs

- **Frontend Dashboard:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **API Status Check:** http://localhost:3001/api/status
- **Data Endpoint:** http://localhost:3001/api/dashboard-data

## 🚦 Server Console Messages

You'll see helpful messages in the terminal:
- `📊 Watching Excel file: [path]` - File monitoring active
- `📝 Excel file changed at [time]` - Change detected
- `✅ Data updated and broadcast to clients` - Update sent
- `👤 New client connected` - Dashboard connected
- `📨 Received update: data-update` - Update received

## 💡 Pro Tips

1. **Excel Auto-Save**: Enable auto-save in Excel for truly hands-free updates
2. **Multiple Dashboards**: Open multiple browser tabs - all update simultaneously
3. **Network Access**: Others on your network can view at `http://[your-ip]:5173`
4. **Performance**: Dashboard handles large Excel files efficiently

---

## 🎉 You're All Set!

Your dashboard now provides **real-time insights** without manual intervention. Edit your Excel data and watch your marketing metrics update instantly!

Need help? Check the terminal output for diagnostic messages or refer to the main README.md.