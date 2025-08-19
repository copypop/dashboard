# 📖 CAAT Dashboard Usage Guide

## For Marketing Team Members

This guide will help you navigate and use the CAAT Digital Marketing Dashboard effectively to monitor performance, track KPIs, and make data-driven decisions.

## 🚀 Getting Started

### Starting the Dashboard

1. **Open Terminal/Command Prompt**
2. **Navigate to the dashboard folder**:
   ```bash
   cd C:\dashboard\caat-dashboard
   ```
3. **Start the servers** (two terminals needed):
   
   Terminal 1:
   ```bash
   npm run server
   ```
   
   Terminal 2:
   ```bash
   npm run dev
   ```

4. **Open your browser** and go to: `http://localhost:5173`

## 🎯 Dashboard Navigation

### Main Navigation Bar

Located at the top of the dashboard with gradient CAAT branding (blue to green).

#### Period Selectors
Click to view data for different time periods:
- **Q1**: January - March data
- **Q2**: April - June data
- **Q3**: July - September data
- **Q4**: October - December data
- **Year**: Full year aggregate data

#### Year Selector
- Use the dropdown to switch between years (2023, 2024, 2025)
- Default shows current year

#### Comparison Toggle
- **Toggle ON**: Shows period-over-period comparisons
- **Toggle OFF**: Shows current period only
- Select comparison type: Previous Quarter, Previous Year, or Custom

### Dashboard Tabs

Navigate between different marketing channels using the tabs below the header:

1. **📊 Executive Summary**
   - Overall KPIs and trends
   - Perfect for management reports

2. **🌐 Website Analytics**
   - Traffic, sessions, and user behavior
   - Traffic sources breakdown

3. **📱 Social Media**
   - Platform-specific metrics
   - Engagement rates and impressions

4. **✉️ Email Marketing**
   - Campaign performance
   - Open rates and click-through rates

5. **🎯 Leads & Pipeline**
   - Lead generation funnel
   - Conversion rates

6. **📈 Trends & Insights**
   - Cross-channel performance
   - Strategic recommendations

7. **📊 Quarterly Analysis**
   - Quarter-over-quarter comparisons
   - Detailed performance tables

8. **📈 Year-over-Year**
   - Annual performance trends
   - YoY growth metrics

## 📊 Understanding the Metrics

### KPI Cards (Executive Summary)

Each KPI card shows:
```
┌─────────────────────────┐
│ METRIC NAME             │
│ 125.4K  ← Current Value │
│ ↑ 12.5% vs Q4  ← Trend  │
│ ─────────────           │
│ Q4 2024: 111.5K ← Prev  │
└─────────────────────────┘
```

**Color Coding:**
- 🟢 **Green**: Positive growth/above target
- 🔴 **Red**: Negative growth/below target
- 🟡 **Yellow**: Warning/needs attention
- 🔵 **Blue**: Neutral/informational

### Performance Badges

Look for these status indicators:
- **EXCELLENT**: Exceeding targets significantly
- **GROWING**: Positive momentum
- **GOOD**: Meeting expectations
- **STABLE**: No significant change
- **WARNING**: Below target
- **DECLINING**: Negative trend
- **CRITICAL**: Requires immediate attention

## 📈 Working with Charts

### Interactive Features

1. **Hover for Details**: Hover over any data point to see exact values
2. **Legend Toggle**: Click legend items to show/hide data series
3. **Time Range**: Charts update automatically based on selected period

### Chart Types Explained

#### Line Charts
- Show trends over time
- Good for identifying patterns

#### Bar Charts
- Compare values across categories
- Useful for channel comparisons

#### Radar Charts
- Cross-channel performance at a glance
- Shows strengths and weaknesses

#### Funnel Charts
- Lead conversion visualization
- Identifies bottlenecks

## 📝 Updating Data

### How to Update Dashboard Data

1. **Open the Excel file**: `C:\dashboard\CAAT_Dashboard_Data_2025.xlsx`

2. **Make your changes** in the appropriate sheet:
   - Website_Data: Website metrics
   - Social_Data: Social media metrics
   - Email_Data: Email campaign data
   - Leads_Data: Lead generation data

3. **Save the file** (Ctrl+S)

4. **Watch the magic happen**: Dashboard updates automatically within 2 seconds!

### Excel Data Entry Guidelines

#### Date Fields
- **Year**: 4-digit year (e.g., 2025)
- **Quarter**: Q1, Q2, Q3, or Q4
- **Month**: 1-12
- **Month_Name**: January, February, etc.

#### Numeric Fields
- Enter numbers only (no commas or symbols)
- Use decimals for percentages (0.75 for 75%)
- Leave blank for missing data (not zero)

#### Text Fields
- Keep channel names consistent
- Use standard platform names (LinkedIn, Twitter/X, Facebook)

## 🎨 Dashboard Features

### Real-Time Updates
- **Green dot** in footer = Connected
- **Red dot** in footer = Disconnected
- **Last updated** timestamp shows freshness

### Export Options
- Click **Export Report** to download data
- Available formats: PDF (coming soon)

### Responsive Design
- Works on desktop, tablet, and mobile
- Automatically adjusts layout

## 💡 Tips & Best Practices

### For Daily Use

1. **Morning Check**: Start with Executive Summary
2. **Deep Dive**: Use specific tabs for detailed analysis
3. **Compare Periods**: Toggle comparisons for context
4. **Monitor Trends**: Focus on direction, not just numbers

### For Reporting

1. **Quarter-End Reviews**:
   - Select the completed quarter
   - Enable comparisons
   - Screenshot KPI cards for presentations

2. **Monthly Updates**:
   - Check Trends & Insights tab
   - Note recommendations
   - Track against targets

3. **Executive Briefings**:
   - Use Executive Summary
   - Focus on YoY comparisons
   - Highlight exceptional metrics

### Data Quality

1. **Regular Updates**: Update Excel weekly/monthly
2. **Consistent Format**: Maintain column names
3. **Validate Numbers**: Check for outliers
4. **Document Changes**: Use Notes sheet

## 🔍 Common Scenarios

### Scenario 1: Monthly Performance Review
1. Select current month's quarter
2. Review Executive Summary KPIs
3. Check each channel tab
4. Note areas needing attention
5. Export/screenshot for reports

### Scenario 2: Campaign Analysis
1. Navigate to Email Marketing tab
2. Select campaign period
3. Compare with previous campaign
4. Analyze open/click rates
5. Check lead generation impact

### Scenario 3: Social Media Audit
1. Go to Social Media tab
2. Review platform breakdown
3. Identify best-performing channels
4. Check engagement trends
5. Plan content strategy

### Scenario 4: Website Traffic Analysis
1. Open Website Analytics
2. Check traffic sources
3. Monitor bounce rates
4. Analyze visitor trends
5. Identify optimization opportunities

## ⚙️ Customization Options

### Adjusting Views

While most customization requires code changes, you can:

1. **Filter by Period**: Use quarter/year selectors
2. **Toggle Comparisons**: Show/hide previous period data
3. **Switch Tabs**: Focus on specific channels
4. **Zoom Browser**: Ctrl + Mouse Wheel to adjust size

## 🆘 Getting Help

### Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard won't load | Check if both servers are running |
| Data not updating | Save Excel file, check file path |
| Wrong data showing | Verify Excel data and period selection |
| Slow performance | Close other applications, clear browser cache |

### Support Resources

1. **Technical Issues**: Contact IT support
2. **Data Questions**: Reach out to data team
3. **Training Needs**: Schedule team workshop
4. **Feature Requests**: Submit via feedback form

## 📚 Glossary

**Bounce Rate**: Percentage of single-page sessions  
**CTR**: Click-through rate  
**CTOR**: Click-to-open rate  
**Engagement Rate**: (Reactions + Comments + Shares) / Impressions  
**MQL**: Marketing Qualified Lead  
**SAL**: Sales Accepted Lead  
**Pipeline Value**: Total value of opportunities  
**Conversion Rate**: Percentage completing desired action  
**Session**: Group of user interactions within time frame  
**Unique Visitors**: Individual users (deduplicated)  

## 🎯 Key Performance Indicators

### Website KPIs
- Sessions: Total website visits
- Unique Visitors: Individual users
- Pageviews: Total pages viewed
- Bounce Rate: Single-page session %
- Avg Session Duration: Time on site

### Social Media KPIs
- Impressions: Times content displayed
- Engagement Rate: Interaction percentage
- Clicks: Link clicks
- CTR: Click-through rate
- Reactions: Likes, loves, etc.

### Email Marketing KPIs
- Open Rate: Emails opened / sent
- Click Rate: Links clicked / sent
- CTOR: Clicks / opens
- Bounce Rate: Undelivered emails
- Unsubscribe Rate: Opt-outs

### Lead Generation KPIs
- New Prospects: Fresh leads
- MQL: Marketing qualified
- SAL: Sales accepted
- Opportunities: Active deals
- Conversion Rate: Stage-to-stage %

## 🎉 Advanced Features

### Keyboard Shortcuts
- **F5**: Refresh dashboard
- **F11**: Full screen mode
- **Ctrl+F**: Search page
- **Esc**: Exit full screen

### Browser Tips
- Bookmark the dashboard URL
- Pin the tab for easy access
- Use multiple windows for comparisons
- Enable notifications for updates

---

**Pro Tip**: Keep the dashboard open during marketing meetings for real-time data reference!

**Last Updated**: December 2024  
**Version**: 1.0.0  
**For**: CAAT Marketing Team