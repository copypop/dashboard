import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Globe,
  Mail,
  Share2,
  Target,
  BarChart3,
  Activity,
  AlertCircle,
  Info,
  ChevronDown,
  RefreshCw,
  Settings,
  Eye,
  MousePointer,
  Upload,
  Database
} from 'lucide-react';
import { dataService } from '../services/dataService';
import type { DashboardData } from '../types/dashboard';
import { InfoTooltip } from './ui/InfoTooltip';
import { ExportButton } from './ui/ExportButton';

type TabType = 'overview' | 'website' | 'seo' | 'social' | 'email' | 'leads' | 'sov' | 'quarterly' | 'yoy';
type PeriodType = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Year';
type ChartView = 'quarterly' | 'monthly' | 'yoy' | 'annual' | 'all' | 'traffic' | 'engagement' | 'conversion';

interface ExecutiveDashboardProps {
  initialData?: DashboardData | null;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ initialData }) => {
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('Q1');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareType, setCompareType] = useState<'prev_quarter' | 'prev_year'>('prev_quarter');
  const [chartView, setChartView] = useState<ChartView>('quarterly');
  const [quarterlyChartView, setQuarterlyChartView] = useState<ChartView>('all');
  const [yoyChartView, setYoyChartView] = useState<ChartView>('quarterly');
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    if (!initialData) {
      loadInitialData();
    } else {
      setData(initialData);
      setLastUpdate(dataService.getLastUpdateTime());
    }

    // Subscribe to data changes
    const unsubscribe = dataService.onDataChange((newData) => {
      setData(newData);
      setLastUpdate(dataService.getLastUpdateTime());
    });

    return unsubscribe;
  }, [initialData]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Try to load from public folder first
      let fetchedData = await dataService.loadFromPublicFolder();
      
      // If not in public folder, check cache
      if (!fetchedData) {
        fetchedData = dataService.getData();
      }
      
      if (fetchedData) {
        setData(fetchedData);
        setLastUpdate(dataService.getLastUpdateTime());
        setError(null);
      } else {
        // No data available, show upload prompt
        setShowUploadModal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setShowUploadModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setShowUploadModal(false);
      const data = await dataService.loadFromFile(file);
      setData(data);
      setLastUpdate(dataService.getLastUpdateTime());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Excel file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const data = await dataService.refresh();
      if (data) {
        setData(data);
        setLastUpdate(dataService.getLastUpdateTime());
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const calculateTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  // Calculate KPIs based on selected period
  const kpis = useMemo(() => {
    if (!data) return null;

    const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
    const currentData = data.websiteData.filter(d => 
      d.year === selectedYear && 
      (currentQuarter ? d.quarter === currentQuarter : true)
    );

    // Determine comparison period based on compareType
    let previousQuarter, previousYear, previousPeriodLabel;
    
    if (compareType === 'prev_year') {
      // Previous Year Same Quarter
      previousQuarter = currentQuarter;
      previousYear = selectedYear - 1;
      previousPeriodLabel = currentQuarter 
        ? `${currentQuarter} ${previousYear}` 
        : `${previousYear}`;
    } else {
      // Previous Quarter (default)
      if (currentQuarter) {
        previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                         currentQuarter === 'Q2' ? 'Q1' :
                         currentQuarter === 'Q3' ? 'Q2' : 'Q3';
        previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
        previousPeriodLabel = `${previousQuarter} ${previousYear}`;
      } else {
        // For full year comparison
        previousQuarter = null;
        previousYear = selectedYear - 1;
        previousPeriodLabel = `${previousYear}`;
      }
    }
    
    const previousData = data.websiteData.filter(d => 
      d.year === previousYear && 
      (previousQuarter ? d.quarter === previousQuarter : true)
    );

    const currentSocial = data.socialData.filter(d => 
      d.year === selectedYear && 
      (currentQuarter ? d.quarter === currentQuarter : true)
    );

    const previousSocial = data.socialData.filter(d => 
      d.year === previousYear && 
      (previousQuarter ? d.quarter === previousQuarter : true)
    );

    const currentEmail = data.emailData.filter(d => 
      d.year === selectedYear && 
      (currentQuarter ? d.quarter === currentQuarter : true)
    );

    const previousEmail = data.emailData.filter(d => 
      d.year === previousYear && 
      (previousQuarter ? d.quarter === previousQuarter : true)
    );

    const currentLeads = data.leadsData.filter(d => 
      d.year === selectedYear && 
      (currentQuarter ? d.quarter === currentQuarter : true)
    );

    const previousLeads = data.leadsData.filter(d => 
      d.year === previousYear && 
      (previousQuarter ? d.quarter === previousQuarter : true)
    );

    // Add SOV data filtering
    const currentSOV = data.shareOfVoiceData.filter(d => 
      d.year === selectedYear && 
      (currentQuarter ? d.quarter === currentQuarter : true)
    );

    const previousSOV = data.shareOfVoiceData.filter(d => 
      d.year === previousYear && 
      (previousQuarter ? d.quarter === previousQuarter : true)
    );

    // Calculate aggregated metrics
    const totalSessions = currentData.reduce((sum, d) => sum + (d.sessions || 0), 0);
    const totalVisitors = currentData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
    
    const totalImpressions = currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
    const totalEngagements = currentSocial.reduce((sum, d) => 
      sum + (d.reactions || 0) + (d.comments || 0) + (d.shares || 0), 0);
    const socialEngagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;

    const totalEmailsSent = currentEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
    const totalUniqueOpens = currentEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
    const emailOpenRate = totalEmailsSent > 0 ? (totalUniqueOpens / totalEmailsSent) * 100 : 0;

    const totalNewLeads = currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);

    // Calculate SOV metrics (using only media mentions to match SOV tab calculation)
    const ourMediaMentions = currentSOV.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
    const competitor1Mentions = currentSOV.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
    const competitor2Mentions = currentSOV.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
    const totalCompetitiveMentions = ourMediaMentions + competitor1Mentions + competitor2Mentions;
    const shareOfVoice = totalCompetitiveMentions > 0 ? (ourMediaMentions / totalCompetitiveMentions) * 100 : 0;

    // Previous period metrics for comparison
    const prevSessions = previousData.reduce((sum, d) => sum + (d.sessions || 0), 0);
    const prevVisitors = previousData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
    
    const prevImpressions = previousSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
    const prevEngagements = previousSocial.reduce((sum, d) => 
      sum + (d.reactions || 0) + (d.comments || 0) + (d.shares || 0), 0);
    const prevSocialEngagementRate = prevImpressions > 0 ? (prevEngagements / prevImpressions) * 100 : 0;
    
    const prevEmailsSent = previousEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
    const prevUniqueOpens = previousEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
    const prevEmailOpenRate = prevEmailsSent > 0 ? (prevUniqueOpens / prevEmailsSent) * 100 : 0;
    
    const prevNewLeads = previousLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);

    // Previous period SOV metrics (using only media mentions to match SOV tab calculation)
    const prevOurMediaMentions = previousSOV.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
    const prevCompetitor1Mentions = previousSOV.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
    const prevCompetitor2Mentions = previousSOV.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
    const prevTotalCompetitiveMentions = prevOurMediaMentions + prevCompetitor1Mentions + prevCompetitor2Mentions;
    const prevShareOfVoice = prevTotalCompetitiveMentions > 0 ? (prevOurMediaMentions / prevTotalCompetitiveMentions) * 100 : 0;

    const digitalReach = totalVisitors + totalImpressions;
    const prevReach = prevVisitors + prevImpressions;

    return {
      previousPeriodLabel,
      digitalReach: {
        value: digitalReach,
        formatted: formatNumber(digitalReach),
        trend: calculateTrend(digitalReach, prevReach),
        previousValue: prevReach
      },
      sessions: {
        value: totalSessions,
        formatted: formatNumber(totalSessions),
        trend: calculateTrend(totalSessions, prevSessions),
        previousValue: prevSessions
      },
      socialEngagement: {
        value: socialEngagementRate,
        formatted: `${socialEngagementRate.toFixed(2)}%`,
        trend: {
          value: Math.abs(socialEngagementRate - prevSocialEngagementRate),
          direction: socialEngagementRate >= prevSocialEngagementRate ? 'up' : 'down'
        },
        previousValue: prevSocialEngagementRate
      },
      emailOpenRate: {
        value: emailOpenRate,
        formatted: `${emailOpenRate.toFixed(1)}%`,
        trend: {
          value: Math.abs(emailOpenRate - prevEmailOpenRate),
          direction: emailOpenRate >= prevEmailOpenRate ? 'up' : 'down'
        },
        previousValue: prevEmailOpenRate
      },
      newLeads: {
        value: totalNewLeads,
        formatted: formatNumber(totalNewLeads),
        trend: calculateTrend(totalNewLeads, prevNewLeads),
        previousValue: prevNewLeads
      },
      shareOfVoice: {
        value: shareOfVoice,
        formatted: `${shareOfVoice.toFixed(1)}%`,
        trend: {
          value: Math.abs(shareOfVoice - prevShareOfVoice),
          direction: shareOfVoice >= prevShareOfVoice ? 'up' : 'down'
        },
        previousValue: prevShareOfVoice
      },
      marketingROI: {
        value: 3.2,
        formatted: '3.2x',
        trend: { value: 14.3, direction: 'up' },
        previousValue: 2.8
      }
    };
  }, [data, selectedPeriod, selectedYear, compareType]);

  const getDateRange = () => {
    const quarterRanges = {
      Q1: 'January - March',
      Q2: 'April - June',
      Q3: 'July - September',
      Q4: 'October - December',
      Year: 'January - December'
    };
    
    const endDates = {
      Q1: 'March 31',
      Q2: 'June 30',
      Q3: 'September 30',
      Q4: 'December 31',
      Year: 'December 31'
    };

    return `${selectedPeriod} ${selectedYear} (${quarterRanges[selectedPeriod]}) | Data as of ${endDates[selectedPeriod]}, ${selectedYear}`;
  };

  // Chart data preparation
  const getQuarterlyChartData = () => {
    if (!data) return [];
    
    // Get last 5 quarters dynamically
    const quarters: string[] = [];
    let year = selectedYear;
    let quarter = selectedPeriod === 'Year' ? 4 : parseInt(selectedPeriod.substring(1));
    
    for (let i = 0; i < 5; i++) {
      quarters.unshift(`Q${quarter} ${year}`);
      quarter--;
      if (quarter === 0) {
        quarter = 4;
        year--;
      }
    }
    
    return quarters.map(q => {
      const [quarter, year] = q.split(' ');
      const yearNum = parseInt(year);
      
      const websiteData = data.websiteData.filter(d => 
        d.year === yearNum && d.quarter === quarter
      );
      
      const socialData = data.socialData.filter(d => 
        d.year === yearNum && d.quarter === quarter
      );
      
      const emailData = data.emailData.filter(d => 
        d.year === yearNum && d.quarter === quarter
      );
      
      const leadsData = data.leadsData.filter(d => 
        d.year === yearNum && d.quarter === quarter
      );

      const sovData = data.shareOfVoiceData.filter(d => 
        d.year === yearNum && d.quarter === quarter
      );

      // Calculate meaningful conversion rate: Marketing Qualified Leads / New Prospects
      const newProspects = leadsData.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
      const marketingQualified = leadsData.reduce((sum, d) => sum + (d.marketingQualified || 0), 0);
      const prospectToMQLRate = newProspects > 0 ? (marketingQualified / newProspects) * 100 : 0;

      // Calculate Share of Voice for the quarter (using only media mentions)
      const ourMediaMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
      const competitor1 = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
      const competitor2 = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
      const totalCompetitiveMentions = ourMediaMentions + competitor1 + competitor2;
      const shareOfVoice = totalCompetitiveMentions > 0 ? (ourMediaMentions / totalCompetitiveMentions) * 100 : 0;

      return {
        period: q,
        sessions: websiteData.reduce((sum, d) => sum + (d.sessions || 0), 0),
        socialImpressions: socialData.reduce((sum, d) => sum + (d.impressions || 0), 0),
        emailsSent: emailData.reduce((sum, d) => sum + (d.emailsSent || 0), 0),
        leads: newProspects,
        conversionRate: prospectToMQLRate,
        shareOfVoice: shareOfVoice
      };
    });
  };

  const getTimelineData = () => {
    if (!data) return [];
    
    // Get last 5 quarters of actual data
    const quarters: { q: string; y: number }[] = [];
    let year = selectedYear;
    let quarter = selectedPeriod === 'Year' ? 4 : parseInt(selectedPeriod.substring(1));
    
    for (let i = 0; i < 5; i++) {
      quarters.unshift({ q: `Q${quarter}`, y: year });
      quarter--;
      if (quarter === 0) {
        quarter = 4;
        year--;
      }
    }
    
    return quarters.map((q, index) => {
      const websiteData = data.websiteData.filter(d => 
        d.year === q.y && d.quarter === q.q
      );
      const socialData = data.socialData.filter(d => 
        d.year === q.y && d.quarter === q.q
      );
      
      const sessions = websiteData.reduce((sum, d) => sum + (d.sessions || 0), 0);
      const impressions = socialData.reduce((sum, d) => sum + (d.impressions || 0), 0);
      const totalReach = sessions + impressions;
      
      // Calculate change from previous period
      let change = null;
      if (index > 0 && quarters[index - 1]) {
        const prevData = quarters[index - 1];
        const prevWebsite = data.websiteData.filter(d => 
          d.year === prevData.y && d.quarter === prevData.q
        );
        const prevSocial = data.socialData.filter(d => 
          d.year === prevData.y && d.quarter === prevData.q
        );
        const prevReach = prevWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0) +
                         prevSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
        if (prevReach > 0) {
          change = ((totalReach - prevReach) / prevReach * 100).toFixed(1);
        }
      }
      
      return {
        period: `${q.q} ${q.y}`,
        value: totalReach,
        label: formatNumber(totalReach),
        change: change ? parseFloat(change) : null
      };
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <img 
            src="/caat-logo-en.svg" 
            alt="CAAT Pension Plan" 
            className="h-12 w-auto mx-auto mb-4 opacity-50"
          />
          <RefreshCw className="h-8 w-8 animate-spin text-[#005C84] mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md">
          <img 
            src="/caat-logo-en.svg" 
            alt="CAAT Pension Plan" 
            className="h-12 w-auto mx-auto mb-4 opacity-50"
          />
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={loadInitialData}
              className="px-4 py-2 bg-[#005C84] text-white rounded-lg hover:bg-[#004A6C] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white text-[#005C84] border border-[#005C84] rounded-lg hover:bg-gray-50 transition-colors"
            >
              Upload Excel
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    );
  }
  
  // Upload Modal
  if (showUploadModal && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full">
          <img 
            src="/caat-logo-en.svg" 
            alt="CAAT Pension Plan" 
            className="h-12 w-auto mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome to CAAT Dashboard</h2>
          <p className="text-gray-600 text-center mb-6">
            Please upload the Excel data file to get started
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#005C84] transition-colors">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Click to upload or drag and drop<br />
              CAAT_Dashboard_Data_2025.xlsx
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-[#005C84] text-white rounded-lg hover:bg-[#004A6C] transition-colors"
            >
              Select Excel File
            </button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Tip:</p>
                <p>Place the Excel file in the public folder to load automatically on startup.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-5">
      <div className="max-w-[1400px] mx-auto bg-white rounded-[20px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-white via-gray-50 to-[#005C84] p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-6">
              {/* CAAT Logo */}
              <img 
                src="/caat-logo-en.svg" 
                alt="CAAT Pension Plan" 
                className="h-16 w-auto -mt-1"
              />
              {/* Vertical Separator */}
              <div className="w-px h-16 bg-gray-300 -mt-1"></div>
              <div>
                <h1 className="text-3xl font-semibold mb-2 text-[#005C84]">Marketing Dashboard</h1>
                <p className="text-sm text-gray-600 mt-2">{getDateRange()}</p>
              </div>
            </div>
            
            {/* Period Selector */}
            <div className="flex gap-2 bg-white p-1.5 rounded-lg shadow-md border border-gray-200">
              {(['Q1', 'Q2', 'Q3', 'Q4', 'Year'] as PeriodType[]).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                    selectedPeriod === period
                      ? 'bg-[#005C84] text-white shadow-sm'
                      : 'text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-[#005C84]'
                  }`}
                >
                  {period} {period !== 'Year' ? selectedYear : `${selectedYear} Full Year`}
                </button>
              ))}
            </div>
          </div>

          {/* Comparison Controls */}
          <div className="flex items-center gap-6 bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-700 font-medium">Compare Periods</label>
              <button
                onClick={() => {
                  setCompareEnabled(!compareEnabled);
                  if (!compareEnabled && kpis) {
                    // Show comparison values in KPI cards
                  }
                }}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  compareEnabled ? 'bg-[#55A51C]' : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  compareEnabled ? 'translate-x-6' : ''
                }`} />
              </button>
            </div>

            {compareEnabled && (
              <select
                value={compareType}
                onChange={(e) => setCompareType(e.target.value as 'prev_quarter' | 'prev_year')}
                className="px-3 py-1.5 rounded-md bg-white text-[#005C84] text-sm"
              >
                <option value="prev_quarter">Previous Quarter</option>
                <option value="prev_year">Previous Year Same Quarter</option>
              </select>
            )}

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 rounded-md bg-white text-[#005C84] text-sm"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
            
            {/* Export Button */}
            <div className="ml-auto">
              <ExportButton 
                elementId={`tab-content-${activeTab}`}
                fileName={`caat-${activeTab}-${selectedPeriod}-${selectedYear}`}
                title={`CAAT Marketing Dashboard - ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Report`}
              />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-gray-50 px-10 flex gap-1 border-b-2 border-gray-200 overflow-x-auto">
          {[
            { id: 'overview', label: 'Executive Summary' },
            { id: 'website', label: 'Website Analytics' },
            { id: 'seo', label: 'SEO & Search' },
            { id: 'social', label: 'Social Media' },
            { id: 'email', label: 'Email Marketing' },
            { id: 'leads', label: 'Leads & Pipeline' },
            { id: 'sov', label: 'Share of Voice' },
            { id: 'quarterly', label: 'Quarterly Analysis' },
            { id: 'yoy', label: 'Year-over-Year' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? 'text-[#005C84] bg-white rounded-t-lg'
                  : 'text-gray-600 hover:text-[#005C84] hover:bg-white/50'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#005C84]" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="p-10">
          {/* Executive Summary Tab */}
          {activeTab === 'overview' && kpis && (
            <div id="tab-content-overview" className="space-y-8 animate-fadeIn">
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total Digital Reach
                    <InfoTooltip 
                      title="Total Digital Reach"
                      description="The combined number of unique individuals exposed to your brand across all digital marketing channels during the selected period."
                      calculation="Website Unique Visitors + Social Media Impressions"
                      example="If you had 50,000 website visitors and 100,000 social impressions, your total digital reach is 150,000+"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.digitalReach.formatted}+</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.digitalReach.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.digitalReach.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.digitalReach.trend.value.toFixed(1)}% vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {formatNumber(kpis.digitalReach.previousValue)}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Website Sessions
                    <InfoTooltip 
                      title="Website Sessions"
                      description="A session is a group of user interactions with your website that take place within a given time frame (typically 30 minutes of activity)."
                      calculation="Total number of sessions recorded by website analytics"
                      example="One user visiting your site 3 times in a day counts as 3 sessions"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.sessions.formatted}</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.sessions.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.sessions.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.sessions.trend.value.toFixed(1)}% vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {formatNumber(kpis.sessions.previousValue)}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Social Engagement Rate
                    <InfoTooltip 
                      title="Social Engagement Rate"
                      description="The percentage of people who interacted with your social media content after seeing it. Higher rates indicate more compelling content."
                      calculation="(Reactions + Comments + Shares) ÷ Impressions × 100"
                      example="1,000 engagements from 20,000 impressions = 5% engagement rate"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.socialEngagement.formatted}</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.socialEngagement.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.socialEngagement.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.socialEngagement.trend.value.toFixed(2)}pp vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {kpis.socialEngagement.previousValue.toFixed(2)}%
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Email Open Rate
                    <InfoTooltip 
                      title="Email Open Rate"
                      description="The percentage of email recipients who opened your email. Industry benchmark is typically 15-25% for B2B marketing."
                      calculation="Unique Opens ÷ Emails Delivered × 100"
                      example="500 opens from 2,000 delivered emails = 25% open rate"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.emailOpenRate.formatted}</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.emailOpenRate.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.emailOpenRate.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.emailOpenRate.trend.value.toFixed(1)}pp vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {kpis.emailOpenRate.previousValue.toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    New Leads Generated
                    <InfoTooltip 
                      title="New Marketing Prospects"
                      description="The number of new potential customers who have shown interest in your products/services by providing contact information."
                      calculation="Sum of all new marketing prospects in the period"
                      example="Form submissions, content downloads, demo requests, newsletter signups"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.newLeads.formatted}</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.newLeads.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.newLeads.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.newLeads.trend.value.toFixed(0)}% vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {kpis.newLeads.previousValue}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Share of Voice
                    <InfoTooltip 
                      title="Share of Voice"
                      description="Your brand's percentage of the total conversation in your industry across media and social channels."
                      calculation="(Your Mentions ÷ Total Industry Mentions) × 100"
                      example="If you have 100 mentions and competitors have 200, your SOV is 33.3%"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.shareOfVoice.formatted}</div>
                  <div className={`flex items-center gap-1 text-sm ${kpis.shareOfVoice.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.shareOfVoice.trend.direction === 'up' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {kpis.shareOfVoice.trend.value.toFixed(1)}% vs {kpis.previousPeriodLabel}
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {kpis.shareOfVoice.previousValue.toFixed(1)}%
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:-translate-y-1 relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#005C84] to-[#55A51C] rounded-l-xl" />
                  <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Marketing ROI
                    <InfoTooltip 
                      title="Marketing Return on Investment"
                      description="Revenue generated for every dollar spent on marketing. A 3.2x ROI means $3.20 revenue for every $1 spent."
                      calculation="(Revenue from Marketing - Marketing Cost) ÷ Marketing Cost"
                      example="$100,000 revenue from $30,000 spend = 2.3x ROI"
                      icon="info"
                      position="auto"
                    />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{kpis.marketingROI.formatted}</div>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    Target: 2.5x
                  </div>
                  {compareEnabled && (
                    <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                      {kpis.previousPeriodLabel}: {kpis.marketingROI.previousValue}x
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Overview Chart */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    Performance Overview - Quarterly Trend
                    <InfoTooltip 
                      title="Multi-Channel Performance Trend"
                      description="Visualizes key performance metrics across all marketing channels over time to identify trends and patterns. The qualification rate shows how effectively new prospects are converted to marketing qualified leads (MQLs)."
                      calculation="Lead Qualification Rate = (Marketing Qualified Leads ÷ New Prospects) × 100"
                      example="A 7% rate means 7 out of 100 prospects become qualified leads"
                      icon="info"
                      position="auto"
                    />
                  </h3>
                  <div className="flex gap-2">
                    {(['quarterly', 'monthly', 'yoy'] as ChartView[]).map(view => (
                      <button
                        key={view}
                        onClick={() => setChartView(view)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          chartView === view
                            ? 'bg-[#005C84] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {view === 'yoy' ? 'Year-over-Year' : view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={(() => {
                    if (!data) return [];
                    
                    if (chartView === 'monthly') {
                      // Show monthly data for current period
                      const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                      const websiteData = data.websiteData.filter(d => 
                        d.year === selectedYear && 
                        (currentQuarter ? d.quarter === currentQuarter : true)
                      );
                      const socialData = data.socialData.filter(d => 
                        d.year === selectedYear && 
                        (currentQuarter ? d.quarter === currentQuarter : true)
                      );
                      const leadsData = data.leadsData.filter(d => 
                        d.year === selectedYear && 
                        (currentQuarter ? d.quarter === currentQuarter : true)
                      );
                      
                      // Group by month
                      const monthlyData: Record<string, any> = {};
                      
                      websiteData.forEach(d => {
                        const key = d.monthName;
                        if (!monthlyData[key]) {
                          monthlyData[key] = { 
                            period: d.monthName.slice(0, 3),
                            month: d.month,
                            sessions: 0,
                            socialImpressions: 0,
                            leads: 0,
                            qualified: 0
                          };
                        }
                        monthlyData[key].sessions += d.sessions || 0;
                      });
                      
                      socialData.forEach(d => {
                        const key = d.monthName;
                        if (monthlyData[key]) {
                          monthlyData[key].socialImpressions += d.impressions || 0;
                        }
                      });
                      
                      leadsData.forEach(d => {
                        const key = d.monthName;
                        if (monthlyData[key]) {
                          monthlyData[key].leads += d.newMarketingProspects || 0;
                          monthlyData[key].qualified += d.marketingQualified || 0;
                        }
                      });
                      
                      // Calculate conversion rate and sort by month
                      return Object.values(monthlyData)
                        .sort((a, b) => a.month - b.month)
                        .map(d => ({
                          ...d,
                          conversionRate: d.leads > 0 ? (d.qualified / d.leads) * 100 : 0
                        }));
                        
                    } else if (chartView === 'yoy') {
                      // Show year-over-year comparison
                      const periods = [];
                      const currentYear = selectedYear;
                      const prevYear = selectedYear - 1;
                      
                      if (selectedPeriod === 'Year') {
                        // Show annual comparison
                        const currentData = data.websiteData.filter(d => d.year === currentYear);
                        const prevData = data.websiteData.filter(d => d.year === prevYear);
                        const currentSocial = data.socialData.filter(d => d.year === currentYear);
                        const prevSocial = data.socialData.filter(d => d.year === prevYear);
                        const currentLeads = data.leadsData.filter(d => d.year === currentYear);
                        const prevLeads = data.leadsData.filter(d => d.year === prevYear);
                        
                        const currentSessions = currentData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        const prevSessions = prevData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        const currentImpressions = currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                        const prevImpressions = prevSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                        const currentNewLeads = currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                        const currentQualified = currentLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0);
                        const prevNewLeads = prevLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                        const prevQualified = prevLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0);
                        
                        periods.push({
                          period: `${prevYear}`,
                          sessions: prevSessions,
                          socialImpressions: prevImpressions,
                          conversionRate: prevNewLeads > 0 ? (prevQualified / prevNewLeads) * 100 : 0
                        });
                        periods.push({
                          period: `${currentYear}`,
                          sessions: currentSessions,
                          socialImpressions: currentImpressions,
                          conversionRate: currentNewLeads > 0 ? (currentQualified / currentNewLeads) * 100 : 0
                        });
                      } else {
                        // Show same quarter comparison across years
                        const quarter = selectedPeriod;
                        const currentData = data.websiteData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const prevData = data.websiteData.filter(d => d.year === prevYear && d.quarter === quarter);
                        const currentSocial = data.socialData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const prevSocial = data.socialData.filter(d => d.year === prevYear && d.quarter === quarter);
                        const currentLeads = data.leadsData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const prevLeads = data.leadsData.filter(d => d.year === prevYear && d.quarter === quarter);
                        
                        const currentSessions = currentData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        const prevSessions = prevData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        const currentImpressions = currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                        const prevImpressions = prevSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                        const currentNewLeads = currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                        const currentQualified = currentLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0);
                        const prevNewLeads = prevLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                        const prevQualified = prevLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0);
                        
                        periods.push({
                          period: `${quarter} ${prevYear}`,
                          sessions: prevSessions,
                          socialImpressions: prevImpressions,
                          conversionRate: prevNewLeads > 0 ? (prevQualified / prevNewLeads) * 100 : 0
                        });
                        periods.push({
                          period: `${quarter} ${currentYear}`,
                          sessions: currentSessions,
                          socialImpressions: currentImpressions,
                          conversionRate: currentNewLeads > 0 ? (currentQualified / currentNewLeads) * 100 : 0
                        });
                      }
                      
                      return periods;
                    } else {
                      // Default quarterly view
                      return getQuarterlyChartData();
                    }
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="sessions" fill="#005C84" name="Website Sessions" />
                    <Bar yAxisId="left" dataKey="socialImpressions" fill="#55A51C" name="Social Impressions" />
                    <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#ff7300" name="Lead Qualification Rate (%)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Historical Performance Timeline */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                  Historical Performance Timeline
                  <InfoTooltip 
                    title="Performance History"
                    description="Shows your digital reach performance over the last 5 quarters to identify growth trends and seasonal patterns."
                    calculation="Quarter-over-quarter and year-over-year comparisons"
                    example="A 10% QoQ means 10% growth from last quarter"
                  />
                </h3>
                <div className="flex gap-5 overflow-x-auto pb-2">
                  {getTimelineData().map((period, index) => (
                    <div
                      key={period.period}
                      className={`min-w-[200px] p-5 rounded-lg border-2 cursor-pointer transition-all ${
                        index === getTimelineData().length - 1
                          ? 'bg-gradient-to-br from-blue-50 to-green-50 border-[#005C84]'
                          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-sm font-semibold text-gray-600 mb-2">{period.period}</div>
                      <div className="text-2xl font-bold text-[#005C84] mb-1">{period.label}</div>
                      {period.change !== null && (
                        <div className={`text-sm ${period.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {period.change > 0 ? '↑' : '↓'} {Math.abs(period.change).toFixed(1)}% 
                          {index === getTimelineData().length - 1 ? ' YoY' : ' QoQ'}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">Reach</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Website Analytics Tab */}
          {activeTab === 'website' && data && (
            <div id="tab-content-website" className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(() => {
                  // Get data for selected period
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  const currentData = data.websiteData.filter(d => 
                    d.year === selectedYear && 
                    (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  
                  // Determine comparison period based on compareType
                  let previousQuarter, previousYear, previousPeriodLabel;
                  
                  if (compareType === 'prev_year') {
                    // Previous Year Same Quarter
                    previousQuarter = currentQuarter;
                    previousYear = selectedYear - 1;
                    previousPeriodLabel = currentQuarter 
                      ? `${currentQuarter} ${previousYear}` 
                      : `${previousYear}`;
                  } else {
                    // Previous Quarter (default)
                    if (currentQuarter) {
                      previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                       currentQuarter === 'Q2' ? 'Q1' :
                                       currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                      previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                      previousPeriodLabel = `${previousQuarter} ${previousYear}`;
                    } else {
                      // For full year comparison
                      previousQuarter = null;
                      previousYear = selectedYear - 1;
                      previousPeriodLabel = `${previousYear}`;
                    }
                  }
                  
                  const previousData = data.websiteData.filter(d => 
                    d.year === previousYear && 
                    (previousQuarter ? d.quarter === previousQuarter : true)
                  );
                  
                  // Current period metrics
                  const totalSessions = currentData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                  const totalPageviews = currentData.reduce((sum, d) => sum + (d.pageviews || 0), 0);
                  const totalVisitors = currentData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
                  const avgBounceRate = currentData.length > 0 ? 
                    currentData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / currentData.length : 0;
                  const pagesPerSession = totalSessions > 0 ? (totalPageviews / totalSessions).toFixed(2) : '0';
                  const newVisitorRate = totalVisitors > 0 ? 
                    ((currentData.reduce((sum, d) => sum + (d.uniqueVisitors || 0) - (d.returningVisitors || 0), 0) / totalVisitors) * 100).toFixed(1) : '0';
                  
                  // Previous period metrics
                  const prevSessions = previousData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                  const prevPageviews = previousData.reduce((sum, d) => sum + (d.pageviews || 0), 0);
                  const prevVisitors = previousData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
                  const prevBounceRate = previousData.length > 0 ? 
                    previousData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / previousData.length : 0;
                  
                  // Calculate trends
                  const sessionsTrend = prevSessions > 0 ? ((totalSessions - prevSessions) / prevSessions * 100) : 0;
                  const pageviewsTrend = prevPageviews > 0 ? ((totalPageviews - prevPageviews) / prevPageviews * 100) : 0;
                  const visitorsTrend = prevVisitors > 0 ? ((totalVisitors - prevVisitors) / prevVisitors * 100) : 0;
                  const bounceRateDiff = avgBounceRate - prevBounceRate; // Difference in percentage points
                  
                  return [
                    { 
                      label: 'Total Sessions', 
                      value: formatNumber(totalSessions), 
                      subtext: `${selectedPeriod} ${selectedYear}`, 
                      icon: Globe,
                      trend: sessionsTrend,
                      previousValue: prevSessions,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Pageviews', 
                      value: formatNumber(totalPageviews), 
                      subtext: `${pagesPerSession} pages/session`, 
                      icon: Eye,
                      trend: pageviewsTrend,
                      previousValue: prevPageviews,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Unique Visitors', 
                      value: formatNumber(totalVisitors), 
                      subtext: `${newVisitorRate}% new visitors`, 
                      icon: Users,
                      trend: visitorsTrend,
                      previousValue: prevVisitors,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Bounce Rate', 
                      value: `${avgBounceRate.toFixed(1)}%`, 
                      subtext: avgBounceRate > 65 ? '↓ Needs improvement' : 'Good', 
                      icon: Activity, 
                      negative: avgBounceRate > 65,
                      trend: bounceRateDiff,
                      isRate: true,
                      previousValue: prevBounceRate,
                      previousPeriodLabel
                    }
                  ].map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      {metric.negative && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {metric.label}
                      <InfoTooltip 
                        title={metric.label}
                        description={
                          metric.label === 'Total Sessions' ? 'Total number of visits to your website during the selected period. One user can have multiple sessions.' :
                          metric.label === 'Pageviews' ? 'Total number of pages viewed. Repeated views of a single page are counted.' :
                          metric.label === 'Unique Visitors' ? 'Number of individual users who visited your site, counted only once regardless of how many times they visit.' :
                          metric.label === 'Bounce Rate' ? 'Percentage of single-page sessions where users left without interacting. Lower is better.' :
                          'Metric description'
                        }
                        calculation={
                          metric.label === 'Bounce Rate' ? 'Single-page sessions ÷ Total sessions × 100' :
                          metric.label === 'Pageviews' ? 'Sum of all page views in the period' :
                          undefined
                        }
                        example={
                          metric.label === 'Bounce Rate' ? 'Below 40% is excellent, 40-55% is average, above 70% needs improvement' :
                          undefined
                        }
                        icon="info"
                        position="auto"
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className={`text-sm ${metric.negative ? 'text-orange-600' : 'text-gray-500'} mb-2`}>{metric.subtext}</div>
                    
                    {/* Trend indicator */}
                    <div className={`flex items-center gap-1 text-sm ${
                      metric.isRate 
                        ? (metric.trend < 0 ? 'text-green-600' : 'text-red-600')  // For bounce rate, lower is better
                        : (metric.trend >= 0 ? 'text-green-600' : 'text-red-600')
                    }`}>
                      {metric.isRate ? (
                        metric.trend < 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
                      ) : (
                        metric.trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />
                      )}
                      {Math.abs(metric.trend).toFixed(1)}{metric.isRate ? 'pp' : '%'} vs {metric.previousPeriodLabel}
                    </div>
                    
                    {/* Comparison value when enabled */}
                    {compareEnabled && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {metric.previousPeriodLabel}: {
                          metric.isRate 
                            ? `${metric.previousValue.toFixed(1)}%`
                            : formatNumber(metric.previousValue)
                        }
                      </div>
                    )}
                  </div>
                ))
                })()}
              </div>

              {/* Traffic Sources Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    Traffic Sources Breakdown
                    <InfoTooltip 
                      title="Traffic Sources Analysis"
                      description="Shows where your website visitors are coming from. Understanding traffic sources helps optimize marketing channel investments."
                      calculation="Each source percentage × Total website sessions"
                      example="Direct Traffic: Users typing URL directly or using bookmarks"
                    />
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center">
                            Source
                            <InfoTooltip 
                              title="Traffic Source Types"
                              description="Categories of how visitors find and access your website"
                              position="auto"
                            />
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">% of Total</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                        
                        // Get website sessions for the current period
                        const currentWebsiteData = data.websiteData.filter(d => 
                          d.year === selectedYear && 
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );
                        const totalWebsiteSessions = currentWebsiteData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        
                        // Get current period traffic source percentages
                        const currentTraffic = data.trafficSources.filter(d => 
                          d.year === selectedYear && 
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );
                        
                        // Get previous period for comparison
                        const previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                               currentQuarter === 'Q2' ? 'Q1' :
                                               currentQuarter === 'Q3' ? 'Q2' : 
                                               currentQuarter ? 'Q3' : null;
                        const previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                        
                        const previousWebsiteData = data.websiteData.filter(d => 
                          d.year === (currentQuarter ? previousYear : selectedYear - 1) && 
                          (currentQuarter && previousQuarter ? d.quarter === previousQuarter : true)
                        );
                        const totalPrevWebsiteSessions = previousWebsiteData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                        
                        const previousTraffic = data.trafficSources.filter(d => 
                          d.year === (currentQuarter ? previousYear : selectedYear - 1) && 
                          (currentQuarter && previousQuarter ? d.quarter === previousQuarter : true)
                        );
                        
                        // Calculate average percentages for current period
                        const avgPercentages = {
                          'Direct Traffic': currentTraffic.length > 0 ? 
                            currentTraffic.reduce((sum, d) => sum + (d.directTraffic || 0), 0) / currentTraffic.length : 0,
                          'Search Engines': currentTraffic.length > 0 ?
                            currentTraffic.reduce((sum, d) => sum + (d.searchEngines || 0), 0) / currentTraffic.length : 0,
                          'Social Media': currentTraffic.length > 0 ?
                            currentTraffic.reduce((sum, d) => sum + (d.socialMedia || 0), 0) / currentTraffic.length : 0,
                          'External Referrers': currentTraffic.length > 0 ?
                            currentTraffic.reduce((sum, d) => sum + (d.externalReferrers || 0), 0) / currentTraffic.length : 0,
                          'Internal Referrers': currentTraffic.length > 0 ?
                            currentTraffic.reduce((sum, d) => sum + (d.internalReferrers || 0), 0) / currentTraffic.length : 0
                        };
                        
                        // Calculate average percentages for previous period
                        const prevAvgPercentages = {
                          'Direct Traffic': previousTraffic.length > 0 ? 
                            previousTraffic.reduce((sum, d) => sum + (d.directTraffic || 0), 0) / previousTraffic.length : 0,
                          'Search Engines': previousTraffic.length > 0 ?
                            previousTraffic.reduce((sum, d) => sum + (d.searchEngines || 0), 0) / previousTraffic.length : 0,
                          'Social Media': previousTraffic.length > 0 ?
                            previousTraffic.reduce((sum, d) => sum + (d.socialMedia || 0), 0) / previousTraffic.length : 0,
                          'External Referrers': previousTraffic.length > 0 ?
                            previousTraffic.reduce((sum, d) => sum + (d.externalReferrers || 0), 0) / previousTraffic.length : 0,
                          'Internal Referrers': previousTraffic.length > 0 ?
                            previousTraffic.reduce((sum, d) => sum + (d.internalReferrers || 0), 0) / previousTraffic.length : 0
                        };
                        
                        // Convert percentages to actual session counts and calculate trends
                        const sources = Object.entries(avgPercentages).map(([source, percentage]) => {
                          const sessions = Math.round((percentage / 100) * totalWebsiteSessions);
                          const prevPercentage = prevAvgPercentages[source as keyof typeof prevAvgPercentages] || 0;
                          const prevSessions = Math.round((prevPercentage / 100) * totalPrevWebsiteSessions);
                          const trend = prevSessions > 0 ? ((sessions - prevSessions) / prevSessions * 100) : 0;
                          
                          // Determine status based on trend
                          let status = 'STABLE';
                          if (trend > 20) status = 'EXCELLENT';
                          else if (trend > 10) status = 'GROWING';
                          else if (trend > 0) status = 'GOOD';
                          else if (trend < -5) status = 'WARNING';
                          
                          return {
                            source,
                            sessions,
                            percent: percentage.toFixed(1),
                            trend: parseFloat(trend.toFixed(1)),
                            status
                          };
                        });
                        
                        // Sort by sessions descending
                        sources.sort((a, b) => b.sessions - a.sessions);
                        
                        // If no data, show placeholder
                        if (sources.length === 0 || totalWebsiteSessions === 0) {
                          return [{
                            source: 'No data available',
                            sessions: 0,
                            percent: '0.0',
                            trend: 0,
                            status: 'N/A'
                          }];
                        }
                        
                        return sources;
                      })().map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            <div className="flex items-center">
                              {row.source}
                              <InfoTooltip 
                                title={row.source}
                                description={
                                  row.source === 'Direct Traffic' ? 'Visitors who typed your URL directly into their browser, used bookmarks, or clicked links in emails/documents.' :
                                  row.source === 'Search Engines' ? 'Visitors who found your site through search engines like Google, Bing, or Yahoo via organic (non-paid) search results.' :
                                  row.source === 'Social Media' ? 'Visitors who clicked links to your site from social media platforms like LinkedIn, Twitter, Facebook, or Instagram.' :
                                  row.source === 'External Referrers' ? 'Visitors who clicked links from other websites, blogs, or online directories that link to your site.' :
                                  row.source === 'Internal Referrers' ? 'Navigation between pages within your own website or from your other owned properties.' :
                                  'Traffic from this source'
                                }
                                example={
                                  row.source === 'Direct Traffic' ? 'Often indicates brand awareness and returning visitors' :
                                  row.source === 'Search Engines' ? 'Indicates SEO effectiveness and content relevance' :
                                  row.source === 'Social Media' ? 'Shows social media marketing effectiveness' :
                                  row.source === 'External Referrers' ? 'Indicates backlink quality and partnerships' :
                                  undefined
                                }
                                icon="help"
                                position="auto"
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.sessions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.percent}%</td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`flex items-center gap-1 ${row.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {row.trend > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                              {Math.abs(row.trend).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                              row.status === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                              row.status === 'GROWING' ? 'bg-blue-100 text-blue-800' :
                              row.status === 'GOOD' ? 'bg-cyan-100 text-cyan-800' :
                              row.status === 'STABLE' ? 'bg-gray-100 text-gray-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SEO & Search Tab */}
          {activeTab === 'seo' && data && (
            <div id="tab-content-seo" className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(() => {
                  // Get data for selected period
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  const currentSearch = data.searchData.filter(d => 
                    d.year === selectedYear && 
                    (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  
                  // Determine comparison period based on compareType
                  let previousQuarter, previousYear, previousPeriodLabel;
                  
                  if (compareType === 'prev_year') {
                    // Previous Year Same Quarter
                    previousQuarter = currentQuarter;
                    previousYear = selectedYear - 1;
                    previousPeriodLabel = currentQuarter 
                      ? `${currentQuarter} ${previousYear}` 
                      : `${previousYear}`;
                  } else {
                    // Previous Quarter (default)
                    if (currentQuarter) {
                      previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                       currentQuarter === 'Q2' ? 'Q1' :
                                       currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                      previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                      previousPeriodLabel = `${previousQuarter} ${previousYear}`;
                    } else {
                      // For full year comparison
                      previousQuarter = null;
                      previousYear = selectedYear - 1;
                      previousPeriodLabel = `${previousYear}`;
                    }
                  }
                  
                  const previousSearch = data.searchData.filter(d => 
                    d.year === previousYear && 
                    (previousQuarter ? d.quarter === previousQuarter : true)
                  );
                  
                  const totalImpressions = currentSearch.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const totalClicks = currentSearch.reduce((sum, d) => sum + (d.clicks || 0), 0);
                  const avgCTR = currentSearch.length > 0 ? 
                    currentSearch.reduce((sum, d) => sum + (d.ctr || 0), 0) / currentSearch.length : 0;
                  const avgPosition = currentSearch.length > 0 ? 
                    currentSearch.reduce((sum, d) => sum + (d.avgPosition || 0), 0) / currentSearch.length : 0;
                  
                  // Previous period metrics
                  const prevImpressions = previousSearch.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const prevClicks = previousSearch.reduce((sum, d) => sum + (d.clicks || 0), 0);
                  const prevCTR = previousSearch.length > 0 ? 
                    previousSearch.reduce((sum, d) => sum + (d.ctr || 0), 0) / previousSearch.length : 0;
                  const prevPosition = previousSearch.length > 0 ? 
                    previousSearch.reduce((sum, d) => sum + (d.avgPosition || 0), 0) / previousSearch.length : 0;
                  
                  return [
                    { 
                      label: 'Search Impressions', 
                      value: formatNumber(totalImpressions), 
                      trend: prevImpressions > 0 ? ((totalImpressions - prevImpressions) / prevImpressions * 100).toFixed(1) : 0, 
                      icon: Eye,
                      positive: totalImpressions > prevImpressions,
                      previousValue: prevImpressions,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Search Clicks', 
                      value: formatNumber(totalClicks), 
                      trend: prevClicks > 0 ? ((totalClicks - prevClicks) / prevClicks * 100).toFixed(1) : 0, 
                      icon: MousePointer,
                      positive: totalClicks > prevClicks,
                      previousValue: prevClicks,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Click-Through Rate', 
                      value: `${avgCTR.toFixed(2)}%`, 
                      trend: (avgCTR - prevCTR).toFixed(2), 
                      icon: Target,
                      positive: avgCTR > prevCTR,
                      isRate: true,
                      previousValue: prevCTR,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Avg. Position', 
                      value: avgPosition.toFixed(1), 
                      trend: (prevPosition - avgPosition).toFixed(1), // Lower is better for position
                      icon: BarChart3,
                      positive: avgPosition < prevPosition, // Lower position is better
                      isPosition: true,
                      previousValue: prevPosition,
                      previousPeriodLabel
                    }
                  ].map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-indigo-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-indigo-600" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {metric.label}
                      <InfoTooltip 
                        title={metric.label}
                        description={
                          metric.label === 'Search Impressions' ? 'The number of times your website appeared in search results. More impressions mean better visibility.' :
                          metric.label === 'Search Clicks' ? 'The number of times users clicked on your website in search results. Higher clicks indicate compelling titles and descriptions.' :
                          metric.label === 'Click-Through Rate' ? 'The percentage of impressions that resulted in clicks. Industry average is 2-3% for organic search.' :
                          metric.label === 'Avg. Position' ? 'Your average ranking position in search results. Position 1-3 is top of first page, 4-10 is rest of first page.' :
                          'SEO metric'
                        }
                        calculation={
                          metric.label === 'Click-Through Rate' ? 'Clicks ÷ Impressions × 100' :
                          metric.label === 'Avg. Position' ? 'Average of all keyword positions weighted by impressions' :
                          undefined
                        }
                        example={
                          metric.label === 'Search Impressions' ? '10,000 impressions means your site was shown 10,000 times in search' :
                          metric.label === 'Search Clicks' ? 'Focus on improving meta titles and descriptions to increase clicks' :
                          metric.label === 'Click-Through Rate' ? 'A 3% CTR means 3 clicks per 100 impressions' :
                          metric.label === 'Avg. Position' ? 'Position 1.0 is the top result, 11.0 is top of page 2' :
                          undefined
                        }
                        icon="info"
                        position="auto"
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(Number(metric.trend))}{metric.isRate ? 'pp' : metric.isPosition ? ' pos' : '%'} vs {metric.previousPeriodLabel}
                    </div>
                    
                    {/* Comparison value when enabled */}
                    {compareEnabled && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {metric.previousPeriodLabel}: {
                          metric.isRate 
                            ? `${metric.previousValue.toFixed(2)}%`
                            : metric.isPosition
                            ? metric.previousValue.toFixed(1)
                            : formatNumber(metric.previousValue)
                        }
                      </div>
                    )}
                  </div>
                ))
                })()}
              </div>

              {/* Search Performance Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                  Search Performance Trends
                  <InfoTooltip 
                    title="Search Performance Trends"
                    description="Visual representation of your website's search engine visibility over time. Track impressions (how often you appear), clicks (traffic generated), and CTR (effectiveness) to measure SEO success."
                    calculation="Monthly data from search console: Impressions (blue bars), Clicks (green bars), CTR% (orange line)"
                    example="Rising impressions with flat clicks suggests you need to improve your meta titles and descriptions to be more compelling"
                    icon="info"
                    position="auto"
                  />
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={(() => {
                    const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                    const searchData = data.searchData.filter(d => 
                      d.year === selectedYear && 
                      (currentQuarter ? d.quarter === currentQuarter : true)
                    );
                    
                    return searchData.map(d => ({
                      month: d.monthName.slice(0, 3),
                      impressions: d.impressions,
                      clicks: d.clicks,
                      ctr: d.ctr,
                      position: d.avgPosition
                    }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="impressions" fill="#6366f1" name="Impressions" />
                    <Bar yAxisId="left" dataKey="clicks" fill="#10b981" name="Clicks" />
                    <Line yAxisId="right" type="monotone" dataKey="ctr" stroke="#f59e0b" strokeWidth={2} name="CTR %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Search Performance Table */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    Monthly Search Performance
                    <InfoTooltip 
                      title="Monthly Search Performance"
                      description="Month-by-month breakdown of your search engine visibility and performance. Track how your SEO efforts are improving over time and identify seasonal patterns in search behavior."
                      calculation="Data aggregated monthly from search console showing impressions (visibility), clicks (traffic), CTR (effectiveness), and average position (ranking)"
                      example="If clicks increase but CTR decreases, you're getting more visibility but may need better meta descriptions"
                      icon="info"
                      position="auto"
                    />
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clicks</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Position</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                        const searchData = data.searchData.filter(d => 
                          d.year === selectedYear && 
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );
                        
                        return searchData.map((row, index) => {
                          const prevMonth = searchData[index - 1];
                          const trend = prevMonth ? 
                            ((row.clicks - prevMonth.clicks) / prevMonth.clicks * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.monthName}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{row.impressions.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{row.clicks.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{row.ctr.toFixed(2)}%</td>
                              <td className="px-6 py-4 text-sm text-gray-600">{row.avgPosition.toFixed(1)}</td>
                              <td className="px-6 py-4">
                                <div className={`flex items-center gap-1 text-sm ${Number(trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {Number(trend) >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                  {Math.abs(Number(trend))}%
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && data && (
            <div id="tab-content-social" className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(() => {
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  const currentSocial = data.socialData.filter(d => 
                    d.year === selectedYear && 
                    (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  
                  // Determine comparison period based on compareType
                  let previousQuarter, previousYear, previousPeriodLabel;
                  
                  if (compareType === 'prev_year') {
                    // Previous Year Same Quarter
                    previousQuarter = currentQuarter;
                    previousYear = selectedYear - 1;
                    previousPeriodLabel = currentQuarter 
                      ? `${currentQuarter} ${previousYear}` 
                      : `${previousYear}`;
                  } else {
                    // Previous Quarter (default)
                    if (currentQuarter) {
                      previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                       currentQuarter === 'Q2' ? 'Q1' :
                                       currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                      previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                      previousPeriodLabel = `${previousQuarter} ${previousYear}`;
                    } else {
                      // For full year comparison
                      previousQuarter = null;
                      previousYear = selectedYear - 1;
                      previousPeriodLabel = `${previousYear}`;
                    }
                  }
                  
                  const previousSocial = data.socialData.filter(d => 
                    d.year === previousYear && 
                    (previousQuarter ? d.quarter === previousQuarter : true)
                  );
                  
                  const totalImpressions = currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const totalReactions = currentSocial.reduce((sum, d) => sum + (d.reactions || 0), 0);
                  const totalEngagements = currentSocial.reduce((sum, d) => 
                    sum + (d.reactions || 0) + (d.comments || 0) + (d.shares || 0), 0);
                  const totalClicks = currentSocial.reduce((sum, d) => sum + (d.clicks || 0), 0);
                  
                  const engagementRate = totalImpressions > 0 ? (totalEngagements / totalImpressions) * 100 : 0;
                  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
                  
                  // Previous period metrics
                  const prevImpressions = previousSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const prevReactions = previousSocial.reduce((sum, d) => sum + (d.reactions || 0), 0);
                  const prevEngagements = previousSocial.reduce((sum, d) => 
                    sum + (d.reactions || 0) + (d.comments || 0) + (d.shares || 0), 0);
                  const prevClicks = previousSocial.reduce((sum, d) => sum + (d.clicks || 0), 0);
                  const prevEngRate = prevImpressions > 0 ? (prevEngagements / prevImpressions) * 100 : 0;
                  const prevCtr = prevImpressions > 0 ? (prevClicks / prevImpressions) * 100 : 0;
                  
                  return [
                    { 
                      label: 'Total Impressions', 
                      value: formatNumber(totalImpressions), 
                      trend: prevImpressions > 0 ? ((totalImpressions - prevImpressions) / prevImpressions * 100).toFixed(1) : 0, 
                      icon: Eye,
                      positive: totalImpressions > prevImpressions,
                      previousValue: prevImpressions,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Engagement Rate', 
                      value: `${engagementRate.toFixed(2)}%`, 
                      trend: (engagementRate - prevEngRate).toFixed(2), 
                      icon: Activity,
                      positive: engagementRate > prevEngRate,
                      isRate: true,
                      previousValue: prevEngRate,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Total Reactions', 
                      value: formatNumber(totalReactions), 
                      trend: prevReactions > 0 ? ((totalReactions - prevReactions) / prevReactions * 100).toFixed(1) : 0, 
                      icon: Share2,
                      positive: totalReactions > prevReactions,
                      previousValue: prevReactions,
                      previousPeriodLabel
                    },
                    { 
                      label: 'Click-Through Rate', 
                      value: `${ctr.toFixed(2)}%`, 
                      trend: (ctr - prevCtr).toFixed(2), 
                      icon: MousePointer,
                      positive: ctr > prevCtr,
                      isRate: true,
                      previousValue: prevCtr,
                      previousPeriodLabel
                    }
                  ].map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {metric.label}
                      <InfoTooltip 
                        title={metric.label}
                        description={
                          metric.label === 'Total Impressions' ? 'The total number of times your social media content was displayed to users across all platforms. This includes both unique and repeat views.' :
                          metric.label === 'Engagement Rate' ? 'The percentage of people who interacted with your content after seeing it. A key indicator of content quality and audience relevance.' :
                          metric.label === 'Total Reactions' ? 'The sum of all positive interactions on your posts including likes, hearts, thumbs up, and other reaction types across all platforms.' :
                          metric.label === 'Click-Through Rate' ? 'The percentage of people who clicked on links in your social media posts after seeing them. Indicates how compelling your call-to-action is.' :
                          'Social media metric'
                        }
                        calculation={
                          metric.label === 'Total Impressions' ? 'Sum of all post impressions across LinkedIn, Twitter, Facebook, and Instagram' :
                          metric.label === 'Engagement Rate' ? '(Reactions + Comments + Shares + Clicks) ÷ Total Impressions × 100' :
                          metric.label === 'Total Reactions' ? 'Sum of all likes, hearts, and other reactions across all platforms' :
                          metric.label === 'Click-Through Rate' ? 'Link Clicks ÷ Total Impressions × 100' :
                          undefined
                        }
                        example={
                          metric.label === 'Total Impressions' ? '1M impressions means your content was viewed 1 million times' :
                          metric.label === 'Engagement Rate' ? '3-5% is good for B2B, 1-3% is typical for B2C' :
                          metric.label === 'Total Reactions' ? 'Higher reactions indicate content resonates with your audience' :
                          metric.label === 'Click-Through Rate' ? '1-2% CTR is average, above 3% is excellent' :
                          undefined
                        }
                        icon="info"
                        position="auto"
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(Number(metric.trend))}{metric.isRate ? 'pp' : '%'} vs {metric.previousPeriodLabel}
                    </div>
                    
                    {/* Comparison value when enabled */}
                    {compareEnabled && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {metric.previousPeriodLabel}: {
                          metric.isRate 
                            ? `${metric.previousValue.toFixed(2)}%`
                            : formatNumber(metric.previousValue)
                        }
                      </div>
                    )}
                  </div>
                ))
                })()}
              </div>

              {/* Platform Performance Table */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="flex items-center text-lg font-semibold text-gray-900">
                    Platform Performance
                    <InfoTooltip 
                      title="Platform Performance Comparison"
                      description="Detailed breakdown of your social media performance across LinkedIn, Twitter, Facebook, and Instagram. Helps identify which platforms drive the most value for your brand."
                      calculation="Platform-specific metrics aggregated for the selected time period"
                      example="If LinkedIn shows 5% engagement vs Twitter's 2%, focus more content on LinkedIn"
                      icon="info"
                      position="auto"
                    />
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impressions</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagements</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Eng. Rate</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">CTR</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Performance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                        const currentSocial = data.socialData.filter(d => 
                          d.year === selectedYear && 
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );
                        
                        // Group by platform and aggregate
                        const platformData = currentSocial.reduce((acc, item) => {
                          const platform = item.channel || 'Other';
                          if (!acc[platform]) {
                            acc[platform] = {
                              impressions: 0,
                              engagements: 0,
                              clicks: 0
                            };
                          }
                          acc[platform].impressions += item.impressions || 0;
                          acc[platform].engagements += (item.reactions || 0) + (item.comments || 0) + (item.shares || 0);
                          acc[platform].clicks += item.clicks || 0;
                          return acc;
                        }, {} as Record<string, any>);
                        
                        // Convert to array and calculate rates
                        const platforms = Object.entries(platformData).map(([platform, data]: [string, any]) => {
                          const engRate = data.impressions > 0 ? (data.engagements / data.impressions * 100) : 0;
                          const ctr = data.impressions > 0 ? (data.clicks / data.impressions * 100) : 0;
                          
                          // Determine status based on engagement rate
                          let status = 'STABLE';
                          if (engRate > 5) status = 'EXCELLENT';
                          else if (engRate > 4) status = 'GOOD';
                          else if (engRate > 3) status = 'GROWING';
                          
                          return {
                            platform,
                            impressions: data.impressions,
                            engagements: data.engagements,
                            engRate: engRate.toFixed(2),
                            ctr: ctr.toFixed(2),
                            status
                          };
                        });
                        
                        // Sort by impressions descending
                        platforms.sort((a, b) => b.impressions - a.impressions);
                        
                        // If no data, show placeholder
                        if (platforms.length === 0) {
                          return [{
                            platform: 'No data available',
                            impressions: 0,
                            engagements: 0,
                            engRate: '0.00',
                            ctr: '0.00',
                            status: 'N/A'
                          }];
                        }
                        
                        return platforms;
                      })().map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.platform}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.impressions.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.engagements.toLocaleString()}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.engRate}%</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{row.ctr}%</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${
                              row.status === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                              row.status === 'GROWING' ? 'bg-blue-100 text-blue-800' :
                              row.status === 'GOOD' ? 'bg-cyan-100 text-cyan-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Email Marketing Tab */}
          {activeTab === 'email' && data && (
            <div id="tab-content-email" className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(() => {
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  const currentEmail = data.emailData.filter(d => 
                    d.year === selectedYear && 
                    (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  
                  // Determine comparison period based on compareType
                  let previousQuarter, previousYear, previousPeriodLabel;
                  
                  if (compareType === 'prev_year') {
                    // Previous Year Same Quarter
                    previousQuarter = currentQuarter;
                    previousYear = selectedYear - 1;
                    previousPeriodLabel = currentQuarter 
                      ? `${currentQuarter} ${previousYear}` 
                      : `${previousYear}`;
                  } else {
                    // Previous Quarter (default)
                    if (currentQuarter) {
                      previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                       currentQuarter === 'Q2' ? 'Q1' :
                                       currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                      previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                      previousPeriodLabel = `${previousQuarter} ${previousYear}`;
                    } else {
                      // For full year comparison
                      previousQuarter = null;
                      previousYear = selectedYear - 1;
                      previousPeriodLabel = `${previousYear}`;
                    }
                  }
                  
                  const previousEmail = data.emailData.filter(d => 
                    d.year === previousYear && 
                    (previousQuarter ? d.quarter === previousQuarter : true)
                  );
                  
                  const totalEmailsSent = currentEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
                  const totalUniqueOpens = currentEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
                  const totalUniqueClicks = currentEmail.reduce((sum, d) => sum + (d.uniqueClicks || 0), 0);
                  
                  const openRate = totalEmailsSent > 0 ? (totalUniqueOpens / totalEmailsSent) * 100 : 0;
                  const clickRate = totalEmailsSent > 0 ? (totalUniqueClicks / totalEmailsSent) * 100 : 0;
                  const conversionRate = totalUniqueClicks > 0 ? (totalUniqueClicks * 0.25) / totalEmailsSent * 100 : 0; // Estimate
                  
                  // Previous period metrics
                  const prevEmailsSent = previousEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
                  const prevUniqueOpens = previousEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
                  const prevUniqueClicks = previousEmail.reduce((sum, d) => sum + (d.uniqueClicks || 0), 0);
                  
                  const prevOpenRate = prevEmailsSent > 0 ? (prevUniqueOpens / prevEmailsSent) * 100 : 0;
                  const prevClickRate = prevEmailsSent > 0 ? (prevUniqueClicks / prevEmailsSent) * 100 : 0;
                  const prevConversionRate = prevUniqueClicks > 0 ? (prevUniqueClicks * 0.25) / prevEmailsSent * 100 : 0;
                  
                  return [
                    { 
                      label: 'Emails Sent', 
                      value: formatNumber(totalEmailsSent), 
                      trend: prevEmailsSent > 0 ? ((totalEmailsSent - prevEmailsSent) / prevEmailsSent * 100).toFixed(1) : 0, 
                      icon: Mail,
                      positive: totalEmailsSent > prevEmailsSent,
                      previousValue: prevEmailsSent,
                      previousPeriodLabel,
                      isRate: false
                    },
                    { 
                      label: 'Open Rate', 
                      value: `${openRate.toFixed(1)}%`, 
                      trend: (openRate - prevOpenRate).toFixed(2), 
                      icon: Eye,
                      positive: openRate > prevOpenRate,
                      previousValue: prevOpenRate,
                      previousPeriodLabel,
                      isRate: true
                    },
                    { 
                      label: 'Click Rate', 
                      value: `${clickRate.toFixed(1)}%`, 
                      trend: (clickRate - prevClickRate).toFixed(2), 
                      icon: MousePointer,
                      positive: clickRate > prevClickRate,
                      previousValue: prevClickRate,
                      previousPeriodLabel,
                      isRate: true
                    },
                    { 
                      label: 'Conversion Rate', 
                      value: `${conversionRate.toFixed(1)}%`, 
                      trend: (conversionRate - prevConversionRate).toFixed(2), 
                      icon: Target,
                      positive: conversionRate > prevConversionRate,
                      previousValue: prevConversionRate,
                      previousPeriodLabel,
                      isRate: true
                    }
                  ].map((metric, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        <metric.icon className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {metric.label}
                      <InfoTooltip 
                        title={metric.label}
                        description={
                          metric.label === 'Emails Sent' ? 'The total number of email messages successfully delivered to recipients inboxes. This excludes bounced emails and those blocked by spam filters.' :
                          metric.label === 'Open Rate' ? 'The percentage of delivered emails that were opened by recipients. A key indicator of subject line effectiveness and sender reputation.' :
                          metric.label === 'Click Rate' ? 'The percentage of delivered emails where recipients clicked at least one link. Shows how engaging your email content and calls-to-action are.' :
                          metric.label === 'Conversion Rate' ? 'The percentage of email recipients who completed a desired action like making a purchase, signing up, or downloading content after clicking through.' :
                          'Email marketing metric'
                        }
                        calculation={
                          metric.label === 'Emails Sent' ? 'Total delivered emails (sent minus bounces)' :
                          metric.label === 'Open Rate' ? 'Unique Opens ÷ Emails Delivered × 100' :
                          metric.label === 'Click Rate' ? 'Unique Clicks ÷ Emails Delivered × 100' :
                          metric.label === 'Conversion Rate' ? 'Conversions ÷ Emails Delivered × 100' :
                          undefined
                        }
                        example={
                          metric.label === 'Emails Sent' ? 'If you send 10,000 emails and 500 bounce, 9,500 were delivered' :
                          metric.label === 'Open Rate' ? 'B2B average: 15-25%, B2C average: 15-20%. Above 25% is excellent' :
                          metric.label === 'Click Rate' ? 'B2B average: 2.5-3%, B2C average: 2-2.5%. Above 5% is excellent' :
                          metric.label === 'Conversion Rate' ? 'Average: 2-5%. Highly targeted campaigns can achieve 10%+' :
                          undefined
                        }
                        icon="info"
                        position="auto"
                      />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                    <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {Math.abs(Number(metric.trend))}{metric.isRate ? 'pp' : '%'} vs {metric.previousPeriodLabel}
                    </div>
                    
                    {/* Comparison value when enabled */}
                    {compareEnabled && (
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                        {metric.previousPeriodLabel}: {
                          metric.isRate 
                            ? `${metric.previousValue.toFixed(1)}%`
                            : formatNumber(metric.previousValue)
                        }
                      </div>
                    )}
                  </div>
                ))
                })()}
              </div>

              {/* Email Campaign Performance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-6">
                  Campaign Performance Trends
                  <InfoTooltip 
                    title="Email Campaign Metrics"
                    description="Tracks email marketing effectiveness over time. Industry benchmarks: Open Rate 15-25%, Click Rate 2-5%."
                    calculation="Rates calculated per campaign and aggregated"
                    example="Conv Rate estimates conversions from email clicks"
                  />
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={(() => {
                    const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                    const emailData = data.emailData.filter(d => 
                      d.year === selectedYear && 
                      (currentQuarter ? d.quarter === currentQuarter : true)
                    );
                    
                    return emailData.map(d => ({
                      month: d.monthName.slice(0, 3),
                      openRate: (d.emailsSent || 0) > 0 ? (((d.uniqueOpens || 0) / (d.emailsSent || 1)) * 100).toFixed(1) : 0,
                      clickRate: (d.emailsSent || 0) > 0 ? (((d.uniqueClicks || 0) / (d.emailsSent || 1)) * 100).toFixed(1) : 0,
                      convRate: (d.uniqueClicks || 0) > 0 ? (((d.uniqueClicks || 0) * 0.25) / (d.emailsSent || 1) * 100).toFixed(1) : 0
                    }));
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="openRate" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Open Rate %" />
                    <Area type="monotone" dataKey="clickRate" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Click Rate %" />
                    <Area type="monotone" dataKey="convRate" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Conv Rate %" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Leads & Pipeline Tab */}
          {activeTab === 'leads' && data && (
            <div id="tab-content-leads" className="space-y-8 animate-fadeIn">
              {(() => {
                // Calculate current period data
                const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                const currentLeads = data.leadsData.filter(d =>
                  d.year === selectedYear &&
                  (currentQuarter ? d.quarter === currentQuarter : true)
                );

                // Determine comparison period based on compareType
                let previousQuarter, previousYear, previousPeriodLabel;

                if (compareType === 'prev_year') {
                  // Previous Year Same Quarter
                  previousQuarter = currentQuarter;
                  previousYear = selectedYear - 1;
                  previousPeriodLabel = currentQuarter
                    ? `${currentQuarter} ${previousYear}`
                    : `${previousYear}`;
                } else {
                  // Previous Quarter (default)
                  if (currentQuarter) {
                    previousQuarter = currentQuarter === 'Q1' ? 'Q4' :
                                     currentQuarter === 'Q2' ? 'Q1' :
                                     currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                    previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                  } else {
                    previousQuarter = null;
                    previousYear = selectedYear - 1;
                  }
                  previousPeriodLabel = previousQuarter
                    ? `${previousQuarter} ${previousYear}`
                    : `${previousYear}`;
                }

                // Get previous period data
                const previousLeads = data.leadsData.filter(d =>
                  d.year === previousYear &&
                  (previousQuarter ? d.quarter === previousQuarter : true)
                );

                // Calculate current period metrics
                const currentMetrics = {
                  newProspects: currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0),
                  marketingQualified: currentLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0),
                  salesAccepted: currentLeads.reduce((sum, d) => sum + (d.salesAccepted || 0), 0),
                  opportunities: currentLeads.reduce((sum, d) => sum + (d.opportunities || 0), 0),
                  pipelineValue: currentLeads.reduce((sum, d) => sum + (d.pipelineValue || 0), 0)
                };

                // Calculate previous period metrics
                const previousMetrics = {
                  newProspects: previousLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0),
                  marketingQualified: previousLeads.reduce((sum, d) => sum + (d.marketingQualified || 0), 0),
                  salesAccepted: previousLeads.reduce((sum, d) => sum + (d.salesAccepted || 0), 0),
                  opportunities: previousLeads.reduce((sum, d) => sum + (d.opportunities || 0), 0),
                  pipelineValue: previousLeads.reduce((sum, d) => sum + (d.pipelineValue || 0), 0)
                };

                // Calculate trends
                const trends = {
                  newProspects: previousMetrics.newProspects > 0
                    ? ((currentMetrics.newProspects - previousMetrics.newProspects) / previousMetrics.newProspects * 100)
                    : 0,
                  marketingQualified: previousMetrics.marketingQualified > 0
                    ? ((currentMetrics.marketingQualified - previousMetrics.marketingQualified) / previousMetrics.marketingQualified * 100)
                    : 0,
                  salesAccepted: previousMetrics.salesAccepted > 0
                    ? ((currentMetrics.salesAccepted - previousMetrics.salesAccepted) / previousMetrics.salesAccepted * 100)
                    : 0,
                  opportunities: previousMetrics.opportunities > 0
                    ? ((currentMetrics.opportunities - previousMetrics.opportunities) / previousMetrics.opportunities * 100)
                    : 0,
                  pipelineValue: previousMetrics.pipelineValue > 0
                    ? ((currentMetrics.pipelineValue - previousMetrics.pipelineValue) / previousMetrics.pipelineValue * 100)
                    : 0
                };

                // Calculate conversion rates for current and previous periods
                const currentConversions = {
                  prospectToMql: currentMetrics.newProspects > 0 ? (currentMetrics.marketingQualified / currentMetrics.newProspects * 100) : 0,
                  mqlToSal: currentMetrics.marketingQualified > 0 ? (currentMetrics.salesAccepted / currentMetrics.marketingQualified * 100) : 0,
                  salToOpp: currentMetrics.salesAccepted > 0 ? (currentMetrics.opportunities / currentMetrics.salesAccepted * 100) : 0
                };

                const previousConversions = {
                  prospectToMql: previousMetrics.newProspects > 0 ? (previousMetrics.marketingQualified / previousMetrics.newProspects * 100) : 0,
                  mqlToSal: previousMetrics.marketingQualified > 0 ? (previousMetrics.salesAccepted / previousMetrics.marketingQualified * 100) : 0,
                  salToOpp: previousMetrics.salesAccepted > 0 ? (previousMetrics.opportunities / previousMetrics.salesAccepted * 100) : 0
                };

                const conversionTrends = {
                  prospectToMql: previousConversions.prospectToMql > 0
                    ? (currentConversions.prospectToMql - previousConversions.prospectToMql)
                    : 0,
                  mqlToSal: previousConversions.mqlToSal > 0
                    ? (currentConversions.mqlToSal - previousConversions.mqlToSal)
                    : 0,
                  salToOpp: previousConversions.salToOpp > 0
                    ? (currentConversions.salToOpp - previousConversions.salToOpp)
                    : 0
                };

                return (
                  <>
                    {/* Lead Funnel */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                      <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-8">
                        Lead Generation Funnel - {selectedPeriod} {selectedYear}
                        <InfoTooltip
                          title="Lead Conversion Funnel"
                          description="Visualizes how prospects move through your marketing funnel from initial interest to qualified opportunities."
                          calculation="Stage-to-stage conversion rates"
                          example="MQL = Marketing Qualified Lead, SAL = Sales Accepted Lead"
                          icon="info"
                          position="auto"
                        />
                      </h3>
                      <div className="relative max-w-3xl mx-auto">
                        {(() => {
                          // Calculate conversion rates
                          const mqlRate = currentMetrics.newProspects > 0 ? Math.round((currentMetrics.marketingQualified / currentMetrics.newProspects) * 100) : 0;
                          const salRate = currentMetrics.marketingQualified > 0 ? Math.round((currentMetrics.salesAccepted / currentMetrics.marketingQualified) * 100) : 0;
                          const oppRate = currentMetrics.salesAccepted > 0 ? Math.round((currentMetrics.opportunities / currentMetrics.salesAccepted) * 100) : 0;

                          // Build funnel stages with comparison data
                          const stages = [
                            {
                              stage: 'New Prospects',
                              value: currentMetrics.newProspects,
                              previousValue: previousMetrics.newProspects,
                              trend: trends.newProspects,
                              color: 'bg-gradient-to-r from-blue-500 to-blue-600',
                              width: 100,
                              conversionRate: null
                            },
                            {
                              stage: 'Marketing Qualified Leads (MQL)',
                              value: currentMetrics.marketingQualified,
                              previousValue: previousMetrics.marketingQualified,
                              trend: trends.marketingQualified,
                              color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                              width: 75,
                              conversionRate: mqlRate
                            },
                            {
                              stage: 'Sales Accepted Leads (SAL)',
                              value: currentMetrics.salesAccepted,
                              previousValue: previousMetrics.salesAccepted,
                              trend: trends.salesAccepted,
                              color: 'bg-gradient-to-r from-purple-500 to-purple-600',
                              width: 50,
                              conversionRate: salRate
                            },
                            {
                              stage: 'Opportunities',
                              value: currentMetrics.opportunities,
                              previousValue: previousMetrics.opportunities,
                              trend: trends.opportunities,
                              color: 'bg-gradient-to-r from-pink-500 to-pink-600',
                              width: 25,
                              conversionRate: oppRate
                            }
                          ];
                    
                    return (
                      <div className="space-y-1">
                        {stages.map((stage, index) => (
                          <div key={index} className="relative">
                            {/* Conversion Rate Label */}
                            {stage.conversionRate !== null && index > 0 && (
                              <div className="absolute -top-0 left-1/2 transform -translate-x-1/2 -translate-y-full pb-2">
                                <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">
                                  {stage.conversionRate}% conversion
                                </div>
                              </div>
                            )}
                            
                            {/* Funnel Stage */}
                            <div className="relative" style={{ paddingLeft: `${(100 - stage.width) / 2}%`, paddingRight: `${(100 - stage.width) / 2}%` }}>
                              <div 
                                className={`${stage.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer`}
                              >
                                <div className="px-6 py-5">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <div className="text-sm font-medium text-white/90 mb-1">{stage.stage}</div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-3xl font-bold">{formatNumber(stage.value)}</div>
                                        {stage.trend !== 0 && (
                                          <div className={`flex items-center text-sm ${stage.trend > 0 ? 'text-green-200' : 'text-red-200'}`}>
                                            {stage.trend > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                            {Math.abs(stage.trend).toFixed(1)}%
                                          </div>
                                        )}
                                      </div>
                                      {compareEnabled && stage.previousValue > 0 && (
                                        <div className="text-xs text-white/70 mt-1">
                                          Previous: {formatNumber(stage.previousValue)}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      {index === 0 && (
                                        <div className="text-sm font-medium text-white/90">100%</div>
                                      )}
                                      {index > 0 && currentMetrics.newProspects > 0 && (
                                        <div className="text-sm font-medium text-white/90">
                                          {Math.round((stage.value / currentMetrics.newProspects) * 100)}% of total
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Arrow Between Stages */}
                            {index < stages.length - 1 && (
                              <div className="flex justify-center my-2">
                                <div className="relative">
                                  <ChevronDown className="h-6 w-6 text-gray-400 animate-pulse" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                        
                        {/* Summary Stats */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">
                                {currentMetrics.newProspects > 0 ? Math.round((currentMetrics.opportunities / currentMetrics.newProspects) * 100) : 0}%
                              </div>
                              <div className="text-xs text-gray-500">Overall Conversion</div>
                              {previousMetrics.newProspects > 0 && (
                                <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                                  trends.opportunities > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {trends.opportunities > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  {Math.abs(trends.opportunities).toFixed(1)}% vs {previousPeriodLabel}
                                </div>
                              )}
                              {compareEnabled && previousMetrics.newProspects > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Previous: {previousMetrics.newProspects > 0 ? Math.round((previousMetrics.opportunities / previousMetrics.newProspects) * 100) : 0}%
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">
                                {formatNumber(currentMetrics.opportunities)}
                              </div>
                              <div className="text-xs text-gray-500">Total Opportunities</div>
                              {trends.opportunities !== 0 && (
                                <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                                  trends.opportunities > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {trends.opportunities > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  {Math.abs(trends.opportunities).toFixed(1)}% vs {previousPeriodLabel}
                                </div>
                              )}
                              {compareEnabled && previousMetrics.opportunities > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Previous: {formatNumber(previousMetrics.opportunities)}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-blue-600">
                                {formatNumber(currentMetrics.newProspects)}
                              </div>
                              <div className="text-xs text-gray-500">Total Prospects</div>
                              {trends.newProspects !== 0 && (
                                <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${
                                  trends.newProspects > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {trends.newProspects > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                  {Math.abs(trends.newProspects).toFixed(1)}% vs {previousPeriodLabel}
                                </div>
                              )}
                              {compareEnabled && previousMetrics.newProspects > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Previous: {formatNumber(previousMetrics.newProspects)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                    </div>

                    {/* Pipeline Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Conversion Rates - {selectedPeriod} {selectedYear}</h4>
                        <div className="space-y-3">
                          {(() => {
                            const metrics = [
                              {
                                label: 'Prospect → MQL',
                                value: Math.round(currentConversions.prospectToMql),
                                previousValue: Math.round(previousConversions.prospectToMql),
                                trend: conversionTrends.prospectToMql,
                                target: 50
                              },
                              {
                                label: 'MQL → SAL',
                                value: Math.round(currentConversions.mqlToSal),
                                previousValue: Math.round(previousConversions.mqlToSal),
                                trend: conversionTrends.mqlToSal,
                                target: 60
                              },
                              {
                                label: 'SAL → Opportunity',
                                value: Math.round(currentConversions.salToOpp),
                                previousValue: Math.round(previousConversions.salToOpp),
                                trend: conversionTrends.salToOpp,
                                target: 50
                              }
                            ];
                      
                            return metrics.map((metric, index) => (
                              <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">{metric.label}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{metric.value}%</span>
                                    {metric.trend !== 0 && (
                                      <div className={`flex items-center text-xs ${metric.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {metric.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                        {Math.abs(metric.trend).toFixed(1)}pp
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      metric.value >= metric.target ? 'bg-green-500' : 'bg-yellow-500'
                                    }`}
                                    style={{ width: `${Math.min(metric.value, 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>Target: {metric.target}%</span>
                                  {metric.trend !== 0 && (
                                    <span className={metric.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                                      vs {previousPeriodLabel}
                                    </span>
                                  )}
                                </div>
                                {compareEnabled && metric.previousValue > 0 && (
                                  <div className="text-xs text-gray-500 mt-1 pt-1 border-t">
                                    Previous: {metric.previousValue}%
                                  </div>
                                )}
                              </div>
                            ));
                    })()}
                  </div>
                </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h4 className="text-base font-semibold text-gray-900 mb-4">Pipeline Summary - {selectedPeriod} {selectedYear}</h4>
                        <div className="space-y-4">
                          {(() => {
                            const avgDealSize = currentMetrics.opportunities > 0 ? currentMetrics.pipelineValue / currentMetrics.opportunities : 0;
                            const prevAvgDealSize = previousMetrics.opportunities > 0 ? previousMetrics.pipelineValue / previousMetrics.opportunities : 0;
                            const avgDealSizeTrend = prevAvgDealSize > 0 ? ((avgDealSize - prevAvgDealSize) / prevAvgDealSize * 100) : 0;

                            return (
                              <>
                                <div className="text-center py-4">
                                  <div className="flex items-center justify-center gap-2">
                                    <div className="text-3xl font-bold text-[#005C84]">
                                      ${currentMetrics.pipelineValue > 0 ? formatNumber(currentMetrics.pipelineValue) : '0'}
                                    </div>
                                    {trends.pipelineValue !== 0 && (
                                      <div className={`flex items-center text-sm ${trends.pipelineValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {trends.pipelineValue > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                        {Math.abs(trends.pipelineValue).toFixed(1)}%
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-500 mt-1">Total Pipeline Value</div>
                                  {trends.pipelineValue !== 0 && (
                                    <div className={`text-xs mt-1 ${trends.pipelineValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {Math.abs(trends.pipelineValue).toFixed(1)}% vs {previousPeriodLabel}
                                    </div>
                                  )}
                                  {compareEnabled && previousMetrics.pipelineValue > 0 && (
                                    <div className="text-xs text-gray-500 mt-1 pt-1 border-t">
                                      Previous: ${formatNumber(previousMetrics.pipelineValue)}
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="text-xl font-semibold text-gray-900">
                                        ${avgDealSize > 0 ? formatNumber(avgDealSize) : '0'}
                                      </div>
                                      {avgDealSizeTrend !== 0 && (
                                        <div className={`flex items-center text-xs ${avgDealSizeTrend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {avgDealSizeTrend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                          {Math.abs(avgDealSizeTrend).toFixed(1)}%
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">Avg Deal Size</div>
                                    {compareEnabled && prevAvgDealSize > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Previous: ${formatNumber(prevAvgDealSize)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center justify-center gap-2">
                                      <div className="text-xl font-semibold text-gray-900">{currentMetrics.opportunities}</div>
                                      {trends.opportunities !== 0 && (
                                        <div className={`flex items-center text-xs ${trends.opportunities > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                          {trends.opportunities > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                          {Math.abs(trends.opportunities).toFixed(1)}%
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">Active Opportunities</div>
                                    {compareEnabled && previousMetrics.opportunities > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Previous: {previousMetrics.opportunities}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Share of Voice Tab */}
          {activeTab === 'sov' && data && (
            <div id="tab-content-sov" className="space-y-8 animate-fadeIn">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(() => {
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  const sovData = data.shareOfVoiceData.filter(d => 
                    d.year === selectedYear && 
                    (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  
                  // Calculate metrics
                  const totalMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                  const totalReach = sovData.reduce((sum, d) => sum + (d.mediaReachImpressions || 0), 0);
                  const socialMentions = sovData.reduce((sum, d) => sum + (d.socialMentions || 0), 0);
                  // const competitor1Mentions = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                  // const competitor2Mentions = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                  
                  // Calculate Share of Voice percentage
                  // const totalCompetitiveMentions = totalMentions + competitor1Mentions + competitor2Mentions;
                  // const shareOfVoice = totalCompetitiveMentions > 0 
                  //   ? ((totalMentions / totalCompetitiveMentions) * 100).toFixed(1) 
                  //   : 0;
                  
                  // Calculate previous period for comparison
                  let previousQuarter, previousYear;
                  if (compareType === 'prev_year') {
                    previousQuarter = currentQuarter;
                    previousYear = selectedYear - 1;
                  } else {
                    if (currentQuarter) {
                      previousQuarter = currentQuarter === 'Q1' ? 'Q4' : 
                                       currentQuarter === 'Q2' ? 'Q1' :
                                       currentQuarter === 'Q3' ? 'Q2' : 'Q3';
                      previousYear = currentQuarter === 'Q1' ? selectedYear - 1 : selectedYear;
                    } else {
                      previousQuarter = null;
                      previousYear = selectedYear - 1;
                    }
                  }
                  
                  const previousSovData = data.shareOfVoiceData.filter(d => 
                    d.year === previousYear && 
                    (previousQuarter ? d.quarter === previousQuarter : true)
                  );
                  
                  const prevMentions = previousSovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                  const prevReach = previousSovData.reduce((sum, d) => sum + (d.mediaReachImpressions || 0), 0);
                  const prevSocialMentions = previousSovData.reduce((sum, d) => sum + (d.socialMentions || 0), 0);
                  
                  return [
                    {
                      label: 'Media Mentions',
                      value: totalMentions.toLocaleString(),
                      trend: prevMentions > 0 ? ((totalMentions - prevMentions) / prevMentions * 100).toFixed(1) : 0,
                      icon: Globe,
                      positive: totalMentions > prevMentions,
                      previousValue: prevMentions,
                      description: 'Total mentions across traditional media outlets',
                      calculation: 'Sum of all media mentions for selected period',
                      example: 'News articles, press releases, broadcast mentions'
                    },
                    {
                      label: 'Total Media Reach',
                      value: formatNumber(totalReach),
                      trend: prevReach > 0 ? ((totalReach - prevReach) / prevReach * 100).toFixed(1) : 0,
                      icon: Users,
                      positive: totalReach > prevReach,
                      previousValue: prevReach,
                      description: 'Estimated audience reached through media coverage',
                      calculation: 'Sum of circulation/viewership of all media mentions',
                      example: 'If mentioned in outlet with 1M readers, reach = 1M'
                    },
                    {
                      label: 'Social Media Mentions',
                      value: socialMentions.toLocaleString(),
                      trend: prevSocialMentions > 0 ? ((socialMentions - prevSocialMentions) / prevSocialMentions * 100).toFixed(1) : 0,
                      icon: Share2,
                      positive: socialMentions > prevSocialMentions,
                      previousValue: prevSocialMentions,
                      description: 'Brand mentions across social media platforms',
                      calculation: 'Twitter + LinkedIn + Facebook + Instagram mentions',
                      example: 'Tweets, posts, comments mentioning CAAT'
                    }
                  ].map((metric, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-[#005C84]/10 rounded-lg">
                          <metric.icon className="h-5 w-5 text-[#005C84]" />
                        </div>
                      </div>
                      <div className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        {metric.label}
                        <InfoTooltip 
                          title={metric.label}
                          description={metric.description}
                          calculation={metric.calculation}
                          example={metric.example}
                          icon="info"
                          position="auto"
                        />
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                      <div className={`flex items-center gap-1 text-sm ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {Math.abs(Number(metric.trend))}% vs {previousQuarter || previousYear}
                      </div>
                      {compareEnabled && (
                        <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
                          Previous: {metric.previousValue.toLocaleString()}
                        </div>
                      )}
                    </div>
                  ))
                })()}
              </div>

              {/* Share of Voice Percentage Card */}
              <div className="bg-gradient-to-br from-[#005C84] to-[#55A51C] p-8 rounded-xl text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2 opacity-90">Your Share of Voice</h3>
                    <div className="text-5xl font-bold">
                      {(() => {
                        const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                        const sovData = data.shareOfVoiceData.filter(d =>
                          d.year === selectedYear &&
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );

                        const totalMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                        const competitor1Mentions = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                        const competitor2Mentions = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                        const totalCompetitiveMentions = totalMentions + competitor1Mentions + competitor2Mentions;
                        const shareOfVoice = totalCompetitiveMentions > 0
                          ? ((totalMentions / totalCompetitiveMentions) * 100)
                          : 0;

                        return shareOfVoice.toFixed(1);
                      })()}%
                    </div>
                    <p className="mt-2 opacity-80">of total industry mentions</p>

                    {/* Comparison indicator */}
                    {compareEnabled && (() => {
                      const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                      const sovData = data.shareOfVoiceData.filter(d =>
                        d.year === selectedYear &&
                        (currentQuarter ? d.quarter === currentQuarter : true)
                      );

                      // Calculate previous period data
                      let previousQuarter, previousYear;
                      if (compareType === 'prev_year') {
                        previousQuarter = currentQuarter;
                        previousYear = selectedYear - 1;
                      } else {
                        if (currentQuarter) {
                          const quarterNum = parseInt(currentQuarter.replace('Q', ''));
                          if (quarterNum === 1) {
                            previousQuarter = 'Q4';
                            previousYear = selectedYear - 1;
                          } else {
                            previousQuarter = `Q${quarterNum - 1}`;
                            previousYear = selectedYear;
                          }
                        } else {
                          previousQuarter = null;
                          previousYear = selectedYear - 1;
                        }
                      }

                      const prevSovData = data.shareOfVoiceData.filter(d =>
                        d.year === previousYear &&
                        (previousQuarter ? d.quarter === previousQuarter : true)
                      );

                      const currentTotalMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                      const currentComp1Mentions = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                      const currentComp2Mentions = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                      const currentTotalAll = currentTotalMentions + currentComp1Mentions + currentComp2Mentions;
                      const currentSov = currentTotalAll > 0 ? ((currentTotalMentions / currentTotalAll) * 100) : 0;

                      const prevTotalMentions = prevSovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                      const prevComp1Mentions = prevSovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                      const prevComp2Mentions = prevSovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                      const prevTotalAll = prevTotalMentions + prevComp1Mentions + prevComp2Mentions;
                      const prevSov = prevTotalAll > 0 ? ((prevTotalMentions / prevTotalAll) * 100) : 0;

                      const sovChange = currentSov - prevSov;

                      return (
                        <div className="mt-3 flex items-center gap-2">
                          <div className={`flex items-center gap-1 text-sm ${sovChange > 0 ? 'text-green-200' : sovChange < 0 ? 'text-red-200' : 'text-gray-200'}`}>
                            {sovChange > 0 ? <TrendingUp className="h-4 w-4" /> : sovChange < 0 ? <TrendingDown className="h-4 w-4" /> : <span className="w-4 h-4" />}
                            {sovChange !== 0 ? `${sovChange > 0 ? '+' : ''}${sovChange.toFixed(1)}%` : '0.0%'}
                          </div>
                          <span className="text-sm opacity-70">
                            Previous: {prevSov.toFixed(1)}%
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  <InfoTooltip
                    title="Share of Voice"
                    description="Your brand's percentage of total media mentions compared to competitors"
                    calculation="(Your Mentions ÷ Total Industry Mentions) × 100"
                    example="If you have 100 mentions and competitors have 200, your SOV is 33.3%"
                    icon="info"
                    position="auto"
                  />
                </div>
              </div>

              {/* Competitor Comparison Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Competitor Comparison</h3>
                  {compareEnabled && (
                    <span className="text-sm text-gray-600">
                      Current vs {compareType === 'prev_year' ? 'Previous Year' : 'Previous Quarter'}
                    </span>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={(() => {
                    const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                    const sovData = data.shareOfVoiceData.filter(d =>
                      d.year === selectedYear &&
                      (currentQuarter ? d.quarter === currentQuarter : true)
                    );

                    let chartData;
                    if (compareEnabled && compareType) {
                      // Calculate previous period data
                      let previousQuarter, previousYear;
                      if (compareType === 'prev_year') {
                        previousQuarter = currentQuarter;
                        previousYear = selectedYear - 1;
                      } else {
                        if (currentQuarter) {
                          const quarterNum = parseInt(currentQuarter.replace('Q', ''));
                          if (quarterNum === 1) {
                            previousQuarter = 'Q4';
                            previousYear = selectedYear - 1;
                          } else {
                            previousQuarter = `Q${quarterNum - 1}`;
                            previousYear = selectedYear;
                          }
                        } else {
                          previousQuarter = null;
                          previousYear = selectedYear - 1;
                        }
                      }

                      const prevSovData = data.shareOfVoiceData.filter(d =>
                        d.year === previousYear &&
                        (previousQuarter ? d.quarter === previousQuarter : true)
                      );

                      // Aggregate data for comparison view
                      const currentTotalMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                      const currentComp1Mentions = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                      const currentComp2Mentions = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);

                      const prevTotalMentions = prevSovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                      const prevComp1Mentions = prevSovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                      const prevComp2Mentions = prevSovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);

                      chartData = [
                        {
                          period: 'Current',
                          'CAAT': currentTotalMentions,
                          'Competitor 1': currentComp1Mentions,
                          'Competitor 2': currentComp2Mentions
                        },
                        {
                          period: 'Previous',
                          'CAAT': prevTotalMentions,
                          'Competitor 1': prevComp1Mentions,
                          'Competitor 2': prevComp2Mentions
                        }
                      ];
                    } else {
                      // Original monthly data view
                      chartData = sovData.map(d => ({
                        month: d.monthName,
                        'CAAT': d.mediaMentionVolume || 0,
                        'Competitor 1': d.competitor1Mentions || 0,
                        'Competitor 2': d.competitor2Mentions || 0
                      }));
                    }

                    return chartData;
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey={compareEnabled ? "period" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="CAAT" fill="#005C84" />
                    <Bar dataKey="Competitor 1" fill="#55A51C" />
                    <Bar dataKey="Competitor 2" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Competitor Ranking Table */}
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Market Position Ranking</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Mentions</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Share of Voice</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                        const sovData = data.shareOfVoiceData.filter(d =>
                          d.year === selectedYear &&
                          (currentQuarter ? d.quarter === currentQuarter : true)
                        );

                        // Calculate previous period data if comparison is enabled
                        let previousSovData: any[] = [];
                        if (compareEnabled && compareType) {
                          let previousQuarter, previousYear;
                          if (compareType === 'prev_year') {
                            previousQuarter = currentQuarter;
                            previousYear = selectedYear - 1;
                          } else {
                            if (currentQuarter) {
                              const quarterNum = parseInt(currentQuarter.replace('Q', ''));
                              if (quarterNum === 1) {
                                previousQuarter = 'Q4';
                                previousYear = selectedYear - 1;
                              } else {
                                previousQuarter = `Q${quarterNum - 1}`;
                                previousYear = selectedYear;
                              }
                            } else {
                              previousQuarter = null;
                              previousYear = selectedYear - 1;
                            }
                          }

                          previousSovData = data.shareOfVoiceData.filter(d =>
                            d.year === previousYear &&
                            (previousQuarter ? d.quarter === previousQuarter : true)
                          );
                        }

                        const totalMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                        const competitor1Mentions = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                        const competitor2Mentions = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                        const totalAll = totalMentions + competitor1Mentions + competitor2Mentions;

                        // Calculate previous period totals for comparison
                        const prevTotalMentions = previousSovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                        const prevCompetitor1Mentions = previousSovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                        const prevCompetitor2Mentions = previousSovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                        const prevTotalAll = prevTotalMentions + prevCompetitor1Mentions + prevCompetitor2Mentions;

                        // Calculate share of voice changes
                        const currentCaatSov = totalAll > 0 ? (totalMentions / totalAll * 100) : 0;
                        const prevCaatSov = prevTotalAll > 0 ? (prevTotalMentions / prevTotalAll * 100) : 0;
                        const caatSovChange = compareEnabled ? currentCaatSov - prevCaatSov : 0;

                        const currentComp1Sov = totalAll > 0 ? (competitor1Mentions / totalAll * 100) : 0;
                        const prevComp1Sov = prevTotalAll > 0 ? (prevCompetitor1Mentions / prevTotalAll * 100) : 0;
                        const comp1SovChange = compareEnabled ? currentComp1Sov - prevComp1Sov : 0;

                        const currentComp2Sov = totalAll > 0 ? (competitor2Mentions / totalAll * 100) : 0;
                        const prevComp2Sov = prevTotalAll > 0 ? (prevCompetitor2Mentions / prevTotalAll * 100) : 0;
                        const comp2SovChange = compareEnabled ? currentComp2Sov - prevComp2Sov : 0;

                        const brands = [
                          {
                            name: 'CAAT Pension Plan',
                            mentions: totalMentions,
                            sov: currentCaatSov,
                            change: caatSovChange,
                            isUs: true
                          },
                          {
                            name: 'Competitor 1',
                            mentions: competitor1Mentions,
                            sov: currentComp1Sov,
                            change: comp1SovChange,
                            isUs: false
                          },
                          {
                            name: 'Competitor 2',
                            mentions: competitor2Mentions,
                            sov: currentComp2Sov,
                            change: comp2SovChange,
                            isUs: false
                          }
                        ].sort((a, b) => b.mentions - a.mentions);
                        
                        return brands.map((brand, index) => (
                          <tr key={index} className={brand.isUs ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`text-lg font-bold ${index === 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                  #{index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <span className={`font-medium ${brand.isUs ? 'text-[#005C84]' : 'text-gray-900'}`}>
                                  {brand.name}
                                </span>
                                {brand.isUs && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-[#005C84] text-white rounded-md">You</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {brand.mentions.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className={`h-2 rounded-full ${brand.isUs ? 'bg-[#005C84]' : 'bg-gray-400'}`}
                                    style={{ width: `${brand.sov}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{brand.sov.toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              {compareEnabled ? (
                                <div className={`flex items-center gap-1 text-sm ${brand.change > 0 ? 'text-green-600' : brand.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {brand.change > 0 ? <TrendingUp className="h-4 w-4" /> : brand.change < 0 ? <TrendingDown className="h-4 w-4" /> : <span className="w-4 h-4" />}
                                  {brand.change !== 0 ? `${brand.change > 0 ? '+' : ''}${brand.change.toFixed(1)}%` : '0.0%'}
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-md ${
                                index === 0 ? 'bg-green-100 text-green-800' : 
                                brand.isUs ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {index === 0 ? 'Leader' : brand.isUs ? 'Rising' : 'Competing'}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Quarterly Analysis Tab */}
          {activeTab === 'quarterly' && data && (
            <div id="tab-content-quarterly" className="space-y-8 animate-fadeIn">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Quarterly Performance Comparison - All Channels</h3>
                  <div className="flex gap-2">
                    {(['all', 'traffic', 'engagement', 'conversion'] as ChartView[]).map(view => (
                      <button
                        key={view}
                        onClick={() => setQuarterlyChartView(view)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          quarterlyChartView === view
                            ? 'bg-[#005C84] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {view === 'all' ? 'All Metrics' : view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={getQuarterlyChartData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {(quarterlyChartView === 'all' || quarterlyChartView === 'traffic') && (
                      <Bar dataKey="sessions" fill="#005C84" name="Website Sessions" />
                    )}
                    {(quarterlyChartView === 'all' || quarterlyChartView === 'engagement') && (
                      <Bar dataKey="socialImpressions" fill="#55A51C" name="Social Impressions" />
                    )}
                    {(quarterlyChartView === 'all' || quarterlyChartView === 'engagement') && (
                      <Bar dataKey="emailsSent" fill="#8b5cf6" name="Emails Sent" />
                    )}
                    {(quarterlyChartView === 'all' || quarterlyChartView === 'conversion') && (
                      <Bar dataKey="leads" fill="#f59e0b" name="New Leads" />
                    )}
                    {(quarterlyChartView === 'all' || quarterlyChartView === 'engagement') && (
                      <Bar dataKey="shareOfVoice" fill="#06b6d4" name="Share of Voice %" />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quarterly Comparison Table */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Metric</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Q1 2024</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Q2 2024</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Q3 2024</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Q4 2024</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Q1 2025</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">QoQ Change</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">YoY Change</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(() => {
                        const metrics = ['Website Sessions', 'Social Impressions', 'Emails Sent', 'Leads Generated', 'Share of Voice %', 'Conversion Rate'];
                        
                        return metrics.map(metric => {
                          const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
                          const years = [2024, 2025];
                          const values: Record<string, number> = {};
                          
                          quarters.forEach(q => {
                            years.forEach(y => {
                              if (y === 2025 && (q === 'Q2' || q === 'Q3' || q === 'Q4')) return; // Skip future quarters
                              
                              const key = `${q.toLowerCase()}_${y.toString().slice(2)}`;
                              
                              if (metric === 'Website Sessions') {
                                const websiteData = data.websiteData.filter(d => d.year === y && d.quarter === q);
                                values[key] = websiteData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                              } else if (metric === 'Social Impressions') {
                                const socialData = data.socialData.filter(d => d.year === y && d.quarter === q);
                                values[key] = socialData.reduce((sum, d) => sum + (d.impressions || 0), 0);
                              } else if (metric === 'Emails Sent') {
                                const emailData = data.emailData.filter(d => d.year === y && d.quarter === q);
                                values[key] = emailData.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
                              } else if (metric === 'Leads Generated') {
                                const leadsData = data.leadsData.filter(d => d.year === y && d.quarter === q);
                                values[key] = leadsData.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                              } else if (metric === 'Share of Voice %') {
                                const sovData = data.shareOfVoiceData.filter(d => d.year === y && d.quarter === q);
                                const ourMediaMentions = sovData.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                                const competitor1 = sovData.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                                const competitor2 = sovData.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                                const totalCompetitiveMentions = ourMediaMentions + competitor1 + competitor2;
                                values[key] = totalCompetitiveMentions > 0 ? (ourMediaMentions / totalCompetitiveMentions) * 100 : 0;
                              } else if (metric === 'Conversion Rate') {
                                const websiteData = data.websiteData.filter(d => d.year === y && d.quarter === q);
                                const leadsData = data.leadsData.filter(d => d.year === y && d.quarter === q);
                                const sessions = websiteData.reduce((sum, d) => sum + (d.sessions || 0), 0);
                                const leads = leadsData.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                                values[key] = sessions > 0 ? ((leads / sessions) * 100) : 0;
                              }
                            });
                          });
                          
                          // Calculate QoQ and YoY
                          const q1_25 = values.q1_25 || 0;
                          const q4_24 = values.q4_24 || 0;
                          const q1_24 = values.q1_24 || 0;
                          
                          const qoq = q4_24 > 0 ? ((q1_25 - q4_24) / q4_24 * 100) : 0;
                          const yoy = q1_24 > 0 ? ((q1_25 - q1_24) / q1_24 * 100) : 0;
                          
                          return {
                            metric,
                            q1_24: values.q1_24 || 0,
                            q2_24: values.q2_24 || 0,
                            q3_24: values.q3_24 || 0,
                            q4_24: values.q4_24 || 0,
                            q1_25: values.q1_25 || 0,
                            qoq: qoq.toFixed(1),
                            yoy: yoy.toFixed(1)
                          };
                        });
                      })().map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.metric}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {(row.metric === 'Conversion Rate' || row.metric === 'Share of Voice %') ? `${row.q1_24.toFixed(1)}%` : row.q1_24.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {(row.metric === 'Conversion Rate' || row.metric === 'Share of Voice %') ? `${row.q2_24.toFixed(1)}%` : row.q2_24.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {(row.metric === 'Conversion Rate' || row.metric === 'Share of Voice %') ? `${row.q3_24.toFixed(1)}%` : row.q3_24.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {(row.metric === 'Conversion Rate' || row.metric === 'Share of Voice %') ? `${row.q4_24.toFixed(1)}%` : row.q4_24.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {(row.metric === 'Conversion Rate' || row.metric === 'Share of Voice %') ? `${row.q1_25.toFixed(1)}%` : row.q1_25.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-4 w-4" />
                              +{row.qoq}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="flex items-center gap-1 text-green-600">
                              <TrendingUp className="h-4 w-4" />
                              +{row.yoy}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* Year-over-Year Tab */}
          {activeTab === 'yoy' && data && (
            <div id="tab-content-yoy" className="space-y-8 animate-fadeIn">
              {/* YoY Comparison Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {(() => {
                  // Calculate YoY metrics dynamically
                  const currentYear = selectedYear;
                  const previousYear = currentYear - 1;
                  const currentQuarter = selectedPeriod === 'Year' ? null : selectedPeriod;
                  
                  // Website Sessions YoY
                  const currentWebsite = data.websiteData.filter(d => 
                    d.year === currentYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const prevWebsite = data.websiteData.filter(d => 
                    d.year === previousYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const currentSessions = currentWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0);
                  const prevSessions = prevWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0);
                  const sessionsChange = prevSessions > 0 ? ((currentSessions - prevSessions) / prevSessions * 100) : 0;
                  
                  // Social Media YoY
                  const currentSocial = data.socialData.filter(d => 
                    d.year === currentYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const prevSocial = data.socialData.filter(d => 
                    d.year === previousYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const currentImpressions = currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const prevImpressions = prevSocial.reduce((sum, d) => sum + (d.impressions || 0), 0);
                  const impressionsChange = prevImpressions > 0 ? ((currentImpressions - prevImpressions) / prevImpressions * 100) : 0;
                  
                  // Email Open Rate YoY
                  const currentEmail = data.emailData.filter(d => 
                    d.year === currentYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const prevEmail = data.emailData.filter(d => 
                    d.year === previousYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const currentEmailsSent = currentEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
                  const currentOpens = currentEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
                  const currentOpenRate = currentEmailsSent > 0 ? (currentOpens / currentEmailsSent * 100) : 0;
                  const prevEmailsSent = prevEmail.reduce((sum, d) => sum + (d.emailsSent || 0), 0);
                  const prevOpens = prevEmail.reduce((sum, d) => sum + (d.uniqueOpens || 0), 0);
                  const prevOpenRate = prevEmailsSent > 0 ? (prevOpens / prevEmailsSent * 100) : 0;
                  const openRateDiff = currentOpenRate - prevOpenRate;
                  
                  // Leads YoY
                  const currentLeads = data.leadsData.filter(d => 
                    d.year === currentYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const prevLeads = data.leadsData.filter(d => 
                    d.year === previousYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const currentNewLeads = currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                  const prevNewLeads = prevLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0);
                  const leadsChange = prevNewLeads > 0 ? ((currentNewLeads - prevNewLeads) / prevNewLeads * 100) : 0;
                  
                  // Share of Voice YoY (using only media mentions)
                  const currentSOV = data.shareOfVoiceData.filter(d => 
                    d.year === currentYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const prevSOV = data.shareOfVoiceData.filter(d => 
                    d.year === previousYear && (currentQuarter ? d.quarter === currentQuarter : true)
                  );
                  const currentOurMediaMentions = currentSOV.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                  const currentComp1 = currentSOV.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                  const currentComp2 = currentSOV.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                  const currentTotalCompetitiveMentions = currentOurMediaMentions + currentComp1 + currentComp2;
                  const currentSOVPercent = currentTotalCompetitiveMentions > 0 ? (currentOurMediaMentions / currentTotalCompetitiveMentions) * 100 : 0;
                  
                  const prevOurMediaMentions = prevSOV.reduce((sum, d) => sum + (d.mediaMentionVolume || 0), 0);
                  const prevComp1 = prevSOV.reduce((sum, d) => sum + (d.competitor1Mentions || 0), 0);
                  const prevComp2 = prevSOV.reduce((sum, d) => sum + (d.competitor2Mentions || 0), 0);
                  const prevTotalCompetitiveMentions = prevOurMediaMentions + prevComp1 + prevComp2;
                  const prevSOVPercent = prevTotalCompetitiveMentions > 0 ? (prevOurMediaMentions / prevTotalCompetitiveMentions) * 100 : 0;
                  const sovDiff = currentSOVPercent - prevSOVPercent;
                  
                  const metrics = [
                    { title: 'Website Performance YoY', current: currentSessions, previous: prevSessions, change: sessionsChange, diff: currentSessions - prevSessions, unit: 'sessions' },
                    { title: 'Social Media Reach YoY', current: currentImpressions, previous: prevImpressions, change: impressionsChange, diff: currentImpressions - prevImpressions, unit: 'impressions' },
                    { title: 'Email Engagement YoY', current: currentOpenRate, previous: prevOpenRate, change: openRateDiff > 0 ? (openRateDiff / prevOpenRate * 100) : 0, diff: openRateDiff, unit: '% open rate', isPercent: true },
                    { title: 'Lead Generation YoY', current: currentNewLeads, previous: prevNewLeads, change: leadsChange, diff: currentNewLeads - prevNewLeads, unit: 'leads' },
                    { title: 'Share of Voice YoY', current: currentSOVPercent, previous: prevSOVPercent, change: sovDiff > 0 ? (sovDiff / prevSOVPercent * 100) : 0, diff: sovDiff, unit: '% market share', isPercent: true }
                  ];
                
                  return metrics.map((metric, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl">
                    <h4 className="text-sm font-semibold text-gray-600 mb-4">{metric.title}</h4>
                    <div className="flex justify-between items-end mb-3">
                      <div className="text-3xl font-bold text-[#005C84]">
                        {metric.isPercent ? `${metric.current.toFixed(1)}%` : formatNumber(metric.current)}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{currentQuarter || 'Year'} {previousYear}</div>
                        <div className="text-lg font-semibold text-gray-600">
                          {metric.isPercent ? `${metric.previous.toFixed(1)}%` : formatNumber(metric.previous)}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t">
                      <span className={`flex items-center gap-1 text-sm font-medium ${metric.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% YoY
                      </span>
                      <span className="text-sm text-gray-600">
                        {metric.diff >= 0 ? '+' : ''}{metric.isPercent ? `${metric.diff.toFixed(1)}pp` : formatNumber(metric.diff)} {!metric.isPercent && metric.unit}
                      </span>
                    </div>
                  </div>
                  ));
                })()}
              </div>

              {/* YoY Trend Chart */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Year-over-Year Performance Trend</h3>
                  <div className="flex gap-2">
                    {(['quarterly', 'monthly', 'annual'] as ChartView[]).map(view => (
                      <button
                        key={view}
                        onClick={() => setYoyChartView(view)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          yoyChartView === view
                            ? 'bg-[#005C84] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={(() => {
                    if (!data) return [];

                    if (yoyChartView === 'monthly') {
                      // Monthly view: show all months for comparison years
                      const monthlyData: Array<{period: string, website: number, social: number, email: number, leads: number}> = [];
                      const currentYear = selectedYear;
                      const previousYear = currentYear - 1;

                      for (let month = 1; month <= 12; month++) {
                        const currentMonthData = data.websiteData.filter(d => d.year === currentYear && d.month === month);
                        const prevMonthData = data.websiteData.filter(d => d.year === previousYear && d.month === month);

                        const currentSocial = data.socialData.filter(d => d.year === currentYear && d.month === month);
                        const prevSocial = data.socialData.filter(d => d.year === previousYear && d.month === month);

                        const currentEmail = data.emailData.filter(d => d.year === currentYear && d.month === month);
                        const prevEmail = data.emailData.filter(d => d.year === previousYear && d.month === month);

                        const currentLeads = data.leadsData.filter(d => d.year === currentYear && d.month === month);
                        const prevLeads = data.leadsData.filter(d => d.year === previousYear && d.month === month);

                        const monthName = currentMonthData[0]?.monthName || new Date(2024, month - 1).toLocaleDateString('en-US', { month: 'short' });

                        monthlyData.push({
                          period: `${monthName} ${previousYear}`,
                          website: prevMonthData.reduce((sum, d) => sum + (d.sessions || 0), 0),
                          social: prevSocial.reduce((sum, d) => sum + (d.impressions || 0), 0),
                          email: prevEmail.length > 0 ? prevEmail.reduce((sum, d) => sum + (d.openRate || 0), 0) / prevEmail.length : 0,
                          leads: prevLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0)
                        });

                        monthlyData.push({
                          period: `${monthName} ${currentYear}`,
                          website: currentMonthData.reduce((sum, d) => sum + (d.sessions || 0), 0),
                          social: currentSocial.reduce((sum, d) => sum + (d.impressions || 0), 0),
                          email: currentEmail.length > 0 ? currentEmail.reduce((sum, d) => sum + (d.openRate || 0), 0) / currentEmail.length : 0,
                          leads: currentLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0)
                        });
                      }

                      return monthlyData.filter(d => d.website > 0 || d.social > 0 || d.email > 0 || d.leads > 0);
                    } else if (yoyChartView === 'annual') {
                      // Annual view: show yearly totals
                      const years = [...new Set(data.websiteData.map(d => d.year))].sort();
                      return years.map(year => {
                        const yearWebsite = data.websiteData.filter(d => d.year === year);
                        const yearSocial = data.socialData.filter(d => d.year === year);
                        const yearEmail = data.emailData.filter(d => d.year === year);
                        const yearLeads = data.leadsData.filter(d => d.year === year);

                        return {
                          period: year.toString(),
                          website: yearWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0),
                          social: yearSocial.reduce((sum, d) => sum + (d.impressions || 0), 0),
                          email: yearEmail.length > 0 ? yearEmail.reduce((sum, d) => sum + (d.openRate || 0), 0) / yearEmail.length : 0,
                          leads: yearLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0)
                        };
                      });
                    } else {
                      // Quarterly view (default): show quarters for comparison years
                      const quarterlyData: Array<{period: string, website: number, social: number, email: number, leads: number}> = [];
                      const currentYear = selectedYear;
                      const previousYear = currentYear - 1;

                      ['Q1', 'Q2', 'Q3', 'Q4'].forEach(quarter => {
                        // Previous year quarter
                        const prevQuarterWebsite = data.websiteData.filter(d => d.year === previousYear && d.quarter === quarter);
                        const prevQuarterSocial = data.socialData.filter(d => d.year === previousYear && d.quarter === quarter);
                        const prevQuarterEmail = data.emailData.filter(d => d.year === previousYear && d.quarter === quarter);
                        const prevQuarterLeads = data.leadsData.filter(d => d.year === previousYear && d.quarter === quarter);

                        if (prevQuarterWebsite.length > 0) {
                          quarterlyData.push({
                            period: `${quarter} ${previousYear}`,
                            website: prevQuarterWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0),
                            social: prevQuarterSocial.reduce((sum, d) => sum + (d.impressions || 0), 0),
                            email: prevQuarterEmail.length > 0 ? prevQuarterEmail.reduce((sum, d) => sum + (d.openRate || 0), 0) / prevQuarterEmail.length : 0,
                            leads: prevQuarterLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0)
                          });
                        }

                        // Current year quarter
                        const currentQuarterWebsite = data.websiteData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const currentQuarterSocial = data.socialData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const currentQuarterEmail = data.emailData.filter(d => d.year === currentYear && d.quarter === quarter);
                        const currentQuarterLeads = data.leadsData.filter(d => d.year === currentYear && d.quarter === quarter);

                        if (currentQuarterWebsite.length > 0) {
                          quarterlyData.push({
                            period: `${quarter} ${currentYear}`,
                            website: currentQuarterWebsite.reduce((sum, d) => sum + (d.sessions || 0), 0),
                            social: currentQuarterSocial.reduce((sum, d) => sum + (d.impressions || 0), 0),
                            email: currentQuarterEmail.length > 0 ? currentQuarterEmail.reduce((sum, d) => sum + (d.openRate || 0), 0) / currentQuarterEmail.length : 0,
                            leads: currentQuarterLeads.reduce((sum, d) => sum + (d.newMarketingProspects || 0), 0)
                          });
                        }
                      });

                      return quarterlyData;
                    }
                  })()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="website" stroke="#005C84" name="Website Sessions" strokeWidth={2} />
                    <Line yAxisId="left" type="monotone" dataKey="social" stroke="#55A51C" name="Social Impressions" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="email" stroke="#8b5cf6" name="Email Open Rate %" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="leads" stroke="#f59e0b" name="New Leads" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>

        {/* Footer Status Bar */}
        <div className="bg-gray-50 px-10 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                {data ? 'Data Loaded' : 'No Data'}
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-500">
                Last updated: {lastUpdate.toLocaleString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-gray-600 hover:text-[#005C84] transition-colors"
            >
              <Upload className="h-4 w-4" />
              Upload Excel
            </button>
            <button 
              onClick={handleRefresh}
              className="flex items-center gap-2 text-gray-600 hover:text-[#005C84] transition-colors"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button 
              onClick={() => {
                if (confirm('This will clear all cached data. Continue?')) {
                  dataService.clearCache();
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Settings className="h-4 w-4" />
              Clear Cache
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
