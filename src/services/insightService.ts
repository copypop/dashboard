import type { DashboardData, Insight, Period } from '../types/dashboard';
import { DataProcessor } from '../utils/dataProcessor';

export async function generateInsights(
  data: DashboardData,
  period: Period
): Promise<Insight[]> {
  const insights: Insight[] = [];
  
  // Analyze website performance
  const websiteInsights = analyzeWebsitePerformance(data, period);
  insights.push(...websiteInsights);
  
  // Analyze traffic sources
  const trafficInsights = analyzeTrafficSources(data, period);
  insights.push(...trafficInsights);
  
  // Analyze targets
  const targetInsights = analyzeTargets(data, period);
  insights.push(...targetInsights);
  
  // Sort by priority
  return insights.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function analyzeWebsitePerformance(data: DashboardData, period: Period): Insight[] {
  const insights: Insight[] = [];
  
  const currentQuarterData = data.websiteData.filter(
    d => d.quarter === period.quarter! && d.year === period.year
  );
  
  if (currentQuarterData.length === 0) return insights;
  
  // Calculate metrics
  const totalSessions = currentQuarterData.reduce((sum, d) => sum + (d.sessions || 0), 0);
  const avgBounceRate = currentQuarterData.reduce((sum, d) => sum + (d.bounceRate || 0), 0) / currentQuarterData.length;
  
  // Get previous quarter for comparison
  const prevQuarter = period.quarter === 'Q1' ? 'Q4' : `Q${parseInt(period.quarter![1]) - 1}`;
  const prevYear = period.quarter === 'Q1' ? period.year - 1 : period.year;
  
  const prevQuarterData = data.websiteData.filter(
    d => d.quarter === prevQuarter && d.year === prevYear
  );
  
  if (prevQuarterData.length > 0) {
    const prevTotalSessions = prevQuarterData.reduce((sum, d) => sum + (d.sessions || 0), 0);
    const sessionChange = DataProcessor.calculatePercentageChange(totalSessions, prevTotalSessions);
    
    if (Math.abs(sessionChange) > 10) {
      insights.push({
        id: 'website-session-change',
        type: sessionChange > 0 ? 'performance' : 'risk',
        title: sessionChange > 0 ? 'Strong Traffic Growth' : 'Traffic Decline Alert',
        description: `Website sessions ${sessionChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(sessionChange).toFixed(1)}% compared to last quarter.`,
        metric: 'Sessions',
        value: totalSessions,
        change: sessionChange,
        confidence: 'high',
        priority: Math.abs(sessionChange) > 20 ? 'high' : 'medium',
        actions: sessionChange > 0 
          ? ['Continue current marketing strategies', 'Analyze successful content for patterns']
          : ['Review content strategy', 'Increase marketing efforts', 'Check for technical issues']
      });
    }
  }
  
  // Bounce rate analysis
  if (avgBounceRate > 50) {
    insights.push({
      id: 'high-bounce-rate',
      type: 'risk',
      title: 'High Bounce Rate Detected',
      description: `Average bounce rate of ${avgBounceRate.toFixed(1)}% is above industry standard (40-50%).`,
      metric: 'Bounce Rate',
      value: avgBounceRate,
      confidence: 'high',
      priority: 'medium',
      actions: [
        'Improve page load speed',
        'Enhance content relevance',
        'Optimize mobile experience',
        'Review landing page design'
      ]
    });
  }
  
  // Check for data quality
  const monthsWithMissingData = currentQuarterData.filter(d => d.sessions === null).length;
  if (monthsWithMissingData > 0) {
    insights.push({
      id: 'missing-data',
      type: 'risk',
      title: 'Incomplete Data Warning',
      description: `${monthsWithMissingData} month(s) have missing website data for this quarter.`,
      confidence: 'high',
      priority: 'low',
      actions: ['Update Excel file with complete data', 'Check data collection processes']
    });
  }
  
  return insights;
}

function analyzeTrafficSources(data: DashboardData, period: Period): Insight[] {
  const insights: Insight[] = [];
  
  const currentQuarterData = data.trafficSources.filter(
    d => d.quarter === period.quarter! && d.year === period.year
  );
  
  if (currentQuarterData.length === 0) return insights;
  
  // Calculate total traffic by source
  const totals = {
    direct: currentQuarterData.reduce((sum, d) => sum + d.directTraffic, 0),
    search: currentQuarterData.reduce((sum, d) => sum + d.searchEngines, 0),
    social: currentQuarterData.reduce((sum, d) => sum + d.socialMedia, 0),
    internal: currentQuarterData.reduce((sum, d) => sum + d.internalReferrers, 0),
    external: currentQuarterData.reduce((sum, d) => sum + d.externalReferrers, 0)
  };
  
  const totalTraffic = Object.values(totals).reduce((sum, val) => sum + val, 0);
  
  // Analyze traffic distribution
  const directPercentage = (totals.direct / totalTraffic) * 100;
  const searchPercentage = (totals.search / totalTraffic) * 100;
  const socialPercentage = (totals.social / totalTraffic) * 100;
  
  if (directPercentage > 60) {
    insights.push({
      id: 'high-direct-traffic',
      type: 'opportunity',
      title: 'High Direct Traffic Indicates Strong Brand Recognition',
      description: `${directPercentage.toFixed(1)}% of traffic comes directly to your site, showing strong brand awareness.`,
      metric: 'Direct Traffic',
      value: directPercentage,
      confidence: 'high',
      priority: 'low',
      actions: ['Leverage brand strength in marketing', 'Consider brand expansion opportunities']
    });
  }
  
  if (searchPercentage < 15) {
    insights.push({
      id: 'low-search-traffic',
      type: 'opportunity',
      title: 'SEO Improvement Opportunity',
      description: `Only ${searchPercentage.toFixed(1)}% of traffic comes from search engines. Industry average is 20-30%.`,
      metric: 'Search Traffic',
      value: searchPercentage,
      confidence: 'medium',
      priority: 'medium',
      actions: [
        'Invest in SEO optimization',
        'Create more search-friendly content',
        'Improve meta descriptions and titles',
        'Build quality backlinks'
      ]
    });
  }
  
  if (socialPercentage < 5 && socialPercentage > 0) {
    insights.push({
      id: 'underutilized-social',
      type: 'opportunity',
      title: 'Social Media Traffic Can Be Improved',
      description: `Social media drives only ${socialPercentage.toFixed(1)}% of traffic. There's room for growth.`,
      metric: 'Social Traffic',
      value: socialPercentage,
      confidence: 'medium',
      priority: 'low',
      actions: [
        'Increase social media posting frequency',
        'Engage more with followers',
        'Use paid social advertising',
        'Create shareable content'
      ]
    });
  }
  
  return insights;
}

function analyzeTargets(data: DashboardData, period: Period): Insight[] {
  const insights: Insight[] = [];
  
  const currentQuarterData = data.websiteData.filter(
    d => d.quarter === period.quarter! && d.year === period.year
  );
  
  if (currentQuarterData.length === 0 || data.targets.length === 0) return insights;
  
  // Check performance against targets
  const websiteTargets = data.targets.filter(t => t.metricCategory === 'Website');
  const quarterKey = `${period.quarter!.toLowerCase()}Target` as 'q1Target' | 'q2Target' | 'q3Target' | 'q4Target';
  
  websiteTargets.forEach(target => {
    const targetValue = target[quarterKey];
    let actualValue = 0;
    
    switch (target.metricName) {
      case 'Sessions':
        actualValue = currentQuarterData.reduce((sum, d) => sum + (d.sessions || 0), 0);
        break;
      case 'Pageviews':
        actualValue = currentQuarterData.reduce((sum, d) => sum + (d.pageviews || 0), 0);
        break;
      case 'Unique_Visitors':
        actualValue = currentQuarterData.reduce((sum, d) => sum + (d.uniqueVisitors || 0), 0);
        break;
    }
    
    if (actualValue > 0 && targetValue > 0) {
      const performance = (actualValue / targetValue) * 100;
      
      if (performance < 80) {
        insights.push({
          id: `target-${target.metricName}-underperform`,
          type: 'risk',
          title: `${target.metricName} Below Target`,
          description: `${target.metricName} is at ${performance.toFixed(1)}% of quarterly target (${actualValue.toLocaleString()} / ${targetValue.toLocaleString()}).`,
          metric: target.metricName,
          value: actualValue,
          confidence: 'high',
          priority: performance < 60 ? 'high' : 'medium',
          actions: [
            'Review and adjust marketing strategies',
            'Increase promotional activities',
            'Analyze competitor activities'
          ]
        });
      } else if (performance > 120) {
        insights.push({
          id: `target-${target.metricName}-exceed`,
          type: 'performance',
          title: `${target.metricName} Exceeding Target`,
          description: `${target.metricName} is at ${performance.toFixed(1)}% of quarterly target. Great performance!`,
          metric: target.metricName,
          value: actualValue,
          confidence: 'high',
          priority: 'low',
          actions: ['Document successful strategies', 'Consider raising targets for next quarter']
        });
      }
    }
  });
  
  return insights;
}