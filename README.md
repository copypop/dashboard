# CAAT Digital Marketing Dashboard

A modern, AI-powered digital marketing performance dashboard for the CAAT growth marketing team.

## 🚀 Features

- **Dynamic Data Loading**: Upload Excel files to instantly visualize your marketing data
- **AI-Powered Insights**: Smart analysis with forward-thinking recommendations
- **Real-time Visualizations**: Interactive charts using Recharts
- **Period Comparisons**: Quarter-over-quarter and year-over-year analysis
- **Target Tracking**: Monitor performance against quarterly and annual goals
- **Multi-channel Analytics**: Website, traffic sources, social media, email, and leads
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Error Resilience**: Smart fallbacks and comprehensive error handling

## 📋 Prerequisites

- Node.js 18+ installed
- Your Excel data file: `CAAT_Dashboard_Data_2025.xlsx`

## 🛠️ Installation

1. Clone or navigate to the project directory:
```bash
cd caat-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to [http://localhost:5173](http://localhost:5173)

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
- **Leads_Data**: Lead generation metrics
- **Notes**: Important notes and context

## 🎯 Usage

1. **Upload Data**: Click the upload area and select your Excel file
2. **Select Period**: Use the period selector to choose quarter and year
3. **Navigate Tabs**: Explore different sections (Overview, Website, Traffic, etc.)
4. **View Insights**: Check the AI Insights panel for recommendations
5. **Compare Periods**: Enable comparison mode to analyze trends

## 🏗️ Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **UI Components**: Custom components inspired by shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Excel Processing**: SheetJS (xlsx)
- **Icons**: Lucide React
- **Date Handling**: date-fns

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

## 📈 Data Quality Guidelines

- **No Hallucinations**: System only displays actual data from Excel
- **Transparent Metrics**: All calculations are clearly defined
- **Missing Data Handling**: Graceful handling of null/empty values
- **Data Validation**: Input validation prevents corrupt data issues

## 🔐 Security

- All data processing happens client-side
- No data is sent to external servers
- Excel files are processed in-browser
- Sensitive information should be excluded from uploads

## 📝 License

Internal use only - CAAT Growth Marketing Team

## 🤝 Support

For issues or questions, contact the development team or check the internal documentation.

---

Built with ❤️ for the CAAT Growth Marketing Team