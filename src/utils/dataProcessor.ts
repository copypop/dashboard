import * as XLSX from 'xlsx';
import type {
  DashboardData,
  WebsiteData,
  TrafficSource,
  SearchData,
  SocialData,
  EmailData,
  EventsData,
  LeadsData,
  Target,
  Config,
  Note
} from '../types/dashboard';

export class DataProcessor {
  static async parseExcelFile(file: File): Promise<DashboardData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });

          const dashboardData: DashboardData = {
            config: this.parseConfig(workbook),
            websiteData: this.parseWebsiteData(workbook),
            trafficSources: this.parseTrafficSources(workbook),
            searchData: this.parseSearchData(workbook),
            socialData: this.parseSocialData(workbook),
            emailData: this.parseEmailData(workbook),
            eventsData: this.parseEventsData(workbook),
            leadsData: this.parseLeadsData(workbook),
            shareOfVoiceData: [], // Add empty array for now
            targets: this.parseTargets(workbook),
            notes: this.parseNotes(workbook)
          };

          resolve(dashboardData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  static transformServerData(serverData: Record<string, any[]>): DashboardData {
    console.log('DataProcessor - serverData keys:', Object.keys(serverData));
    console.log('DataProcessor - Events_Data length:', serverData.Events_Data?.length || 0);
    console.log('DataProcessor - Events_Data sample:', serverData.Events_Data?.slice(0, 2));

    const eventsData = this.parseEventsDataFromJSON(serverData.Events_Data || []);
    console.log('DataProcessor - parsed eventsData length:', eventsData.length);
    console.log('DataProcessor - parsed eventsData sample:', eventsData.slice(0, 2));

    return {
      config: this.parseConfigFromJSON(serverData.Config || []),
      websiteData: this.parseWebsiteDataFromJSON(serverData.Website_Data || []),
      trafficSources: this.parseTrafficSourcesFromJSON(serverData.Traffic_Sources || []),
      searchData: this.parseSearchDataFromJSON(serverData.Search_Data || []),
      socialData: this.parseSocialDataFromJSON(serverData.Social_Data || []),
      emailData: this.parseEmailDataFromJSON(serverData.Email_Data || []),
      eventsData: eventsData,
      leadsData: this.parseLeadsDataFromJSON(serverData.Leads_Data || []),
      shareOfVoiceData: this.parseShareOfVoiceDataFromJSON(serverData.Share_of_voice || []),
      targets: this.parseTargetsFromJSON(serverData.Targets || []),
      notes: this.parseNotesFromJSON(serverData.Notes || [])
    };
  }
  
  private static parseConfig(workbook: XLSX.WorkBook): Config {
    const sheet = workbook.Sheets['Config'];
    if (!sheet) throw new Error('Config sheet not found');
    
    const json = XLSX.utils.sheet_to_json(sheet);
    const config: any = {};
    
    (json as any[]).forEach((row: any) => {
      if (row.Setting === 'Last_Updated') config.lastUpdated = row.Value;
      if (row.Setting === 'Current_Quarter') config.currentQuarter = row.Value;
      if (row.Setting === 'Current_Year') config.currentYear = Number(row.Value);
    });
    
    return config as Config;
  }
  
  private static parseWebsiteData(workbook: XLSX.WorkBook): WebsiteData[] {
    const sheet = workbook.Sheets['Website_Data'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      sessions: this.parseNumber(row['Sessions']),
      pageviews: this.parseNumber(row['Pageviews']),
      uniqueVisitors: this.parseNumber(row['Unique_Visitors']),
      returningVisitors: this.parseNumber(row['Returning_Visitors']),
      bounceRate: this.parseNumber(row['Bounce_Rate']),
      avgSessionDuration: this.parseNumber(row['Avg_Session_Duration']),
      downloadsPDFs: this.parseNumber(row['Downloads_PDFs']),
      videoViews: this.parseNumber(row['Video_Views']),
      sourceQuality: row['Source_Quality'] || null
    }));
  }
  
  private static parseTrafficSources(workbook: XLSX.WorkBook): TrafficSource[] {
    const sheet = workbook.Sheets['Traffic_Sources'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      directTraffic: this.parseNumber(row['Direct_Traffic']) || 0,
      searchEngines: this.parseNumber(row['Search_Engines']) || 0,
      internalReferrers: this.parseNumber(row['Internal_Referrers']) || 0,
      externalReferrers: this.parseNumber(row['External_Referrers']) || 0,
      socialMedia: this.parseNumber(row['Social_Media']) || 0
    }));
  }
  
  private static parseSearchData(workbook: XLSX.WorkBook): SearchData[] {
    const sheet = workbook.Sheets['Search_Data'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      impressions: this.parseNumber(row['Impressions']) || 0,
      clicks: this.parseNumber(row['Clicks']) || 0,
      ctr: this.parseNumber(row['CTR']) || 0,
      avgPosition: this.parseNumber(row['Avg_Position']) || 0,
      source: row['Source'] || null
    }));
  }
  
  private static parseSocialData(workbook: XLSX.WorkBook): SocialData[] {
    const sheet = workbook.Sheets['Social_Data'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      channel: row['Channel'] || null,
      type: row['Type'] || null,
      impressions: this.parseNumber(row['Impressions']),
      views: this.parseNumber(row['Views']),
      clicks: this.parseNumber(row['Clicks']),
      ctr: this.parseNumber(row['CTR']),
      reactions: this.parseNumber(row['Reactions']),
      comments: this.parseNumber(row['Comments']),
      shares: this.parseNumber(row['Shares']),
      engagementRate: this.parseNumber(row['Engagement_Rate']),
      budget: this.parseNumber(row['Budget']),
      cpc: this.parseNumber(row['CPC'])
    }));
  }
  
  private static parseEmailData(workbook: XLSX.WorkBook): EmailData[] {
    const sheet = workbook.Sheets['Email_Data'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      campaignType: row['Campaign_Type'] || null,
      emailsSent: this.parseNumber(row['Emails_Sent']),
      emailsDelivered: this.parseNumber(row['Emails_Delivered']),
      totalOpens: this.parseNumber(row['Total_Opens']),
      uniqueOpens: this.parseNumber(row['Unique_Opens']),
      openRate: this.parseNumber(row['Open_Rate']),
      totalClicks: this.parseNumber(row['Total_Clicks']),
      uniqueClicks: this.parseNumber(row['Unique_Clicks']),
      ctr: this.parseNumber(row['CTR']),
      ctor: this.parseNumber(row['CTOR']),
      hardBounces: this.parseNumber(row['Hard_Bounces']),
      softBounces: this.parseNumber(row['Soft_Bounces']),
      bounceRate: this.parseNumber(row['Bounce_Rate']),
      unsubscribes: this.parseNumber(row['Unsubscribes'])
    }));
  }

  private static parseEventsData(workbook: XLSX.WorkBook): EventsData[] {
    const sheet = workbook.Sheets['Events_Data'];
    if (!sheet) return [];

    const json = XLSX.utils.sheet_to_json(sheet);

    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      numberEvents: this.parseNumber(row['Number_Events']),
      registered: this.parseNumber(row['Registered']),
      attended: this.parseNumber(row['Attended']),
      mql: this.parseNumber(row['MQL']),
      sal: this.parseNumber(row['SAL']),
      opportunity: this.parseNumber(row['Opportunity']),
      source: row['Source'] || null
    }));
  }

  private static parseLeadsData(workbook: XLSX.WorkBook): LeadsData[] {
    const sheet = workbook.Sheets['Leads_Data'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      year: Number(row['Year']),
      quarter: row['Quarter'],
      month: Number(row['Month']),
      monthName: row['Month_Name'],
      newMarketingProspects: this.parseNumber(row['New_Marketing_Prospects']),
      assignedProspects: this.parseNumber(row['Assigned_Prospects']),
      activeProspects: this.parseNumber(row['Active_Prospects']),
      unsubscribedProspects: this.parseNumber(row['Unsubscribed_Prospects']),
      marketingQualified: this.parseNumber(row['Marketing_Qualified']),
      salesAccepted: this.parseNumber(row['Sales_Accepted']),
      opportunities: this.parseNumber(row['Opportunities']),
      pipelineValue: this.parseNumber(row['Pipeline_Value'])
    }));
  }
  
  private static parseTargets(workbook: XLSX.WorkBook): Target[] {
    const sheet = workbook.Sheets['Targets'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      metricCategory: row['Metric_Category'],
      metricName: row['Metric_Name'],
      q1Target: this.parseNumber(row['Q1_Target']) || 0,
      q2Target: this.parseNumber(row['Q2_Target']) || 0,
      q3Target: this.parseNumber(row['Q3_Target']) || 0,
      q4Target: this.parseNumber(row['Q4_Target']) || 0,
      annualTarget: this.parseNumber(row['Annual_Target']) || 0,
      notes: row['Notes'] || ''
    }));
  }
  
  private static parseNotes(workbook: XLSX.WorkBook): Note[] {
    const sheet = workbook.Sheets['Notes'];
    if (!sheet) return [];
    
    const json = XLSX.utils.sheet_to_json(sheet);
    
    return (json as any[]).map((row: any) => ({
      date: row['Date'],
      category: row['Category'],
      note: row['Note']
    }));
  }
  
  private static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '' || isNaN(value)) {
      return null;
    }
    return Number(value);
  }
  
  static aggregateQuarterlyData<T extends { quarter: string }>(
    data: T[],
    quarter: string
  ): T[] {
    return data.filter(item => item.quarter === quarter);
  }
  
  static calculatePercentageChange(current: number | null, previous: number | null): number {
    if (current === null || previous === null || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }
  
  static formatNumber(num: number | null): string {
    if (num === null) return 'N/A';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  }
  
  static formatPercentage(num: number | null): string {
    if (num === null) return 'N/A';
    return `${num.toFixed(1)}%`;
  }

  // JSON parsing methods for server data
  private static parseConfigFromJSON(data: any[]): Config {
    const config: any = {};
    data.forEach((row: any) => {
      if (row.Setting === 'Last_Updated') config.lastUpdated = row.Value;
      if (row.Setting === 'Current_Quarter') config.currentQuarter = row.Value;
      if (row.Setting === 'Current_Year') config.currentYear = Number(row.Value);
    });
    return config as Config;
  }

  private static parseWebsiteDataFromJSON(data: any[]): WebsiteData[] {
    return data.map((row: any) => ({
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

  private static parseTrafficSourcesFromJSON(data: any[]): TrafficSource[] {
    return data.map((row: any) => ({
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

  private static parseSearchDataFromJSON(data: any[]): SearchData[] {
    return data.map((row: any) => ({
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

  private static parseSocialDataFromJSON(data: any[]): SocialData[] {
    return data.map((row: any) => ({
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

  private static parseEmailDataFromJSON(data: any[]): EmailData[] {
    return data.map((row: any) => ({
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

  private static parseEventsDataFromJSON(data: any[]): EventsData[] {
    return data.map((row: any) => ({
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

  private static parseLeadsDataFromJSON(data: any[]): LeadsData[] {
    return data.map((row: any) => ({
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

  private static parseShareOfVoiceDataFromJSON(data: any[]): any[] {
    return data.map((row: any) => ({
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

  private static parseTargetsFromJSON(data: any[]): Target[] {
    return data.map((row: any) => ({
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

  private static parseNotesFromJSON(data: any[]): Note[] {
    return data.map((row: any) => ({
      date: row.Date,
      category: row.Category,
      note: row.Note
    }));
  }
}