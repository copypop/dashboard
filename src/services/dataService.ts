import type { DashboardData } from '../types/dashboard';

const API_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

export interface DataUpdate {
  type: 'data-update' | 'file-added' | 'file-deleted' | 'initial-data';
  data?: any;
  lastModified?: string;
  timestamp?: string;
}

export class DataService {
  private ws: WebSocket | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private onDataUpdateCallback: ((data: DashboardData) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;
  
  // Fetch initial data from API
  async fetchData(): Promise<DashboardData | null> {
    try {
      const response = await fetch(`${API_URL}/api/dashboard-data`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to fetch data:', error);
        throw new Error(error.message || 'Failed to fetch data');
      }
      
      const result = await response.json();
      return this.transformApiData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }
  
  // Check server status
  async checkStatus(): Promise<{
    fileExists: boolean;
    filePath: string;
    lastModified: string | null;
    hasData: boolean;
  }> {
    try {
      const response = await fetch(`${API_URL}/api/status`);
      return await response.json();
    } catch (error) {
      console.error('Error checking status:', error);
      throw error;
    }
  }
  
  // Connect to WebSocket for real-time updates
  connect(
    onDataUpdate: (data: DashboardData) => void,
    onStatusChange?: (status: string) => void
  ) {
    this.onDataUpdateCallback = onDataUpdate;
    this.onStatusChangeCallback = onStatusChange || null;
    
    this.ws = new WebSocket(WS_URL);
    
    this.ws.onopen = () => {
      console.log('✅ Connected to real-time data updates');
      this.onStatusChangeCallback?.('connected');
      
      // Clear any reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };
    
    this.ws.onmessage = (event) => {
      try {
        const update: DataUpdate = JSON.parse(event.data);
        console.log('📨 Received update:', update.type);
        
        switch (update.type) {
          case 'data-update':
          case 'initial-data':
          case 'file-added':
            if (update.data) {
              const transformedData = this.transformApiData(update.data);
              this.onDataUpdateCallback?.(transformedData);
              this.onStatusChangeCallback?.('updated');
            }
            break;
            
          case 'file-deleted':
            this.onStatusChangeCallback?.('file-deleted');
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
      this.onStatusChangeCallback?.('error');
    };
    
    this.ws.onclose = () => {
      console.log('🔌 WebSocket connection closed');
      this.onStatusChangeCallback?.('disconnected');
      
      // Attempt to reconnect after 5 seconds
      this.reconnectTimeout = setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        this.connect(onDataUpdate, onStatusChange);
      }, 5000);
    };
  }
  
  // Disconnect WebSocket
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  // Transform API data to match our TypeScript types
  private transformApiData(apiData: any): DashboardData {
    return {
      config: this.parseConfig(apiData.Config || []),
      websiteData: this.parseWebsiteData(apiData.Website_Data || []),
      trafficSources: this.parseTrafficSources(apiData.Traffic_Sources || []),
      searchData: this.parseSearchData(apiData.Search_Data || []),
      socialData: this.parseSocialData(apiData.Social_Data || []),
      emailData: this.parseEmailData(apiData.Email_Data || []),
      leadsData: this.parseLeadsData(apiData.Leads_Data || []),
      targets: this.parseTargets(apiData.Targets || []),
      notes: this.parseNotes(apiData.Notes || [])
    };
  }
  
  private parseConfig(data: any[]): any {
    const config: any = {};
    data.forEach((row: any) => {
      if (row.Setting === 'Last_Updated') config.lastUpdated = row.Value;
      if (row.Setting === 'Current_Quarter') config.currentQuarter = row.Value;
      if (row.Setting === 'Current_Year') config.currentYear = Number(row.Value);
    });
    return config;
  }
  
  private parseWebsiteData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      sessions: this.parseNumber(row.Sessions),
      pageviews: this.parseNumber(row.Pageviews),
      uniqueVisitors: this.parseNumber(row.Unique_Visitors),
      returningVisitors: this.parseNumber(row.Returning_Visitors),
      bounceRate: this.parseNumber(row.Bounce_Rate),
      avgSessionDuration: this.parseNumber(row.Avg_Session_Duration),
      downloadsPDFs: this.parseNumber(row.Downloads_PDFs),
      videoViews: this.parseNumber(row.Video_Views),
      sourceQuality: row.Source_Quality || null
    }));
  }
  
  private parseTrafficSources(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      directTraffic: this.parseNumber(row.Direct_Traffic) || 0,
      searchEngines: this.parseNumber(row.Search_Engines) || 0,
      internalReferrers: this.parseNumber(row.Internal_Referrers) || 0,
      externalReferrers: this.parseNumber(row.External_Referrers) || 0,
      socialMedia: this.parseNumber(row.Social_Media) || 0
    }));
  }
  
  private parseSearchData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      impressions: this.parseNumber(row.Impressions) || 0,
      clicks: this.parseNumber(row.Clicks) || 0,
      ctr: this.parseNumber(row.CTR) || 0,
      avgPosition: this.parseNumber(row.Avg_Position) || 0,
      source: row.Source || null
    }));
  }
  
  private parseSocialData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      channel: row.Channel || null,
      type: row.Type || null,
      impressions: this.parseNumber(row.Impressions),
      views: this.parseNumber(row.Views),
      clicks: this.parseNumber(row.Clicks),
      ctr: this.parseNumber(row.CTR),
      reactions: this.parseNumber(row.Reactions),
      comments: this.parseNumber(row.Comments),
      shares: this.parseNumber(row.Shares),
      engagementRate: this.parseNumber(row.Engagement_Rate),
      budget: this.parseNumber(row.Budget),
      cpc: this.parseNumber(row.CPC)
    }));
  }
  
  private parseEmailData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      campaignType: row.Campaign_Type || null,
      emailsSent: this.parseNumber(row.Emails_Sent),
      emailsDelivered: this.parseNumber(row.Emails_Delivered),
      totalOpens: this.parseNumber(row.Total_Opens),
      uniqueOpens: this.parseNumber(row.Unique_Opens),
      openRate: this.parseNumber(row.Open_Rate),
      totalClicks: this.parseNumber(row.Total_Clicks),
      uniqueClicks: this.parseNumber(row.Unique_Clicks),
      ctr: this.parseNumber(row.CTR),
      ctor: this.parseNumber(row.CTOR),
      hardBounces: this.parseNumber(row.Hard_Bounces),
      softBounces: this.parseNumber(row.Soft_Bounces),
      bounceRate: this.parseNumber(row.Bounce_Rate),
      unsubscribes: this.parseNumber(row.Unsubscribes)
    }));
  }
  
  private parseLeadsData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      newMarketingProspects: this.parseNumber(row.New_Marketing_Prospects),
      assignedProspects: this.parseNumber(row.Assigned_Prospects),
      activeProspects: this.parseNumber(row.Active_Prospects),
      unsubscribedProspects: this.parseNumber(row.Unsubscribed_Prospects),
      marketingQualified: this.parseNumber(row.Marketing_Qualified),
      salesAccepted: this.parseNumber(row.Sales_Accepted),
      opportunities: this.parseNumber(row.Opportunities),
      pipelineValue: this.parseNumber(row.Pipeline_Value)
    }));
  }
  
  private parseTargets(data: any[]): any[] {
    return data.map(row => ({
      metricCategory: row.Metric_Category,
      metricName: row.Metric_Name,
      q1Target: this.parseNumber(row.Q1_Target) || 0,
      q2Target: this.parseNumber(row.Q2_Target) || 0,
      q3Target: this.parseNumber(row.Q3_Target) || 0,
      q4Target: this.parseNumber(row.Q4_Target) || 0,
      annualTarget: this.parseNumber(row.Annual_Target) || 0,
      notes: row.Notes || ''
    }));
  }
  
  private parseNotes(data: any[]): any[] {
    return data.map(row => ({
      date: row.Date,
      category: row.Category,
      note: row.Note
    }));
  }
  
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
      return null;
    }
    return Number(value);
  }
}

// Singleton instance
export const dataService = new DataService();