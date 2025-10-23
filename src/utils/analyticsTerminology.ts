/**
 * Analytics Terminology Utilities
 * Provides consistent, user-friendly terminology and formatting for analytics data
 */

// Simplified terminology mapping
export const ANALYTICS_TERMS = {
  // Database columns to display labels
  page_views: 'Views',
  visitors: 'Visitors', 
  total_time: 'Total Time Spent',
  avg_time: 'Avg. Session Duration',
  resource_code: 'Tour ID',
  
  // Metric type mappings
  view: 'Views',
  unique_visitor: 'Visitors',
  time_spent: 'Time Spent',
  chatbot_interaction: 'Chat Interactions',
  hotspot_click: 'Hotspot Clicks',
  lead_generated: 'Leads Generated',
  
  // Status labels
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  completed: 'Completed',
  in_progress: 'In Progress',
  cancelled: 'Cancelled',
  
  // Priority labels
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
} as const;

/**
 * Format time duration from seconds to human-readable format
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "2m 30s", "1h 15m", "45s")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0s';
  
  // Round to nearest second for cleaner display
  const roundedSeconds = Math.round(seconds);
  
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;
  
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (remainingSeconds > 0 && hours === 0) {
    parts.push(`${remainingSeconds}s`);
  }
  
  return parts.join(' ') || '0s';
}

/**
 * Format large numbers with K/M suffixes
 * @param num - Number to format
 * @returns Formatted number string (e.g., "1.2K", "3.4M")
 */
export function formatNumber(num: number): string {
  if (num === 0) return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return num.toString();
}

/**
 * Format percentage with proper decimal places
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get display label for a database column or metric type
 * @param key - Database column name or metric type
 * @returns User-friendly display label
 */
export function getDisplayLabel(key: string): string {
  return ANALYTICS_TERMS[key as keyof typeof ANALYTICS_TERMS] || key;
}

/**
 * Format date for display
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date range for display
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} - ${end}`;
}

/**
 * Calculate percentage change between two values
 * @param oldValue - Previous value
 * @param newValue - Current value
 * @returns Percentage change with sign
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get trend indicator (up/down/neutral) based on percentage change
 * @param change - Percentage change value
 * @returns Trend indicator
 */
export function getTrendIndicator(change: number): 'up' | 'down' | 'neutral' {
  if (change > 0) return 'up';
  if (change < 0) return 'down';
  return 'neutral';
}

/**
 * Format trend text with color indication
 * @param change - Percentage change value
 * @returns Formatted trend text with sign
 */
export function formatTrend(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${formatPercentage(change)}`;
}

/**
 * Get color class for trend indicators
 * @param change - Percentage change value
 * @returns Tailwind CSS color class
 */
export function getTrendColor(change: number): string {
  if (change > 0) return 'text-green-600';
  if (change < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Validate and format CSV data for import
 * @param data - Raw CSV data
 * @returns Formatted data with proper types
 */
export function formatCSVData(data: any[]): any[] {
  return data.map(row => ({
    ...row,
    page_views: parseInt(row.pv || row.page_views || '0') || 0,
    visitors: parseInt(row.uv || row.visitors || '0') || 0,
    total_time: parseInt(row.duration || row.total_time || '0') || 0,
    avg_time: parseInt(row.avg_duration || row.avg_time || '0') || 0,
    date: row.date,
    resource_code: row.resource_code || ''
  }));
}

/**
 * Get summary statistics for analytics data
 * @param data - Analytics data array
 * @returns Summary statistics object
 */
export function getAnalyticsSummary(data: any[]): {
  totalViews: number;
  totalVisitors: number;
  totalTimeSpent: number;
  avgSessionDuration: number;
  dateRange: { earliest: string; latest: string };
  resourceCodes: string[];
} {
  if (!data || data.length === 0) {
    return {
      totalViews: 0,
      totalVisitors: 0,
      totalTimeSpent: 0,
      avgSessionDuration: 0,
      dateRange: { earliest: '', latest: '' },
      resourceCodes: []
    };
  }

  const totalViews = data.reduce((sum, item) => sum + (item.page_views || 0), 0);
  const totalVisitors = data.reduce((sum, item) => sum + (item.visitors || 0), 0);
  const totalTimeSpent = data.reduce((sum, item) => sum + (item.total_time || 0), 0);
  const avgSessionDuration = data.reduce((sum, item) => sum + (item.avg_time || 0), 0) / data.length;
  
  const dates = data.map(item => item.date).filter(Boolean).sort();
  const resourceCodes = [...new Set(data.map(item => item.resource_code).filter(Boolean))];

  return {
    totalViews,
    totalVisitors,
    totalTimeSpent,
    avgSessionDuration,
    dateRange: {
      earliest: dates[0] || '',
      latest: dates[dates.length - 1] || ''
    },
    resourceCodes
  };
}
