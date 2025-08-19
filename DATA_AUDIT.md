# 📊 CAAT Dashboard Data Audit & Validation Report

## Executive Summary
This document provides a comprehensive audit of all data calculations, aggregations, and transformations performed by the CAAT Dashboard application. Each metric is traced from its Excel source through to its final display value, ensuring complete transparency for data compliance review.

---

## 🔍 Data Source Information

### Excel File Structure
- **File**: `CAAT_Dashboard_Data_2025.xlsx`
- **Location**: `C:\dashboard\`
- **Sheets Used**:
  1. Config
  2. Website_Data
  3. Traffic_Sources
  4. Search_Data
  5. Social_Data
  6. Email_Data
  7. Leads_Data
  8. Targets
  9. Notes

### Data Update Mechanism
- **Real-time Monitoring**: File changes detected via `chokidar` file watcher
- **Parse Method**: SheetJS (xlsx) library
- **Update Frequency**: Immediate on file save (1-second debounce)
- **Transport**: WebSocket (ws://localhost:3001)

---

## 📈 Executive Summary Tab Calculations

### 1. Total Digital Reach
**Location**: `ExecutiveDashboard.tsx` lines 129-237

**Formula**:
```
Total Digital Reach = Unique Website Visitors + Social Media Reach + Email Recipients
```

**Detailed Calculation**:
```javascript
// Website unique visitors (filtered by period/year)
const totalVisitors = websiteData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);

// Social media impressions
const totalImpressions = socialData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.impressions || 0), 0);

// Email recipients (delivered emails)
const totalEmailsDelivered = emailData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.emailsDelivered || 0), 0);

// Total
const digitalReach = totalVisitors + totalImpressions + totalEmailsDelivered;
```

**Excel Source Columns**:
- `Website_Data.Unique_Visitors` (Column G)
- `Social_Data.Impressions` (Column I)
- `Email_Data.Emails_Delivered` (Column E)

### 2. Website Sessions
**Formula**:
```
Website Sessions = SUM(Website_Data.Sessions) for selected period
```

**Calculation**:
```javascript
const totalSessions = websiteData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.sessions || 0), 0);
```

**Excel Source**: `Website_Data.Sessions` (Column E)

### 3. Social Engagement Rate
**Formula**:
```
Engagement Rate = (Total Engagements ÷ Total Impressions) × 100
where Total Engagements = Reactions + Comments + Shares
```

**Calculation**:
```javascript
const totalEngagements = socialData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.reactions || 0) + (d.comments || 0) + (d.shares || 0), 0);

const totalImpressions = socialData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.impressions || 0), 0);

const socialEngagementRate = totalImpressions > 0 
  ? (totalEngagements / totalImpressions) * 100 
  : 0;
```

**Excel Source Columns**:
- `Social_Data.Impressions` (Column I)
- `Social_Data.Reactions` (Column M)
- `Social_Data.Comments` (Column N)
- `Social_Data.Shares` (Column O)

### 4. Email Open Rate
**Formula**:
```
Open Rate = (Unique Opens ÷ Emails Sent) × 100
```

**Calculation**:
```javascript
const totalEmailsSent = emailData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.emailsSent || 0), 0);

const totalUniqueOpens = emailData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);

const emailOpenRate = totalEmailsSent > 0 
  ? (totalUniqueOpens / totalEmailsSent) * 100 
  : 0;
```

**Excel Source Columns**:
- `Email_Data.Emails_Sent` (Column D)
- `Email_Data.Unique_Opens` (Column H)

### 5. New Leads Generated
**Formula**:
```
New Leads = SUM(Leads_Data.New_Marketing_Prospects) for selected period
```

**Calculation**:
```javascript
const newLeads = leadsData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
```

**Excel Source**: `Leads_Data.New_Marketing_Prospects` (Column D)

### 6. Marketing ROI
**Formula**:
```
ROI = ((Pipeline Value - Marketing Spend) ÷ Marketing Spend) × 100
```

**Calculation**:
```javascript
// Pipeline value from leads
const pipelineValue = leadsData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.pipelineValue || 0), 0);

// Marketing spend (social media budget)
const marketingSpend = socialData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.budget || 0), 0);

const roi = marketingSpend > 0 
  ? ((pipelineValue - marketingSpend) / marketingSpend) * 100 
  : 0;
```

**Excel Source Columns**:
- `Leads_Data.Pipeline_Value` (Column K)
- `Social_Data.Budget` (Column Q)

---

## 🌐 Website Analysis Tab Calculations

### Traffic Sources Breakdown
**Location**: `ExecutiveDashboard.tsx` lines 825-894

**Formula**:
```
Each Traffic Source % = (Source Sessions ÷ Total Sessions) × 100
where Source Sessions = Total Sessions × (Source Percentage from Excel)
```

**Calculation**:
```javascript
// Get percentages from Traffic_Sources sheet
const directPercent = trafficData.reduce((sum, d) => sum + (d.directTraffic || 0), 0) / trafficData.length;
const searchPercent = trafficData.reduce((sum, d) => sum + (d.searchEngines || 0), 0) / trafficData.length;
const socialPercent = trafficData.reduce((sum, d) => sum + (d.socialMedia || 0), 0) / trafficData.length;
const externalPercent = trafficData.reduce((sum, d) => sum + (d.externalReferrers || 0), 0) / trafficData.length;
const internalPercent = trafficData.reduce((sum, d) => sum + (d.internalReferrers || 0), 0) / trafficData.length;

// Calculate actual session numbers
const directSessions = Math.round(totalSessions * (directPercent / 100));
const searchSessions = Math.round(totalSessions * (searchPercent / 100));
// ... etc for each source
```

**Excel Source Columns**:
- `Traffic_Sources.Direct_Traffic` (Column D) - stored as percentage
- `Traffic_Sources.Search_Engines` (Column E) - stored as percentage
- `Traffic_Sources.Internal_Referrers` (Column F) - stored as percentage
- `Traffic_Sources.External_Referrers` (Column G) - stored as percentage
- `Traffic_Sources.Social_Media` (Column H) - stored as percentage

### Bounce Rate
**Formula**:
```
Bounce Rate = AVG(Website_Data.Bounce_Rate) for selected period
```

**Excel Source**: `Website_Data.Bounce_Rate` (Column J)

---

## 🔍 SEO & Search Tab Calculations

### Search Performance Metrics
**Location**: `ExecutiveDashboard.tsx` lines 1168-1320

### 1. Search Impressions
**Formula**:
```
Total Impressions = SUM(Search_Data.Impressions) for selected period
```

**Excel Source**: `Search_Data.Impressions` (Column D)

### 2. Click-Through Rate (CTR)
**Formula**:
```
CTR = (Total Clicks ÷ Total Impressions) × 100
```

**Calculation**:
```javascript
const totalImpressions = searchData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.impressions || 0), 0);

const totalClicks = searchData
  .filter(d => d.year === selectedYear && d.quarter === selectedQuarter)
  .reduce((sum, d) => sum + (d.clicks || 0), 0);

const ctr = totalImpressions > 0 
  ? (totalClicks / totalImpressions) * 100 
  : 0;
```

**Excel Source Columns**:
- `Search_Data.Impressions` (Column D)
- `Search_Data.Clicks` (Column E)

### 3. Average Position
**Formula**:
```
Avg Position = SUM(Search_Data.Avg_Position × Impressions) ÷ SUM(Impressions)
```

**Note**: Weighted average by impressions for accuracy

**Excel Source**: `Search_Data.Avg_Position` (Column G)

---

## 📱 Social Media Tab Calculations

### Platform Metrics Aggregation
**Location**: `ExecutiveDashboard.tsx` lines 1428-1650

### 1. Total Social Impressions
**Formula**:
```
Total Impressions = SUM(Social_Data.Impressions) for all platforms
```

### 2. Engagement Rate by Platform
**Formula**:
```
Platform Engagement Rate = (Platform Engagements ÷ Platform Impressions) × 100
where Engagements = Reactions + Comments + Shares + Clicks
```

**Platform Breakdown**:
```javascript
const platformData = socialData.reduce((acc, item) => {
  const platform = item.channel || 'Other';
  if (!acc[platform]) {
    acc[platform] = { impressions: 0, engagements: 0, clicks: 0 };
  }
  acc[platform].impressions += item.impressions || 0;
  acc[platform].engagements += (item.reactions || 0) + (item.comments || 0) + (item.shares || 0);
  acc[platform].clicks += item.clicks || 0;
  return acc;
}, {});
```

**Excel Source**: `Social_Data` sheet, grouped by Channel (Column E)

---

## 📧 Email Marketing Tab Calculations

### Email Performance Metrics
**Location**: `ExecutiveDashboard.tsx` lines 1701-1900

### 1. Open Rate
**Formula**:
```
Open Rate = (Unique Opens ÷ Emails Sent) × 100
```

### 2. Click Rate
**Formula**:
```
Click Rate = (Unique Clicks ÷ Emails Sent) × 100
```

### 3. Click-to-Open Rate (CTOR)
**Formula**:
```
CTOR = (Unique Clicks ÷ Unique Opens) × 100
```

### 4. Bounce Rate
**Formula**:
```
Bounce Rate = ((Hard Bounces + Soft Bounces) ÷ Emails Sent) × 100
```

**Excel Source Columns**:
- `Email_Data.Emails_Sent` (Column D)
- `Email_Data.Unique_Opens` (Column H)
- `Email_Data.Unique_Clicks` (Column K)
- `Email_Data.Hard_Bounces` (Column N)
- `Email_Data.Soft_Bounces` (Column O)

---

## 🎯 Lead Generation Tab Calculations

### Lead Funnel Metrics
**Location**: `ExecutiveDashboard.tsx` lines 1925-2090

### 1. Lead Conversion Funnel
**Formula**:
```
Stage Conversion Rate = (Next Stage Count ÷ Current Stage Count) × 100
```

**Stages**:
1. New Marketing Prospects → Assigned Prospects
2. Assigned Prospects → Active Prospects
3. Active Prospects → Marketing Qualified Leads (MQL)
4. MQL → Sales Accepted Leads (SAL)
5. SAL → Opportunities

**Calculation Example**:
```javascript
const mqRate = totalAssigned > 0 
  ? (totalMQL / totalAssigned) * 100 
  : 0;

const sqlRate = totalMQL > 0 
  ? (totalSQL / totalMQL) * 100 
  : 0;
```

### 2. Pipeline Value
**Formula**:
```
Total Pipeline = SUM(Leads_Data.Pipeline_Value) for selected period
```

**Excel Source**: `Leads_Data.Pipeline_Value` (Column K)

---

## 📊 Period Comparison Calculations

### Comparison Logic
**Location**: `ExecutiveDashboard.tsx` lines 134-200

### Period Determination
```javascript
if (compareType === 'prev_year') {
  // Previous Year Same Quarter
  previousQuarter = currentQuarter;
  previousYear = selectedYear - 1;
} else {
  // Previous Quarter
  previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                   currentQuarter === 'Q2' ? 'Q1' :
                   currentQuarter === 'Q3' ? 'Q2' : 'Q3';
  previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
}
```

### Trend Calculation
**For Volume Metrics** (Sessions, Leads, etc.):
```
Trend % = ((Current Value - Previous Value) ÷ Previous Value) × 100
```

**For Rate Metrics** (Open Rate, CTR, etc.):
```
Trend = Current Rate - Previous Rate (in percentage points)
```

---

## 🔢 Data Transformation Pipeline

### 1. Excel → JSON Transformation
**Location**: `server.js` lines 45-120

```javascript
// Read Excel file
const workbook = xlsx.readFile(EXCEL_FILE_PATH);

// Convert each sheet to JSON
const data = {};
sheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  data[sheetName] = xlsx.utils.sheet_to_json(worksheet);
});
```

### 2. JSON → TypeScript Models
**Location**: `dataService.ts` lines 131-288

```javascript
private transformApiData(apiData: any): DashboardData {
  return {
    websiteData: this.parseWebsiteData(apiData.Website_Data || []),
    trafficSources: this.parseTrafficSources(apiData.Traffic_Sources || []),
    searchData: this.parseSearchData(apiData.Search_Data || []),
    socialData: this.parseSocialData(apiData.Social_Data || []),
    emailData: this.parseEmailData(apiData.Email_Data || []),
    leadsData: this.parseLeadsData(apiData.Leads_Data || []),
    // ...
  };
}
```

### 3. Number Parsing
```javascript
private parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '' || isNaN(value)) {
    return null;
  }
  return Number(value);
}
```

---

## ✅ Data Validation Rules

### 1. Null/Empty Handling
- All numeric fields default to 0 if null/empty
- Prevents division by zero with conditional checks
- Example: `totalSessions > 0 ? calculation : 0`

### 2. Percentage Calculations
- All percentages capped at reasonable ranges
- No negative percentages for rates
- Example: `Math.max(0, Math.min(100, percentage))`

### 3. Date/Period Filtering
- Strict year and quarter matching
- Null quarter = full year aggregation
- Example: `d.year === selectedYear && (currentQuarter ? d.quarter === currentQuarter : true)`

### 4. Aggregation Methods
- **SUM**: Used for volumes (sessions, clicks, leads)
- **AVERAGE**: Used for rates when not calculating from totals
- **WEIGHTED AVERAGE**: Used for position metrics

---

## 🔍 Testing & Validation Checklist

### For Data Compliance Team

1. **Source Data Verification**
   - [ ] Verify Excel column mappings match this document
   - [ ] Confirm Excel formulas match dashboard calculations
   - [ ] Validate date/period filtering logic

2. **Calculation Verification**
   - [ ] Test each KPI calculation with known values
   - [ ] Verify percentage calculations sum to 100% where applicable
   - [ ] Confirm trend calculations are accurate

3. **Edge Cases**
   - [ ] Test with empty/null values
   - [ ] Test with zero denominators
   - [ ] Test with missing data periods

4. **Period Comparisons**
   - [ ] Verify Q1 previous quarter correctly shows Q4 of previous year
   - [ ] Confirm year-over-year comparisons use same quarter
   - [ ] Test full year vs quarterly aggregations

---

## 📝 Compliance Notes

### Data Refresh Rate
- **Real-time**: Updates within 1 second of Excel file save
- **No caching**: Always shows latest data from file
- **Automatic reconnection**: WebSocket reconnects if connection lost

### Data Integrity
- **No data modification**: Dashboard is read-only
- **Direct mapping**: No data interpolation or estimation
- **Transparent calculations**: All formulas visible in source code

### Audit Trail
- **File timestamps**: Last modified time tracked
- **WebSocket logs**: All data updates logged to console
- **Error handling**: Failed calculations return 0, not errors

---

## 📎 Appendix: Excel Sheet Structure

### Website_Data Columns
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| A | Year | Number | Calendar year |
| B | Quarter | Text | Q1, Q2, Q3, Q4 |
| C | Month | Number | 1-12 |
| D | Month_Name | Text | January-December |
| E | Sessions | Number | Total visits |
| F | Pageviews | Number | Total page views |
| G | Unique_Visitors | Number | Distinct users |
| H | Returning_Visitors | Number | Repeat users |
| J | Bounce_Rate | Number | Single page exits % |
| K | Avg_Session_Duration | Number | Seconds |

### Social_Data Columns
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| E | Channel | Text | Platform name |
| I | Impressions | Number | Times shown |
| M | Reactions | Number | Likes, hearts, etc |
| N | Comments | Number | User comments |
| O | Shares | Number | Reshares/retweets |
| L | Clicks | Number | Link clicks |
| P | Engagement_Rate | Number | Calculated % |
| Q | Budget | Number | Spend amount |

### Email_Data Columns
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| D | Emails_Sent | Number | Total sent |
| E | Emails_Delivered | Number | Reached inbox |
| H | Unique_Opens | Number | Distinct opens |
| K | Unique_Clicks | Number | Distinct clicks |
| N | Hard_Bounces | Number | Permanent failures |
| O | Soft_Bounces | Number | Temporary failures |

### Leads_Data Columns
| Column | Field | Type | Description |
|--------|-------|------|-------------|
| D | New_Marketing_Prospects | Number | New leads |
| E | Assigned_Prospects | Number | Assigned to sales |
| F | Active_Prospects | Number | Engaged leads |
| H | Marketing_Qualified | Number | MQLs |
| I | Sales_Accepted | Number | SALs |
| J | Opportunities | Number | Sales opportunities |
| K | Pipeline_Value | Number | Dollar value |

---

## 🤝 Contact for Questions

For technical questions about calculations:
- Review source code in `ExecutiveDashboard.tsx`
- Check `dataService.ts` for data transformation
- Examine `server.js` for Excel parsing

For data source questions:
- Verify Excel formulas in `CAAT_Dashboard_Data_2025.xlsx`
- Check sheet relationships and references
- Confirm column mappings with this document

---

*Document Generated: December 2024*
*Version: 1.0.0*
*Last Audit: Pending*