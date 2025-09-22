import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { WebsiteChart } from './charts/WebsiteChart';
import { TrafficSourcesChart } from './charts/TrafficSourcesChart';
import { SocialMediaChart } from './charts/SocialMediaChart';
import { EmailChart } from './charts/EmailChart';
import { PeriodSelector } from './PeriodSelector';
import { useDashboardStore } from '../store/dashboardStore';
import { DataProcessor } from '../utils/dataProcessor';
import { dataService } from '../services/dataService';
import { cn } from '@/lib/utils';
import { 
  Users, 
  Eye, 
  MousePointer
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    data,
    loading,
    error,
    selectedPeriod,
    setData,
    setLoading,
    setError,
    setSelectedPeriod
  } = useDashboardStore();

  const [activeTab, setActiveTab] = useState('overview');

  const loadDataFromServer = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use dataService for consistent data loading
      const dashboardData = await dataService.loadFromServer();

      if (dashboardData) {
        setData(dashboardData);

        // Update selected period to match data
        if (dashboardData.config) {
          setSelectedPeriod({
            year: dashboardData.config.currentYear,
            quarter: dashboardData.config.currentQuarter
          });
        }
      } else {
        setError('Failed to load data from server. Please ensure the Excel file exists.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadDataFromServer();
  }, []);

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
            <p className="text-gray-600 mt-2">
              {loading ? 'Loading data from server...' : 'Ready to display your dashboard data'}
            </p>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-caat-blue"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-red-800 font-semibold mb-2">Error Loading Data</h3>
              <p className="text-red-600">{error}</p>
              <button
                onClick={loadDataFromServer}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
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
            {['overview', 'website', 'traffic', 'social', 'email', 'leads'].map(tab => (
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

      </div>
    </div>
  );
};