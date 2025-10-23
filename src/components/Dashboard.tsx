import React, { Suspense, lazy } from 'react';
import DashboardHeader from './dashboard/DashboardHeader';
import CSVUpload from './dashboard/CSVUpload';
import useDashboardData from '@/hooks/useDashboardData';
import { OptimizedLoading, ChartSkeleton, DashboardSkeleton } from './LoadingStates';

// Lazy load heavy components
const StatsChart = lazy(() => import('./StatsChart'));
const AnalyticsKPI = lazy(() => import('./AnalyticsKPI'));
const ConversationalIntelligence = lazy(() => import('./ConversationalIntelligence'));

const Dashboard = () => {
  const { metrics, chartData, handleCSVUpload, hasData, csvData } = useDashboardData();

  return (
    <div className="space-y-8">
      {/* CSV Upload Controls */}
      <div className="flex justify-start items-center">
        <CSVUpload onUpload={handleCSVUpload} dataCount={csvData.length} />
      </div>

      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Analytics KPI Cards - Lazy loaded */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>}>
        <AnalyticsKPI />
      </Suspense>

      {/* Charts Section - Lazy loaded */}
      <Suspense fallback={<ChartSkeleton />}>
        <StatsChart data={hasData ? chartData : undefined} />
      </Suspense>

      {/* Conversational Intelligence - Lazy loaded */}
      <Suspense fallback={<div className="animate-pulse">
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>}>
        <ConversationalIntelligence />
      </Suspense>
    </div>
  );
};
export default Dashboard;