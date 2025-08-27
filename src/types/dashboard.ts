export interface WebsiteData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  sessions: number | null;
  pageviews: number | null;
  uniqueVisitors: number | null;
  returningVisitors: number | null;
  bounceRate: number | null;
  avgSessionDuration: number | null;
  downloadsPDFs: number | null;
  videoViews: number | null;
  sourceQuality: string | null;
}

export interface TrafficSource {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  directTraffic: number;
  searchEngines: number;
  internalReferrers: number;
  externalReferrers: number;
  socialMedia: number;
}

export interface SearchData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  source: string | null;
}

export interface SocialData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  channel: string | null;
  type: string | null;
  impressions: number | null;
  views: number | null;
  clicks: number | null;
  ctr: number | null;
  reactions: number | null;
  comments: number | null;
  shares: number | null;
  engagementRate: number | null;
  budget: number | null;
  cpc: number | null;
}

export interface EmailData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  campaignType: string | null;
  emailsSent: number | null;
  emailsDelivered: number | null;
  totalOpens: number | null;
  uniqueOpens: number | null;
  openRate: number | null;
  totalClicks: number | null;
  uniqueClicks: number | null;
  ctr: number | null;
  ctor: number | null;
  hardBounces: number | null;
  softBounces: number | null;
  bounceRate: number | null;
  unsubscribes: number | null;
}

export interface LeadsData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  newMarketingProspects: number | null;
  assignedProspects: number | null;
  activeProspects: number | null;
  unsubscribedProspects: number | null;
  marketingQualified: number | null;
  salesAccepted: number | null;
  opportunities: number | null;
  pipelineValue: number | null;
}

export interface Target {
  metricCategory: string;
  metricName: string;
  q1Target: number;
  q2Target: number;
  q3Target: number;
  q4Target: number;
  annualTarget: number;
  notes: string;
}

export interface Config {
  lastUpdated: string;
  currentQuarter: string;
  currentYear: number;
}

export interface ShareOfVoiceData {
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  mediaMentionVolume: number | null;
  mediaReachImpressions: number | null;
  socialMentions: number | null;
  competitor1Mentions: number | null;
  competitor2Mentions: number | null;
}

export interface DashboardData {
  config: Config;
  websiteData: WebsiteData[];
  trafficSources: TrafficSource[];
  searchData: SearchData[];
  socialData: SocialData[];
  emailData: EmailData[];
  leadsData: LeadsData[];
  shareOfVoiceData: ShareOfVoiceData[];
  targets: Target[];
  notes: Note[];
}

export interface Note {
  date: string;
  category: string;
  note: string;
}

export interface Insight {
  id: string;
  type: 'performance' | 'trend' | 'comparison' | 'prediction' | 'opportunity' | 'risk';
  title: string;
  description: string;
  metric?: string;
  value?: number;
  change?: number;
  confidence: 'high' | 'medium' | 'low';
  priority: 'high' | 'medium' | 'low';
  actions?: string[];
}

export interface Period {
  year: number;
  quarter?: string;
  month?: number;
}

export interface ComparisonData {
  current: any;
  previous: any;
  percentageChange: number;
  absoluteChange: number;
}