import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { MetricCard } from './MetricCard';
import { WebsiteChart } from './charts/WebsiteChart';
import { TrafficSourcesChart } from './charts/TrafficSourcesChart';
import { SocialMediaChart } from './charts/SocialMediaChart';
import { EmailChart } from './charts/EmailChart';
import { InsightsPanel } from './InsightsPanel';
import { PeriodSelector } from './PeriodSelector';
import { useDashboardStore } from '../store/dashboardStore';
import { DataProcessor } from '../utils/dataProcessor';
import { generateInsights } from '../services/insightService';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Eye, 
  MousePointer
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    data,
    insights,
    loading,
    error,
    selectedPeriod,
    setData,
    setInsights,
    setLoading,
    setError,
    setSelectedPeriod
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState('overview');

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboardData = await DataProcessor.parseExcelFile(file);
      setData(dashboardData);
      
      // Generate insights
      const generatedInsights = await generateInsights(dashboardData, selectedPeriod);
      setInsights(generatedInsights);
      
      // Update selected period to match data
      if (dashboardData.config) {
        setSelectedPeriod({
          year: dashboardData.config.currentYear,
          quarter: dashboardData.config.currentQuarter
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Excel file');
    } finally {
      setLoading(false);
    }
  };

  const getQuarterlyMetrics = () => {
    if (!data) return null;
    
    const quarterData = data.websiteData.filter(
      d => d.quarter === selectedPeriod.quarter! && d.year === selectedPeriod.year
    );
    
    const totalSessions = quarterData.reduce((sum, d) => sum + (d.sessions || 0), 0);
    const totalPageviews = quarterData.reduce((sum, d) => sum + (d.pageviews || 0), 0);
    const totalUniqueVisitors = quarterData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
    const avgBounceRate = quarterData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / quarterData.length;
    
    // Get previous quarter data for comparison
    const prevQuarter = selectedPeriod.quarter === 'Q1' ? 'Q4' : `Q${parseInt(selectedPeriod.quarter![1]) - 1}`;
    const prevYear = selectedPeriod.quarter === 'Q1' ? selectedPeriod.year - 1 : selectedPeriod.year;
    
    const prevQuarterData = data.websiteData.filter(
      d => d.quarter === prevQuarter && d.year === prevYear
    );
    
    const prevTotalSessions = prevQuarterData.reduce((sum, d) => sum + (d.sessions || 0), 0);
    
    const sessionChange = DataProcessor.calculatePercentageChange(totalSessions, prevTotalSessions);
    
    // Get targets
    const targets = data.targets.filter(t => t.metricCategory === 'Website');
    const sessionTarget = targets.find(t => t.metricName === 'Sessions');
    const quarterKey = `${selectedPeriod.quarter!.toLowerCase()}Target` as keyof typeof sessionTarget;
    
    return {
      sessions: {
        value: totalSessions,
        change: sessionChange,
        target: sessionTarget ? sessionTarget[quarterKey] as number : undefined
      },
      pageviews: {
        value: totalPageviews,
        change: 0
      },
      uniqueVisitors: {
        value: totalUniqueVisitors,
        change: 0
      },
      bounceRate: {
        value: avgBounceRate,
        change: 0
      }
    };
  };

  const metrics = getQuarterlyMetrics();

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-caat-blue to-caat-green bg-clip-text text-transparent">
              CAAT Digital Marketing Dashboard
            </h1>
            <p className="text-gray-600 mt-2">Upload your Excel data to get started</p>
          </div>
          
          <FileUpload 
            onFileUpload={handleFileUpload}
            isLoading={loading}
            error={error}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-caat-blue to-caat-green text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold">CAAT Digital Marketing Dashboard</h1>
              <p className="text-white/80 mt-1">
                Last updated: {data.config.lastUpdated}
              </p>
            </div>
            <PeriodSelector />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex space-x-1 overflow-x-auto">
            {['overview', 'website', 'traffic', 'social', 'email', 'leads', 'insights'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-3 text-sm font-medium capitalize transition-colors",
                  activeTab === tab
                    ? "text-caat-blue border-b-2 border-caat-blue bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Total Sessions"
                value={metrics.sessions.value}
                change={metrics.sessions.change}
                changeLabel="vs last quarter"
                icon={<Users className="h-4 w-4" />}
                target={metrics.sessions.target}
              />
              <MetricCard
                title="Page Views"
                value={metrics.pageviews.value}
                change={metrics.pageviews.change}
                changeLabel="vs last quarter"
                icon={<Eye className="h-4 w-4" />}
              />
              <MetricCard
                title="Unique Visitors"
                value={metrics.uniqueVisitors.value}
                change={metrics.uniqueVisitors.change}
                changeLabel="vs last quarter"
                icon={<Users className="h-4 w-4" />}
              />
              <MetricCard
                title="Bounce Rate"
                value={metrics.bounceRate.value}
                format="percentage"
                change={metrics.bounceRate.change}
                changeLabel="vs last quarter"
                icon={<MousePointer className="h-4 w-4" />}
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WebsiteChart data={data.websiteData} period={selectedPeriod} />
              <TrafficSourcesChart data={data.trafficSources} period={selectedPeriod} />
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <InsightsPanel insights={insights.slice(0, 3)} />
            )}
          </div>
        )}

        {activeTab === 'website' && (
          <div className="space-y-6">
            <WebsiteChart data={data.websiteData} period={selectedPeriod} detailed />
          </div>
        )}

        {activeTab === 'traffic' && (
          <div className="space-y-6">
            <TrafficSourcesChart data={data.trafficSources} period={selectedPeriod} detailed />
          </div>
        )}

        {activeTab === 'social' && (
          <div className="space-y-6">
            <SocialMediaChart data={data.socialData} period={selectedPeriod} />
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <EmailChart data={data.emailData} period={selectedPeriod} />
          </div>
        )}

        {activeTab === 'insights' && (
          <InsightsPanel insights={insights} showAll />
        )}
      </div>
    </div>
  );
};