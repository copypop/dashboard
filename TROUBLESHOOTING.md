# 🔧 Troubleshooting Guide

## Quick Diagnosis Flowchart

```
Dashboard Not Working?
        │
        ▼
    Servers Running? ──No──→ Start servers (npm run server & npm run dev)
        │Yes
        ▼
    Excel File Exists? ──No──→ Check file path C:\dashboard\CAAT_Dashboard_Data_2025.xlsx
        │Yes
        ▼
    Data Showing? ──No──→ Check Excel has data for selected period
        │Yes
        ▼
    Updates Working? ──No──→ Check WebSocket connection
        │Yes
        ▼
    ✅ All Good!
```

## Common Issues & Solutions

### 🔴 Issue: Dashboard Won't Start

#### Symptoms
- Blank page at http://localhost:5173
- "Cannot connect" error
- Page not loading

#### Solutions

1. **Check if servers are running**
   ```bash
   # Terminal 1
   cd C:\dashboard\caat-dashboard
   npm run server
   
   # Terminal 2
   cd C:\dashboard\caat-dashboard
   npm run dev
   ```

2. **Check for port conflicts**
   ```bash
   # Windows - Check if ports are in use
   netstat -ano | findstr :3001
   netstat -ano | findstr :5173
   
   # Kill process using the port (replace PID with actual number)
   taskkill /PID [PID] /F
   ```

3. **Reinstall dependencies**
   ```bash
   cd C:\dashboard\caat-dashboard
   npm install
   ```

### 🔴 Issue: Data Not Updating

#### Symptoms
- Excel changes not reflected
- "Disconnected" status
- Old data showing

#### Solutions

1. **Check server console for errors**
   - Look for "Excel file loaded successfully" message
   - Check for "EBUSY" errors (file locked)

2. **Close and save Excel properly**
   - Close Excel completely
   - Save file with Ctrl+S
   - Wait 2 seconds for update

3. **Verify file path**
   ```javascript
   // In server.js, check this line:
   const EXCEL_FILE_PATH = path.join(__dirname, '..', 'CAAT_Dashboard_Data_2025.xlsx');
   ```

4. **Force refresh**
   - Browser: Ctrl+F5
   - Clear cache: Ctrl+Shift+Delete

### 🔴 Issue: WebSocket Connection Failed

#### Symptoms
- Red dot in dashboard footer
- "WebSocket connection failed" in console
- No real-time updates

#### Solutions

1. **Check browser console** (F12)
   ```javascript
   // Run in console to test connection
   new WebSocket('ws://localhost:3001').onopen = () => console.log('Connected!');
   ```

2. **Restart both servers**
   ```bash
   # Stop servers (Ctrl+C in each terminal)
   # Then restart
   npm run server
   npm run dev
   ```

3. **Check firewall/antivirus**
   - Add exception for Node.js
   - Allow localhost connections
   - Temporarily disable to test

### 🔴 Issue: Excel File Errors

#### Symptoms
- "ENOENT: no such file or directory"
- "EBUSY: resource busy or locked"
- "Cannot read properties of undefined"

#### Solutions

1. **File not found (ENOENT)**
   - Verify file exists at `C:\dashboard\CAAT_Dashboard_Data_2025.xlsx`
   - Check file name spelling exactly
   - Ensure no extra spaces in name

2. **File locked (EBUSY)**
   - Close Excel completely
   - Check Task Manager for Excel processes
   - Try "Save As" with same name

3. **Corrupted file**
   - Open in Excel and re-save
   - Check for #REF! or #VALUE! errors
   - Remove special characters from data

### 🔴 Issue: Wrong Data Displayed

#### Symptoms
- Zeros showing for all metrics
- Wrong period data
- Missing metrics

#### Solutions

1. **Check period selection**
   - Verify correct quarter/year selected
   - Ensure Excel has data for that period

2. **Validate Excel structure**
   ```
   Required columns in Leads_Data:
   - Year, Quarter, Month, Month_Name
   - New_Marketing_Prospects
   - Marketing_Qualified
   - Sales_Accepted
   - Opportunities
   - Pipeline_Value
   ```

3. **Check data types**
   - Numbers should be numeric (not text)
   - Dates in correct format
   - No merged cells

### 🔴 Issue: Performance Problems

#### Symptoms
- Slow loading
- Laggy interactions
- High CPU usage

#### Solutions

1. **Optimize Excel file**
   - Remove unused sheets
   - Delete empty rows/columns
   - Limit to 10,000 rows max

2. **Clear browser cache**
   ```
   Chrome: Ctrl+Shift+Delete
   Select "Cached images and files"
   Clear data
   ```

3. **Close unnecessary tabs/apps**
   - Free up system memory
   - Close other Excel instances

4. **Use production build**
   ```bash
   npm run build
   npm run preview
   ```

## Error Messages Explained

### Server Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| `EADDRINUSE` | Port already in use | Kill existing process or change port |
| `ENOENT` | File not found | Check file path and name |
| `EBUSY` | File locked | Close Excel |
| `EACCES` | Permission denied | Run as administrator |
| `MODULE_NOT_FOUND` | Missing dependency | Run `npm install` |

### Client Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| `WebSocket connection failed` | Can't connect to server | Check server is running |
| `Cannot read property of null` | Data not loaded | Wait for data or refresh |
| `Invalid time value` | Date parsing error | Check date format in Excel |
| `Maximum update depth exceeded` | React render loop | Refresh page, check for data issues |

## Browser Console Debugging

### Useful Console Commands

```javascript
// Check WebSocket status
console.log(window.ws?.readyState);
// 0=CONNECTING, 1=OPEN, 2=CLOSING, 3=CLOSED

// View current data
console.log(window.dashboardData);

// Force reconnect
window.ws?.close();

// Check React version
console.log(React.version);

// View all errors
console.error();
```

### Network Tab Analysis

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "WS" for WebSocket
4. Check for:
   - Status: 101 (Switching Protocols) = Good
   - Messages being sent/received
   - Connection duration

## System Requirements Check

### Minimum Requirements

```bash
# Check Node version (should be 18+)
node --version

# Check npm version (should be 8+)
npm --version

# Check available memory
wmic OS get TotalVisibleMemorySize,FreePhysicalMemory

# Check disk space
fsutil volume diskfree c:
```

### Browser Compatibility

✅ **Supported Browsers:**
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

❌ **Not Supported:**
- Internet Explorer
- Older browser versions

## Advanced Troubleshooting

### Enable Debug Mode

1. **Server debug logging**
   ```javascript
   // In server.js, add:
   const DEBUG = true;
   if (DEBUG) console.log('Detailed logging...');
   ```

2. **Client debug mode**
   ```javascript
   // In dataService.ts, add:
   localStorage.setItem('debug', 'true');
   ```

### Network Diagnostics

```bash
# Test localhost connectivity
ping localhost

# Check port availability
netstat -an | findstr :3001
netstat -an | findstr :5173

# Trace network path
tracert localhost

# Check DNS
nslookup localhost
```

### File System Checks

```bash
# Check file permissions (Windows)
icacls "C:\dashboard\CAAT_Dashboard_Data_2025.xlsx"

# Check file attributes
attrib "C:\dashboard\CAAT_Dashboard_Data_2025.xlsx"

# Monitor file changes
fsutil file queryfileid "C:\dashboard\CAAT_Dashboard_Data_2025.xlsx"
```

## Recovery Procedures

### Complete Reset

1. **Stop all servers** (Ctrl+C)
2. **Clear everything**:
   ```bash
   # Clear node modules
   rm -rf node_modules
   rm package-lock.json
   
   # Clear build files
   rm -rf dist
   rm -rf .vite
   
   # Reinstall
   npm install
   ```

3. **Clear browser data**:
   - Settings → Privacy → Clear browsing data
   - Select all time
   - Clear data

4. **Restart everything**:
   ```bash
   npm run server
   npm run dev
   ```

### Data Recovery

If Excel file is corrupted:

1. **Check for backup**:
   - Look for `~$CAAT_Dashboard_Data_2025.xlsx`
   - Check Excel's AutoRecover folder

2. **Repair in Excel**:
   - Open Excel
   - File → Open → Browse
   - Select file → Open and Repair

3. **Export and recreate**:
   - Save as CSV
   - Create new Excel file
   - Import CSV data

## Logging & Monitoring

### Enable Comprehensive Logging

```javascript
// Add to server.js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Check Logs

```bash
# View server logs
type server.log

# View error logs
type error.log

# Monitor in real-time
tail -f server.log
```

## Getting Additional Help

### Before Contacting Support

1. ✓ Try all solutions in this guide
2. ✓ Document error messages (screenshots)
3. ✓ Note what you were doing when error occurred
4. ✓ Check if issue is reproducible
5. ✓ Gather system information

### Information to Provide

```
1. Error message (exact text)
2. Browser and version
3. Node.js version
4. Time of occurrence
5. Steps to reproduce
6. Screenshots of:
   - Browser console
   - Server console
   - Excel structure
```

### Support Channels

1. **Technical Issues**: IT Support
2. **Data Problems**: Data Team
3. **Feature Requests**: Development Team
4. **Training**: Team Lead

## Prevention Tips

### Daily Best Practices

1. **Start servers before opening dashboard**
2. **Save Excel file after changes**
3. **Close Excel when not editing**
4. **Keep one dashboard tab open**
5. **Monitor server console for errors**

### Weekly Maintenance

1. **Clear browser cache**
2. **Restart servers**
3. **Backup Excel file**
4. **Check for updates**
5. **Review error logs**

### Monthly Tasks

1. **Update dependencies**: `npm update`
2. **Clean node_modules**: Reinstall packages
3. **Archive old data**: Reduce Excel file size
4. **Test backup procedures**
5. **Review performance metrics**

---

**Emergency Contact**: If dashboard is critical and not working, contact IT Support immediately.

**Last Updated**: December 2024  
**Version**: 1.0.0