import * as XLSX from 'xlsx';
import type { DashboardData } from '../types/dashboard';

class DataService {
  private cachedData: DashboardData | null = null;
  private lastUpdateTime: Date | null = null;
  private dataChangeListeners: ((data: DashboardData) => void)[] = [];

  constructor() {
    // Try to load cached data from localStorage on init
    this.loadFromCache();
  }

  // Subscribe to data changes
  public onDataChange(callback: (data: DashboardData) => void): () => void {
    this.dataChangeListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.dataChangeListeners = this.dataChangeListeners.filter(cb => cb !== callback);
    };
  }

  // Notify all listeners of data change
  private notifyListeners(data: DashboardData) {
    this.dataChangeListeners.forEach(callback => callback(data));
  }

  // Get current data
  public getData(): DashboardData | null {
    console.log('getData called, returning:', this.cachedData ? 'data available' : 'no data');
    return this.cachedData;
  }

  // Get last update time
  public getLastUpdateTime(): Date | null {
    return this.lastUpdateTime;
  }

  // Load data from API server
  public async loadFromServer(): Promise<DashboardData | null> {
    try {
      console.log('Loading data from API server...');

      const response = await fetch('http://localhost:8000/api/dashboard-data');

      if (response.ok) {
        const result = await response.json();
        const transformedData = this.transformServerData(result.data);

        // Cache the data
        this.cachedData = transformedData;
        this.lastUpdateTime = new Date(result.lastModified);
        this.saveToCache();
        this.notifyListeners(transformedData);

        console.log('Data loaded successfully from API server');
        console.log('Transformed data structure:', {
          config: transformedData.config,
          websiteDataCount: transformedData.websiteData.length,
          hasTargets: transformedData.targets.length > 0
        });
        return transformedData;
      } else {
        console.error('Failed to load data from API server');
        return null;
      }
    } catch (error) {
      console.error('Error loading data from API server:', error);
      return null;
    }
  }

  // Load Excel file from user upload
  public async loadFromFile(file: File): Promise<DashboardData> {
    try {
      console.log('Loading Excel from uploaded file...');
      
      const arrayBuffer = await file.arrayBuffer();
      const data = this.parseExcelBuffer(arrayBuffer);
      
      // Cache the data
      this.cachedData = data;
      this.lastUpdateTime = new Date();
      this.saveToCache();
      this.notifyListeners(data);
      
      console.log('Excel loaded successfully from file upload');
      return data;
    } catch (error) {
      console.error('Error loading Excel file:', error);
      throw new Error('Failed to parse Excel file. Please ensure it is a valid Excel file.');
    }
  }

  // Parse Excel buffer and transform to DashboardData
  private parseExcelBuffer(arrayBuffer: ArrayBuffer): DashboardData {
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Convert each sheet to JSON
    const sheets: Record<string, any[]> = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });

    // Transform to our data structure
    return this.transformExcelData(sheets);
  }

  // Transform Excel data to match our TypeScript types
  private transformExcelData(sheets: Record<string, any[]>): DashboardData {
    return {
      config: this.parseConfig(sheets.Config || []),
      websiteData: this.parseWebsiteData(sheets.Website_Data || []),
      trafficSources: this.parseTrafficSources(sheets.Traffic_Sources || []),
      searchData: this.parseSearchData(sheets.Search_Data || []),
      socialData: this.parseSocialData(sheets.Social_Data || []),
      emailData: this.parseEmailData(sheets.Email_Data || []),
      leadsData: this.parseLeadsData(sheets.Leads_Data || []),
      shareOfVoiceData: this.parseShareOfVoiceData(sheets.Share_of_voice || []),
      targets: this.parseTargets(sheets.Targets || []),
      notes: this.parseNotes(sheets.Notes || [])
    };
  }

  // Transform server data to match our TypeScript types
  public transformServerData(serverData: Record<string, any[]>): DashboardData {
    return this.transformExcelData(serverData);
  }

  // Save data to localStorage
  private saveToCache() {
    if (!this.cachedData) return;
    
    try {
      const cacheData = {
        data: this.cachedData,
        timestamp: this.lastUpdateTime?.toISOString()
      };
      localStorage.setItem('caat_dashboard_data', JSON.stringify(cacheData));
      console.log('Data saved to cache');
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }

  // Load data from localStorage
  private loadFromCache() {
    try {
      const cached = localStorage.getItem('caat_dashboard_data');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        this.cachedData = data;
        this.lastUpdateTime = new Date(timestamp);
        console.log('Data loaded from cache:', this.lastUpdateTime);
      }
    } catch (error) {
      console.error('Error loading from cache:', error);
    }
  }

  // Clear cached data
  public clearCache() {
    this.cachedData = null;
    this.lastUpdateTime = null;
    localStorage.removeItem('caat_dashboard_data');
    console.log('Cache cleared');
  }

  // Refresh data from API server
  public async refresh(): Promise<DashboardData | null> {
    try {
      console.log('Refreshing data from API server...');

      const response = await fetch('http://localhost:8000/api/dashboard-data');

      if (response.ok) {
        const result = await response.json();
        const transformedData = this.transformServerData(result.data);

        // Cache the data
        this.cachedData = transformedData;
        this.lastUpdateTime = new Date(result.lastModified);
        this.saveToCache();
        this.notifyListeners(transformedData);

        console.log('Data refreshed successfully from API server');
        return transformedData;
      } else {
        console.error('Failed to fetch data from API server');
        return this.cachedData; // Return cached data if API fails
      }
    } catch (error) {
      console.error('Error refreshing data from API server:', error);
      return this.cachedData; // Return cached data if API fails
    }
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
      impressions: this.parseNumber(row.Impressions),
      clicks: this.parseNumber(row.Clicks),
      ctr: this.parseNumber(row.CTR),
      avgPosition: this.parseNumber(row.Avg_Position)
    }));
  }
  
  private parseSocialData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      channel: row.Channel,
      impressions: this.parseNumber(row.Impressions),
      engagements: this.parseNumber(row.Engagements),
      clicks: this.parseNumber(row.Clicks),
      reactions: this.parseNumber(row.Reactions),
      comments: this.parseNumber(row.Comments),
      shares: this.parseNumber(row.Shares),
      videoViews: this.parseNumber(row.Video_Views),
      postFrequency: this.parseNumber(row.Post_Frequency),
      engagementRate: this.parseNumber(row.Engagement_Rate),
      budget: this.parseNumber(row.Budget)
    }));
  }
  
  private parseEmailData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      emailsSent: this.parseNumber(row.Emails_Sent),
      emailsDelivered: this.parseNumber(row.Emails_Delivered),
      deliveryRate: this.parseNumber(row.Delivery_Rate),
      uniqueOpens: this.parseNumber(row.Unique_Opens),
      openRate: this.parseNumber(row.Open_Rate),
      uniqueClicks: this.parseNumber(row.Unique_Clicks),
      clickRate: this.parseNumber(row.Click_Rate),
      ctoRate: this.parseNumber(row.CTO_Rate),
      hardBounces: this.parseNumber(row.Hard_Bounces),
      softBounces: this.parseNumber(row.Soft_Bounces),
      unsubscribes: this.parseNumber(row.Unsubscribes),
      conversionRate: this.parseNumber(row.Conversion_Rate)
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
  
  private parseShareOfVoiceData(data: any[]): any[] {
    return data.map(row => ({
      year: Number(row.Year),
      quarter: row.Quarter,
      month: Number(row.Month),
      monthName: row.Month_Name,
      mediaMentionVolume: this.parseNumber(row.Media_Mention_Volume),
      mediaReachImpressions: this.parseNumber(row.Media_Reach_Impressions),
      socialMentions: this.parseNumber(row.SM_Mentions),
      competitor1Mentions: this.parseNumber(row.Competitor1_Mentions),
      competitor2Mentions: this.parseNumber(row.Competitor2_Mentions)
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