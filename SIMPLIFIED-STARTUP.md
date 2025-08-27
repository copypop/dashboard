# 🚀 CAAT Dashboard - Simplified Startup Guide

## Quick Start (One Command!)

```bash
cd C:\dashboard\caat-dashboard
npm run dev
```

That's it! The dashboard will start at http://localhost:5173

No backend server needed anymore! 🎉

## How It Works Now

### 1. **Automatic Data Loading**
- Dashboard tries to load Excel from `/public/CAAT_Dashboard_Data_2025.xlsx`
- If found, data loads automatically
- If not found, shows upload prompt

### 2. **Manual Upload Option**
- Click "Upload Excel" button in footer
- Select your Excel file
- Data loads and is cached in browser

### 3. **Data Caching**
- Data automatically saved to browser's localStorage
- Survives page refreshes
- Works offline after initial load

### 4. **Refresh Data**
- Click "Refresh Data" button to reload from public folder
- Updates cache with latest data

## File Locations

```
C:\dashboard\
├── CAAT_Dashboard_Data_2025.xlsx    (Original Excel file)
└── caat-dashboard\
    ├── public\
    │   └── CAAT_Dashboard_Data_2025.xlsx  (Auto-load location)
    └── src\
        └── ... (React app files)
```

## Features

### ✅ No Backend Required
- Removed WebSocket server dependency
- No need to run `node server.js`
- Single process architecture

### 🔒 More Secure
- No open ports (was 3001)
- No network vulnerabilities
- Data stays in browser

### 📁 Flexible Data Loading
1. **Automatic**: Place Excel in public folder
2. **Upload**: Use file picker to upload
3. **Cached**: Uses last loaded data

### 🔄 Data Management
- **Refresh Data**: Reload from public folder
- **Upload Excel**: Load new file anytime
- **Clear Cache**: Reset all stored data

## Updating Data

### Option 1: Public Folder (Recommended)
1. Replace file at `caat-dashboard\public\CAAT_Dashboard_Data_2025.xlsx`
2. Click "Refresh Data" in dashboard

### Option 2: Upload
1. Click "Upload Excel" in footer
2. Select updated Excel file
3. Data loads immediately

## Deployment

### For Local Use
```bash
npm run build
npm run preview
```

### For SharePoint/Web Server
1. Build: `npm run build`
2. Upload contents of `dist` folder
3. Place Excel in same directory

## Benefits of New Architecture

| Old (WebSocket) | New (Simplified) |
|----------------|------------------|
| 2 processes needed | 1 process only |
| Complex setup | Simple setup |
| Real-time monitoring | On-demand refresh |
| Security concerns | More secure |
| Network dependent | Works offline |

## Troubleshooting

### Data Not Loading?
1. Check Excel file is in `public` folder
2. Check file name matches exactly
3. Try "Upload Excel" button

### Need Fresh Data?
1. Click "Refresh Data" button
2. Or upload new file

### Clear Everything?
1. Click "Clear Cache" button
2. Reload page
3. Upload fresh Excel

## Development Tips

### Auto-Load on Dev Start
Excel file in public folder loads automatically when you run `npm run dev`

### Testing Different Files
Use "Upload Excel" to quickly test different data files without moving them to public folder

### Performance
Data cached in localStorage for instant subsequent loads

---

## Summary

The dashboard is now **simpler, faster, and more secure**:
- ✅ One command to start
- ✅ No backend server
- ✅ Automatic caching
- ✅ Works offline
- ✅ Easy data updates

Just run `npm run dev` and go! 🚀