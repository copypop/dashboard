# CAAT Dashboard - Vercel Deployment Guide

This guide will help you deploy the CAAT Digital Marketing Dashboard to Vercel with full serverless functionality.

## 🚀 Quick Deployment

### Prerequisites
- [Vercel account](https://vercel.com) (free tier works)
- [GitHub account](https://github.com) (if deploying from repository)
- Claude API key from [Anthropic Console](https://console.anthropic.com/) (optional, for AI analysis)

### Option 1: Deploy from GitHub (Recommended)

1. **Push to GitHub Repository**
   ```bash
   git add .
   git commit -m "feat: Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it as a Vite project

3. **Configure Environment Variables**
   - In Vercel dashboard, go to Project Settings → Environment Variables
   - Add the following variables:
     ```
     VITE_DASHBOARD_PASSWORD_HASH=your_password_hash_here
     CLAUDE_API_KEY=your_claude_api_key_here
     NODE_ENV=production
     ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application

### Option 2: Deploy with Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_DASHBOARD_PASSWORD_HASH
   vercel env add CLAUDE_API_KEY
   vercel env add NODE_ENV
   ```

## 🔧 Configuration Details

### Files Created for Vercel

1. **`vercel.json`** - Main configuration file
   - Configures serverless functions
   - Sets up routing
   - Defines security headers
   - Specifies build commands

2. **`api/data.js`** - Serverless function for Excel data
   - Handles `/api/dashboard-data` endpoint
   - Handles `/api/status` endpoint
   - Reads Excel file from `public/` directory

3. **`api/analysis.js`** - Serverless function for AI analysis
   - Handles `/api/analyze` endpoint
   - Integrates with Claude API
   - Provides marketing insights

4. **`.env.example`** - Environment variables template

### Build Configuration

- **Build Command**: `npm run build:vercel` (bypasses TypeScript strict checking)
- **Output Directory**: `dist`
- **Node Runtime**: `nodejs18.x`

## 📊 Environment Variables

### Required Variables

1. **`VITE_DASHBOARD_PASSWORD_HASH`**
   - SHA-256 hash of your dashboard password
   - Generate at: https://emn178.github.io/online-tools/sha256.html
   - Example: `3d54ab3d23e0edd6ddbbfa445f377eb82fc3cedf40387f0d4170790cc25273b5`

2. **`NODE_ENV`**
   - Set to `production` for Vercel deployment

### Optional Variables

3. **`CLAUDE_API_KEY`**
   - Required only for AI analysis features
   - Get from: https://console.anthropic.com/
   - Format: `sk-ant-api03-...`

## 🏗️ Architecture

### Frontend (Static Files)
- React + TypeScript application
- Built with Vite
- Served from Vercel's global CDN
- All static assets cached automatically

### Backend (Serverless Functions)
- Two main API endpoints as serverless functions
- Automatic scaling based on usage
- Cold start optimization
- Excel file processing in `/public` directory

### Data Flow
```
Client → Vercel CDN (Frontend) → Serverless Functions → Excel File → Response
```

## 📁 File Structure

```
project/
├── api/                    # Vercel serverless functions
│   ├── data.js            # Excel data endpoints
│   └── analysis.js        # AI analysis endpoint
├── public/                 # Static assets + Excel file
│   └── CAAT_Dashboard_Data_2025.xlsx
├── src/                    # React application source
├── vercel.json            # Vercel configuration
├── .env.example           # Environment variables template
└── package.json           # Dependencies and scripts
```

## 🔒 Security

### Security Headers
Automatically configured in `vercel.json`:
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- CORS headers

### Data Security
- Excel file is served from Vercel's secure infrastructure
- Environment variables are encrypted at rest
- HTTPS enforced by default

## 🚀 Performance

### Optimizations
- **Global CDN**: Static files served from 40+ edge locations
- **Serverless Functions**: Auto-scaling based on demand
- **Caching**: Automatic caching of static assets
- **Compression**: Gzip/Brotli compression enabled

### Bundle Analysis
- Main bundle: ~1.6MB (gzipped: ~492KB)
- Consider code-splitting for future optimization

## 🔄 Updates and Maintenance

### Updating Data
1. Upload new Excel file to `/public` directory
2. Commit and push to GitHub
3. Vercel automatically redeploys

### Updating Code
1. Make changes locally
2. Test with `npm run build:vercel`
3. Commit and push to GitHub
4. Vercel automatically redeploys

### Environment Variable Updates
- Update via Vercel dashboard: Project Settings → Environment Variables
- Or use Vercel CLI: `vercel env add VARIABLE_NAME`

## 🐛 Troubleshooting

### Common Issues

**Build Failures**
- Check that `npm run build:vercel` works locally
- Verify all dependencies are in `package.json`
- Check Vercel build logs for specific errors

**API Endpoints Not Working**
- Verify environment variables are set correctly
- Check serverless function logs in Vercel dashboard
- Ensure Excel file exists in `/public` directory

**Excel File Not Found**
- File must be in `/public/CAAT_Dashboard_Data_2025.xlsx`
- Check file name spelling and case sensitivity
- Verify file was committed to repository

**AI Analysis Failing**
- Verify `CLAUDE_API_KEY` is set and valid
- Check API credits in Anthropic Console
- Review function logs for specific error messages

### Debugging Steps

1. **Check Vercel Functions Tab**
   - View real-time logs
   - Monitor function execution times
   - Check for errors

2. **Test API Endpoints**
   ```bash
   curl https://your-app.vercel.app/api/dashboard-data
   curl https://your-app.vercel.app/api/status
   ```

3. **Verify Environment Variables**
   - Go to Project Settings → Environment Variables
   - Ensure all required variables are set

## 📞 Support

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Claude API Support
- [Anthropic Documentation](https://docs.anthropic.com/)
- [Anthropic Console](https://console.anthropic.com/)

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] All environment variables are configured
- [ ] Excel file is in `/public` directory
- [ ] `npm run build:vercel` succeeds locally
- [ ] Git repository is pushed to GitHub
- [ ] Vercel project is connected to repository
- [ ] API endpoints tested and working
- [ ] Dashboard login tested with password hash

---

**Last Updated**: September 2025
**Version**: 1.3.0
**Status**: Production Ready