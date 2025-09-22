# CAAT Digital Marketing Dashboard

A comprehensive digital marketing analytics dashboard for CAAT Pension Plan. This executive dashboard provides insights into website performance, social media engagement, email marketing effectiveness, and lead generation metrics with monthly data updates.

## 🚀 Features

### Simplified Data Integration
- **Server-Based Data Loading**: Serves `CAAT_Dashboard_Data_2025.xlsx` via REST API
- **Monthly Data Updates**: Dashboard loads fresh data from Excel file when refreshed
- **Simple Architecture**: Clean separation between data storage and visualization
- **No Upload Required**: Data is read directly from Excel file on server

### Interactive Dashboard Components
- **Dynamic Period Selection**: Switch between Q1, Q2, Q3, Q4, and full Year views
- **Smart Comparisons**: Automatic period-over-period comparisons
- **Multi-Tab Interface**: Organized views for different marketing channels
- **AI-Powered Analysis**: Claude-powered marketing insights on every tab
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Dashboard Tabs
- **Executive Summary**: KPIs, trends, and quarterly performance including Event Registrations
- **Website Analytics**: Sessions, pageviews, bounce rates, traffic sources
- **SEO & Search**: Search impressions, clicks, CTR, average position
- **Social Media**: Platform metrics, engagement rates, impressions
- **Email Marketing**: Campaign performance, open rates, click rates
- **Event Marketing**: Registration rates, attendance tracking, lead conversion funnel, event source analysis
- **Leads & Pipeline**: Funnel visualization, conversion tracking
- **Share of Voice**: Market position ranking, competitor comparison
- **Quarterly Analysis**: Cross-platform quarterly summary
- **Year-over-Year**: Annual comparison across all channels

**Note**: AI analysis features are currently disabled. To re-enable, uncomment the analysis code and configure an AI API provider (Claude or GPT).

## 📋 Prerequisites

- Node.js 18+ installed
- Excel file: `CAAT_Dashboard_Data_2025.xlsx` in parent directory (`C:\dashboard\`)
- Claude API key from Anthropic (for AI analysis features)

## 🛠️ Installation & Running

### Quick Start

1. **Install dependencies**:
```bash
npm install
```

2. **Start the API server** (Terminal 1):
```bash
npm run server
```

3. **Start the development server** (Terminal 2):
```bash
npm run dev
```

4. **Open your browser** to [http://localhost:5173](http://localhost:5173)

## 📊 Excel File Structure

Your Excel file should contain the following sheets:

### Required Sheets:
- **Config**: Dashboard configuration and metadata
- **Website_Data**: Website analytics metrics
- **Traffic_Sources**: Traffic channel distribution
- **Targets**: Quarterly and annual targets

### Optional Sheets:
- **Search_Data**: SEO and search metrics
- **Social_Data**: Social media performance
- **Email_Data**: Email campaign metrics
- **Events_Data**: Event marketing metrics (registrations, attendance, lead conversion)
- **Leads_Data**: Lead generation metrics
- **Share_of_voice**: Media mentions and competitor analysis
- **Notes**: Important notes and context

## 🎯 Usage

1. **Start Servers**: Run both the API server and development server
2. **Update Excel File**: Place `CAAT_Dashboard_Data_2025.xlsx` in the parent directory
3. **Select Period**: Use the period selector to choose quarter and year
4. **Navigate Tabs**: Explore different sections (Overview, Website, Traffic, etc.)
5. **Compare Periods**: Enable comparison mode to analyze period-over-period trends
6. **Refresh Data**: Click the refresh button to load updated Excel data

### 📊 Comparison Features

The dashboard now includes comprehensive period-over-period comparison functionality:

#### **Leads & Pipeline Tab**
- **Lead Generation Funnel**: Shows current vs previous period metrics with trend indicators
- **Conversion Rates**: Period-over-period comparison for all conversion metrics
- **Pipeline Summary**: Trend analysis for pipeline value, opportunities, and sales metrics

#### **Share of Voice Tab**
- **Market Position Ranking**: Dynamic period-over-period share of voice changes
- **Competitor Comparison Chart**: Side-by-side current vs previous period comparison
- **SOV Percentage Card**: Trend indicators and previous period display

#### **Comparison Controls**
- Toggle comparison mode on/off globally
- Choose between "Previous Quarter" or "Previous Year" comparison
- Automatic calculation of appropriate previous periods
- Color-coded trend indicators (green=up, red=down, gray=neutral)

### 🤖 AI Analysis Features (Currently Disabled)

**Status**: AI analysis features are temporarily disabled due to API credit limitations.

#### **Re-enabling AI Analysis**
To restore AI analysis functionality:

1. **Choose AI Provider**:
   - Option A: Purchase Claude API credits at [Anthropic Console](https://console.anthropic.com/)
   - Option B: Switch to GPT API by updating server.js configuration

2. **Uncomment Analysis Code**:
   - Remove comment blocks (`//` and `/* */`) from analysis-related code in `src/components/ExecutiveDashboard.tsx`
   - Restore imports for `AnalysisButton` and `AnalysisResults` components

3. **Configure Environment**: Add `CLAUDE_API_KEY=your_api_key_here` to your `.env` file

4. **Test Functionality**: Both API server and development server must be running

#### **AI Analysis Capabilities (When Enabled)**
- **Executive Summary**: Overall performance across all channels with strategic recommendations
- **Website Analytics**: Traffic patterns, user behavior, bounce rate analysis, and acquisition optimization
- **SEO & Search**: Search visibility trends, keyword performance, and organic growth opportunities
- **Social Media**: Engagement analysis, channel performance, content effectiveness, and audience insights
- **Email Marketing**: Campaign performance, deliverability analysis, and segmentation recommendations
- **Event Marketing**: Event performance analysis, registration trends, and lead quality assessment
- **Leads & Pipeline**: Lead quality assessment, conversion funnel optimization, and sales insights
- **Share of Voice**: Competitive positioning, market share analysis, and brand mention trends
- **Quarterly Analysis**: Cross-channel performance summary and quarterly goal assessment
- **Year-over-Year**: Annual growth patterns, seasonal trends, and long-term strategic insights

#### **Analysis Features**
- **Tab-Specific Analysis**: Each dashboard tab includes analysis capabilities
- **CAAT Context-Aware**: AI understands CAAT Pension Plan's business context
- **Data-Driven Insights**: Analysis based on actual dashboard data for the selected period
- **Performance vs Targets**: Compares metrics against quarterly targets when available
- **Executive-Level Output**: Suitable for marketing leadership and stakeholders

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Backend API**: Express.js server
- **AI Integration**: Claude 3.5 Sonnet via Anthropic SDK
- **State Management**: Zustand
- **UI Components**: Custom components inspired by shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Excel Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Environment Management**: dotenv

## 📁 Project Structure

```
caat-dashboard/
├── src/
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── charts/       # Chart components
│   │   └── ...           # Feature components
│   ├── services/         # Business logic services
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main application component
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Adding New Metrics

1. Update the TypeScript types in `src/types/dashboard.ts`
2. Modify the Excel parser in `src/utils/dataProcessor.ts`
3. Create or update chart components in `src/components/charts/`
4. Add insights logic in `src/services/insightService.ts`

## 🐛 Troubleshooting

### Common Issues

**Excel file not loading:**
- Ensure file format is .xlsx or .xls
- Check that sheet names match exactly (case-sensitive)
- Verify data structure matches expected format

**Charts not displaying:**
- Check browser console for errors
- Ensure data contains valid numeric values
- Verify period selection has data

**Build errors:**
- Run `npm install` to ensure all dependencies are installed
- Clear node_modules and reinstall if needed
- Check Node.js version (18+ required)

**AI Analysis not working:**
- **Current Status**: AI analysis is temporarily disabled (commented out)
- To re-enable: Uncomment analysis code in `ExecutiveDashboard.tsx`
- Ensure `CLAUDE_API_KEY` is set in `.env` file or switch to GPT API
- Verify API key is valid and has sufficient credits
- Check that both servers are running (dev server + API server)
- Look for errors in browser console or server logs

## 📈 Data Quality Guidelines

- **No Hallucinations**: System only displays actual data from Excel
- **Transparent Metrics**: All calculations are clearly defined
- **Missing Data Handling**: Graceful handling of null/empty values
- **Data Validation**: Input validation prevents corrupt data issues

## 🔐 Security

- Data is processed on local server (localhost)
- No data is sent to external servers
- Excel files are read directly from local filesystem
- Secure local development environment

## 📝 License

Internal use only - CAAT Growth Marketing Team

## 🤝 Support

For issues or questions, contact the development team or check the internal documentation.

---

Built with ❤️ for the CAAT Growth Marketing Team