import React, { useState, useEffect } from 'react';
import { MetricCard } from './MetricCard';
import { WebsiteChart } from './charts/WebsiteChart';
import { TrafficSourcesChart } from './charts/TrafficSourcesChart';
import { SocialMediaChart } from './charts/SocialMediaChart';
import { EmailChart } from './charts/EmailChart';
import { InsightsPanel } from './InsightsPanel';
import { PeriodSelector } from './PeriodSelector';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useDashboardStore } from '../store/dashboardStore';
import { DataProcessor } from '../utils/dataProcessor';
import { generateInsights } from '../services/insightService';
import { dataService } from '../services/dataService';
import { 
  Users, 
  Eye, 
  MousePointer,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';

export const AutoDashboard: React.FC = () => {
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
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load initial data and set up WebSocket connection
  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Check server status first
        const status = await dataService.checkStatus();
        
        if (!status.fileExists) {
          setError(`Excel file not found at: ${status.filePath}`);
          setConnectionStatus('error');
          return;
        }

        // Fetch initial data
        const dashboardData = await dataService.fetchData();
        
        if (dashboardData && mounted) {
          setData(dashboardData);
          setLastUpdate(new Date());
          
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
          
          setConnectionStatus('connected');
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setConnectionStatus('error');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up WebSocket connection for real-time updates
    if (autoRefresh) {
      dataService.connect(
        async (newData) => {
          if (mounted) {
            setData(newData);
            setLastUpdate(new Date());
            
            // Regenerate insights with new data
            const generatedInsights = await generateInsights(newData, selectedPeriod);
            setInsights(generatedInsights);
            
            console.log('📊 Dashboard updated with new data');
          }
        },
        (status) => {
          if (mounted) {
            switch (status) {
              case 'connected':
                setConnectionStatus('connected');
                break;
              case 'disconnected':
                setConnectionStatus('disconnected');
                break;
              case 'error':
                setConnectionStatus('error');
                break;
              case 'updated':
                // Flash update indicator
                const elem = document.getElementById('update-indicator');
                if (elem) {
                  elem.classList.add('animate-pulse');
                  setTimeout(() => elem.classList.remove('animate-pulse'), 1000);
                }
                break;
            }
          }
        }
      );
    }

    loadInitialData();

    return () => {
      mounted = false;
      if (autoRefresh) {
        dataService.disconnect();
      }
    };
  }, [autoRefresh]);

  // Regenerate insights when period changes
  useEffect(() => {
    if (data) {
      generateInsights(data, selectedPeriod).then(setInsights);
    }
  }, [selectedPeriod, data]);

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

  if (loading && !data) {
    return <LoadingSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-6 w-6" />
                <span>Unable to Load Dashboard Data</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-gray-700 mb-4">{error}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Please ensure:</p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>The Excel file exists at the specified location</li>
                  <li>The server is running (npm run server)</li>
                  <li>The file has the correct format and permissions</li>
                </ul>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="inline-block h-4 w-4 mr-2" />
                Retry
              </button>
            </CardContent>
          </Card>
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
                {data?.config?.lastUpdated ? `Data from: ${data.config.lastUpdated}` : 'Real-time data monitoring'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-2">
                {connectionStatus === 'connected' ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-300" />
                    <span className="text-sm">Live</span>
                  </>
                ) : connectionStatus === 'disconnected' ? (
                  <>
                    <WifiOff className="h-4 w-4 text-red-300" />
                    <span className="text-sm">Disconnected</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Connecting...</span>
                  </>
                )}
              </div>
              
              {/* Auto-refresh toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors",
                  autoRefresh ? "bg-white/20" : "bg-white/10"
                )}
              >
                <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
                <span className="text-sm">Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
              </button>
              
              <PeriodSelector />
            </div>
          </div>
          
          {/* Last Update Indicator */}
          {lastUpdate && (
            <div id="update-indicator" className="text-xs text-white/60">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
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
        {!data ? (
          <div className="text-center py-12">
            <RefreshCw className="h-12 w-12 mx-auto text-gray-400 animate-spin mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};