import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Clock, Activity, TrendingUp } from 'lucide-react';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';
import { formatDuration } from '@/utils/analyticsTerminology';

const SimpleAnalytics: React.FC = () => {
  // Use unified analytics hook for consistent data
  const unifiedAnalytics = useUnifiedAnalytics({ 
    projectId: '355e0500-0e75-416d-86c7-d3df81826678' // Hardcoded for Showroom-Intermobil
  });

  console.log('🚀 [SimpleAnalytics] Using unified analytics:', {
    loading: unifiedAnalytics.loading,
    error: unifiedAnalytics.error,
    totalViews: unifiedAnalytics.totalViews,
    totalVisitors: unifiedAnalytics.totalVisitors,
    avgEngagementTime: unifiedAnalytics.avgEngagementTime
  });

  if (unifiedAnalytics.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (unifiedAnalytics.error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center text-red-500">
          <p>Error: {unifiedAnalytics.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mb-4">
          <Activity className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          Analytics Dashboard
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Real-time performance metrics and insights for your virtual tour
        </p>
      </div>
      
      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-700">Total Views</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Eye className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-1">{unifiedAnalytics.totalViews}</div>
            <p className="text-xs text-blue-500 font-medium">
              Page impressions
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Active tracking
            </div>
          </CardContent>
        </Card>

        {/* Visitors Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-green-700">Unique Visitors</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-1">{unifiedAnalytics.totalVisitors}</div>
            <p className="text-xs text-green-500 font-medium">
              Individual users
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <Users className="h-3 w-3 mr-1" />
              Growing audience
            </div>
          </CardContent>
        </Card>

        {/* Average Time Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-purple-700">Avg. Session</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600 mb-1">{formatDuration(unifiedAnalytics.avgEngagementTime)}</div>
            <p className="text-xs text-purple-500 font-medium">
              Time per visit
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <Clock className="h-3 w-3 mr-1" />
              Good engagement
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500 rounded-full -translate-y-10 translate-x-10 opacity-10"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-700">System Status</CardTitle>
            <div className="p-2 bg-emerald-500 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 mb-1">✓</div>
            <p className="text-xs text-emerald-500 font-medium">
              All systems operational
            </p>
            <div className="mt-2 flex items-center text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
              Live data
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{unifiedAnalytics.conversionRate}%</div>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{unifiedAnalytics.avgSatisfaction}/5</div>
              <p className="text-sm text-gray-600">Avg. Satisfaction</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">Active</div>
              <p className="text-sm text-gray-600">Tracking Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleAnalytics;
