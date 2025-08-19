# 🏗️ CAAT Dashboard Architecture

## System Overview

The CAAT Dashboard is a modern, real-time analytics platform built with a microservices-inspired architecture, separating concerns between data monitoring, processing, and presentation layers.

```
┌─────────────────────────────────────────────────────────────┐
│                     Excel Data Source                        │
│                 (CAAT_Dashboard_Data_2025.xlsx)             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   File Watcher Service                       │
│                      (server.js)                            │
│  - Chokidar File Monitoring                                 │
│  - SheetJS Excel Parsing                                    │
│  - WebSocket Server (ws)                                    │
│  - Express HTTP API                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Application                         │
│                  (TypeScript + Vite)                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Data Service Layer                      │   │
│  │            (dataService.ts)                         │   │
│  │  - WebSocket Client                                 │   │
│  │  - Auto-reconnection                                │   │
│  │  - Data Transformation                              │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │           State Management (Zustand)                │   │
│  │         (dashboardStore.ts)                        │   │
│  └──────────────────┬──────────────────────────────────┘   │
│                     │                                        │
│  ┌──────────────────▼──────────────────────────────────┐   │
│  │          Component Layer                            │   │
│  │  - ExecutiveDashboard (Main Container)             │   │
│  │  - Chart Components (Recharts)                     │   │
│  │  - UI Components (Tailwind)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Backend Technologies
- **Node.js**: Runtime environment
- **Express**: HTTP server framework
- **WebSocket (ws)**: Real-time communication
- **Chokidar**: File system watcher
- **SheetJS (xlsx)**: Excel file parsing
- **CORS**: Cross-origin resource sharing

### Frontend Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS v3**: Utility-first styling
- **Recharts**: Data visualization
- **Zustand**: State management
- **Lucide React**: Icon library

## Core Components

### 1. File Watcher Service (`server.js`)

**Responsibilities:**
- Monitor Excel file for changes
- Parse Excel data into JSON
- Broadcast updates to all connected clients
- Handle file locking and errors gracefully

**Key Features:**
```javascript
// File watching with debouncing
const watcher = chokidar.watch(EXCEL_FILE_PATH, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 1000,
    pollInterval: 100
  }
});

// WebSocket broadcasting
wss.on('connection', (ws) => {
  clients.add(ws);
  ws.send(JSON.stringify({ 
    type: 'connected', 
    data: lastKnownData 
  }));
});
```

### 2. Data Service Layer (`src/services/dataService.ts`)

**Responsibilities:**
- Manage WebSocket connection lifecycle
- Transform raw data to TypeScript interfaces
- Implement reconnection logic
- Provide observable data stream

**Key Features:**
```typescript
class DataService {
  private ws: WebSocket | null = null;
  private subscribers: Set<DataSubscriber> = new Set();
  private reconnectAttempts = 0;
  
  connect(onData: DataCallback, onStatus: StatusCallback) {
    // Exponential backoff reconnection
    const reconnectDelay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempts), 
      30000
    );
  }
}
```

### 3. Dashboard Components

#### ExecutiveDashboard (`src/components/ExecutiveDashboard.tsx`)
**Main container component that:**
- Manages period selection (Q1-Q4, Year)
- Handles tab navigation
- Subscribes to real-time data updates
- Maintains UI state during updates

#### Chart Components (`src/components/charts/`)
- **WebsiteChart**: Traffic and engagement metrics
- **SocialMediaChart**: Platform-specific analytics
- **EmailChart**: Campaign performance
- **RadarChart**: Cross-channel comparison
- **DualAxisChart**: Trend analysis
- **FunnelChart**: Lead conversion visualization

#### UI Components (`src/components/ui/`)
- **PerformanceBadge**: Status indicators
- **MetricCard**: KPI display
- **LoadingSkeleton**: Loading states

## Data Flow

### 1. Excel → Server
```
Excel File Modified
    ↓
Chokidar Detects Change
    ↓
SheetJS Parses Excel
    ↓
Transform to JSON
    ↓
Validate Data Structure
    ↓
Broadcast via WebSocket
```

### 2. Server → Client
```
WebSocket Message Received
    ↓
Data Service Processes
    ↓
Type Validation
    ↓
State Update (Zustand)
    ↓
React Re-render
    ↓
UI Updates
```

### 3. User Interaction
```
User Selects Period (Q1-Q4)
    ↓
State Update
    ↓
Data Filtering
    ↓
Recalculate Metrics
    ↓
Update Visualizations
```

## Data Structures

### Excel Sheet Structure
```typescript
interface ExcelStructure {
  Config: ConfigSheet;
  Website_Data: WebsiteDataSheet[];
  Traffic_Sources: TrafficSourceSheet[];
  Social_Data: SocialDataSheet[];
  Email_Data: EmailDataSheet[];
  Leads_Data: LeadsDataSheet[];
  Targets: TargetsSheet[];
}
```

### Dashboard Data Model
```typescript
interface DashboardData {
  config: Config;
  websiteData: WebsiteData[];
  trafficSources: TrafficSource[];
  socialData: SocialData[];
  emailData: EmailData[];
  leadsData: LeadsData[];
  targets: Target[];
}
```

## State Management

### Zustand Store Structure
```typescript
interface DashboardStore {
  // Data
  data: DashboardData | null;
  
  // UI State
  selectedPeriod: PeriodType;
  selectedYear: number;
  activeTab: TabType;
  
  // Connection State
  connectionStatus: ConnectionStatus;
  lastUpdate: Date;
  
  // Actions
  setData: (data: DashboardData) => void;
  setPeriod: (period: PeriodType) => void;
  setYear: (year: number) => void;
}
```

## Performance Optimizations

### 1. Component Memoization
```typescript
const ChartComponent = React.memo(({ data }) => {
  // Prevents unnecessary re-renders
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data;
});
```

### 2. Data Aggregation
```typescript
const kpis = useMemo(() => {
  // Expensive calculations cached
  return calculateKPIs(data, selectedPeriod);
}, [data, selectedPeriod]);
```

### 3. WebSocket Optimization
- Binary data compression for large datasets
- Debounced file watching (1-second threshold)
- Single broadcast to all clients

### 4. Lazy Loading
- Chart components loaded on-demand
- Tab content rendered only when active

## Security Considerations

### Current Implementation
- **Local-only access**: Server binds to localhost
- **No authentication**: Designed for internal use
- **Read-only operations**: No data modification

### Production Recommendations
1. **Add Authentication Layer**
   ```typescript
   app.use(authMiddleware);
   ws.use(wsAuthMiddleware);
   ```

2. **Implement HTTPS**
   ```typescript
   const server = https.createServer(credentials, app);
   ```

3. **Rate Limiting**
   ```typescript
   app.use(rateLimit({ windowMs: 60000, max: 100 }));
   ```

4. **Input Validation**
   ```typescript
   const validateExcelData = (data) => {
     // Sanitize and validate all inputs
   };
   ```

## Deployment Architecture

### Development Environment
```
Local Machine
├── Excel File (C:\dashboard\)
├── Node Server (localhost:3001)
└── React App (localhost:5173)
```

### Production Environment
```
Server Infrastructure
├── File Storage (Network Drive / Cloud)
├── Node Server (Docker Container)
├── React App (CDN / Static Hosting)
└── Load Balancer (Optional)
```

## Scalability Considerations

### Horizontal Scaling
- WebSocket server can be scaled with Redis pub/sub
- Multiple file watchers with distributed locking
- CDN for static assets

### Vertical Scaling
- Increase Node.js memory limit for large Excel files
- Optimize Excel parsing with streaming
- Implement data pagination for large datasets

## Monitoring & Logging

### Metrics to Track
- WebSocket connection count
- File update frequency
- Data parsing time
- Client reconnection rate
- Error frequency

### Logging Strategy
```typescript
// Server-side logging
console.log(`[${timestamp}] ${event} - ${details}`);

// Client-side logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}
```

## Testing Strategy

### Unit Tests
- Data transformation functions
- Metric calculations
- Component rendering

### Integration Tests
- WebSocket connection
- File watching
- End-to-end data flow

### Performance Tests
- Large Excel file handling
- Multiple concurrent connections
- Memory leak detection

## Future Enhancements

### Planned Features
1. **Database Integration**: Store historical data
2. **User Authentication**: Multi-user support
3. **Custom Dashboards**: User-configurable layouts
4. **Export Functionality**: PDF/PNG reports
5. **Mobile App**: Native mobile experience
6. **API Gateway**: RESTful API for third-party integration

### Technical Improvements
1. **GraphQL API**: More efficient data fetching
2. **Server-Sent Events**: Alternative to WebSocket
3. **Worker Threads**: Parallel Excel processing
4. **Redis Cache**: Improved performance
5. **Kubernetes Deployment**: Container orchestration

## Maintenance Guidelines

### Regular Tasks
1. **Update Dependencies**: Monthly security patches
2. **Monitor Performance**: Weekly metrics review
3. **Backup Excel Files**: Daily automated backups
4. **Clear Logs**: Monthly log rotation
5. **Test Failover**: Quarterly disaster recovery

### Troubleshooting Checklist
1. ✓ Server running on correct port
2. ✓ Excel file accessible
3. ✓ WebSocket connection established
4. ✓ Data structure matches interface
5. ✓ Client-side console errors

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintained By**: CAAT Development Team