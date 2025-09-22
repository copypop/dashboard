# Event Marketing Integration - Technical Documentation

## Overview

The Event Marketing feature is a comprehensive integration that adds event performance tracking and analytics to the CAAT Digital Marketing Dashboard. This document outlines the technical implementation, data structure, and integration points.

## Architecture

### Component Structure
```
src/components/
├── ExecutiveDashboard.tsx          # Main dashboard with Events tab integration
├── charts/
│   └── EventsChart.tsx            # Event-specific chart component
└── ui/
    ├── AnalysisButton.tsx         # AI analysis button (currently disabled)
    └── AnalysisResults.tsx        # AI analysis results (currently disabled)
```

### Data Flow
```
Excel File (Events_Data sheet)
    ↓
dataService.parseEventsData()
    ↓
DashboardData.eventsData[]
    ↓
ExecutiveDashboard (period filtering)
    ↓
EventsChart (monthly aggregation & visualization)
```

## Data Structure

### EventsData Interface
```typescript
interface EventsData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  numberEvents: number | null;
  registered: number | null;
  attended: number | null;
  mql: number | null;            // Marketing Qualified Leads
  sal: number | null;            // Sales Accepted Leads
  opportunity: number | null;    // Sales Opportunities
  source: string | null;         // Event source/channel
}
```

### Excel Sheet Requirements

**Sheet Name**: `Events_Data`

**Required Columns**:
- `Year` (number): Event year
- `Quarter` (string): Quarter designation (Q1, Q2, Q3, Q4)
- `Month` (number): Month number (1-12)
- `Month_Name` (string): Month name (January, February, etc.)
- `Number_Events` (number): Count of events in that month
- `Registered` (number): Total registrations for events
- `Attended` (number): Total attendance for events
- `MQL` (number): Marketing Qualified Leads generated
- `SAL` (number): Sales Accepted Leads generated
- `Opportunity` (number): Sales opportunities created
- `Source` (string): Event source/channel (optional)

## Implementation Details

### 1. Data Service Integration

**File**: `src/services/dataService.ts`

```typescript
// Added to parseEventsData method
private parseEventsData(data: any[]): any[] {
  return data.map(row => ({
    year: Number(row.Year),
    quarter: row.Quarter,
    month: Number(row.Month),
    monthName: row.Month_Name,
    numberEvents: this.parseNumber(row.Number_Events),
    registered: this.parseNumber(row.Registered),
    attended: this.parseNumber(row.Attended),
    mql: this.parseNumber(row.MQL),
    sal: this.parseNumber(row.SAL),
    opportunity: this.parseNumber(row.Opportunity),
    source: row.Source || null
  }));
}

// Added to transformExcelData method
eventsData: this.parseEventsData(sheets.Events_Data || [])
```

### 2. Executive Dashboard Integration

**File**: `src/components/ExecutiveDashboard.tsx`

#### Tab Type Extension
```typescript
type TabType = 'overview' | 'website' | 'seo' | 'social' | 'email' | 'events' | 'leads' | 'sov' | 'quarterly' | 'yoy';
```

#### Event Registrations KPI
```typescript
// Added to Executive Summary KPIs
const eventRegistrations = data.eventsData
  ?.filter(d =>
    d.year === periodData.year &&
    (selectedPeriod === 'Year' || d.quarter === periodData.quarter)
  )
  ?.reduce((sum, d) => sum + (d.registered || 0), 0) || 0;
```

#### Navigation Menu
```typescript
// Added Events tab between Email and Leads
{ id: 'events', label: 'Event Marketing', icon: Activity },
```

#### Data Filtering Functions
```typescript
// Added to getTabSpecificData
case 'events':
  return data.eventsData.filter(d =>
    d.year === periodData.year &&
    (selectedPeriod === 'Year' || d.quarter === periodData.quarter)
  );

// Added to getComparisonData
case 'events':
  return data.eventsData.filter(d =>
    d.year === comparisonPeriod.year &&
    (selectedPeriod === 'Year' || d.quarter === comparisonPeriod.quarter)
  );
```

### 3. EventsChart Component

**File**: `src/components/charts/EventsChart.tsx`

#### Key Features
- **Monthly Aggregation**: Handles multiple events per month
- **Multiple Chart Types**: ComposedChart, BarChart, PieChart
- **Responsive Design**: Uses ResponsiveContainer for all charts
- **Custom Tooltips**: Formatted tooltips with proper number formatting
- **Period Filtering**: Supports both quarterly and full-year views
- **Comparison Support**: Full period-over-period comparison functionality
- **Trending Indicators**: Visual trend arrows and percentage changes

#### Monthly Aggregation Logic
```typescript
const monthlyAggregated = filteredData.reduce((acc, d) => {
  const monthKey = `${d.month}-${d.monthName}`;
  if (!acc[monthKey]) {
    acc[monthKey] = {
      month: d.month,
      monthName: d.monthName,
      events: 0,
      registered: 0,
      attended: 0,
      mql: 0,
      sal: 0,
      opportunity: 0
    };
  }

  acc[monthKey].events += d.numberEvents || 0;
  acc[monthKey].registered += d.registered || 0;
  acc[monthKey].attended += d.attended || 0;
  acc[monthKey].mql += d.mql || 0;
  acc[monthKey].sal += d.sal || 0;
  acc[monthKey].opportunity += d.opportunity || 0;

  return acc;
}, {} as Record<string, any>);
```

#### Chart Types

1. **Registration & Attendance Trends** (ComposedChart)
   - Area charts for registrations and attendance
   - Line chart for attendance rate percentage
   - Dual Y-axis for different value scales

2. **Lead Conversion Funnel** (BarChart)
   - Attended → MQL → SAL → Opportunities progression
   - Grouped bars for easy comparison

3. **Event Source Performance** (PieChart + Metrics)
   - Pie chart showing registration distribution by source
   - Detailed metrics table with source performance
   - Registration share changes with trending indicators

#### Comparison Features
When comparison mode is enabled, EventsChart provides comprehensive period-over-period analysis:

1. **Registration & Attendance Trends** (ComposedChart)
   - Current vs previous period area charts
   - Attendance rate comparison with separate line charts
   - Position-based matching for quarterly comparisons (Q1 Jan→Q4 Oct)
   - Month-name matching for yearly comparisons (Q1 Jan→Q1 Jan)

2. **Lead Conversion Funnel** (BarChart)
   - Side-by-side comparison bars for all conversion stages
   - Current period in primary colors, previous period with reduced opacity
   - Supports both Previous Quarter and Previous Year comparisons

3. **Event Source Performance** (Enhanced)
   - **Registration by Source**: Pie chart with trend summary below
   - **Source Performance Metrics**: Individual metric trends with arrows
   - **Trending Indicators**: ⬆️ Green for improvements, ⬇️ Red for declines
   - **Percentage Changes**: Exact change values with "pp" for percentage points

### 4. Period Filtering

**Enhanced Logic**: Supports both quarterly and full-year filtering
```typescript
const filteredData = data.filter(d => {
  if (period.quarter) {
    // Filter by specific quarter
    return d.quarter === period.quarter && d.year === period.year;
  } else {
    // Show all quarters for the year
    return d.year === period.year;
  }
});
```

## Color Scheme & Design

### Brand Colors
- Primary Blue: `#005C84`
- Secondary Green: `#55A51C`
- Accent Colors: `#FF6B6B`, `#FFB347`, `#87CEEB`, `#DDA0DD`, `#98FB98`

### Chart Styling
- Gradients for area charts
- Consistent color mapping across components
- Professional styling suitable for executive reporting

## Error Handling

### Data Validation
- Null checking for all numeric values
- Graceful handling of missing Events_Data sheet
- Default empty arrays when data is unavailable

### UI States
- "No event data available" message when data is missing
- Loading states during data fetching
- Error boundaries for chart rendering issues

## Performance Considerations

### Optimizations
- Monthly aggregation reduces chart complexity
- Memoized calculations for period filtering
- Efficient data transformation pipeline
- Responsive container sizing

### Memory Management
- Cleaned up data structures
- Proper React key props for list rendering
- Optimized re-rendering with dependency arrays

## Testing Recommendations

### Data Testing
1. **Empty Data**: Test with no Events_Data sheet
2. **Partial Data**: Test with some null values
3. **Multiple Events**: Test monthly aggregation with multiple events per month
4. **Period Filtering**: Test quarterly vs full-year filtering
5. **Source Variety**: Test with different event sources

### UI Testing
1. **Responsive Design**: Test on different screen sizes
2. **Chart Interactions**: Test tooltips and legends
3. **Period Switching**: Test tab persistence during period changes
4. **Data Updates**: Test refresh functionality

## Future Enhancements

### Planned Features
- ROI tracking when data becomes available
- Event attribution modeling
- Advanced filtering by event type/source
- Export functionality for event reports
- Real-time event registration tracking

### Technical Debt
- Consider extracting chart logic into reusable hooks
- Implement more sophisticated caching for large datasets
- Add unit tests for data transformation functions
- Consider virtualization for large event datasets

## Troubleshooting

### Common Issues

**Charts not displaying**:
- Check Events_Data sheet exists and has correct column names
- Verify data types match expected format (numbers vs strings)
- Check browser console for React rendering errors

**Duplicate month labels**:
- Ensure monthly aggregation is working correctly
- Check for malformed month data in Excel

**Period filtering issues**:
- Verify quarter values match expected format (Q1, Q2, Q3, Q4)
- Check year values are numeric

**Performance issues**:
- Consider data size - large datasets may need optimization
- Check for unnecessary re-renders in React DevTools

## Integration Checklist

- [x] EventsData TypeScript interface
- [x] parseEventsData method in dataService
- [x] Events tab in navigation
- [x] EventsChart component with multiple visualizations
- [x] Monthly aggregation logic
- [x] Period filtering support
- [x] Executive Summary KPI integration
- [x] Error handling and validation
- [x] Responsive design implementation
- [x] **Comparison functionality integration**
- [x] **Trending indicators with TrendingUp/Down icons**
- [x] **Position-based month matching for quarterly comparisons**
- [x] **Registration source performance comparison**
- [x] **Enhanced source metrics with trend arrows**
- [x] Documentation and changelog

---

**Last Updated**: September 22, 2025
**Version**: 1.3.0
**Status**: Production Ready with Enhanced Comparisons