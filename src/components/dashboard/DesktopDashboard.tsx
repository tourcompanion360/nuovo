import React from 'react';
import { Monitor, Eye, Users, Clock, Activity } from 'lucide-react';
import MetricCard from '../MetricCard';
import { DashboardMetrics } from '@/hooks/useDashboardData';

interface DesktopDashboardProps {
  metrics: DashboardMetrics;
}

const DesktopDashboard = ({ metrics }: DesktopDashboardProps) => {
  return (
    <>
      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Volume Visualizzazioni" 
            value={metrics.totalViews.toLocaleString()} 
            color="blue" 
            trend="up" 
            trendValue="CSV"
            className="animate-enter-from-left" 
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Volume Visitatori Unici" 
            value={metrics.uniqueVisitors.toLocaleString()} 
            color="cyan" 
            trend="up" 
            trendValue="CSV"
            className="animate-enter-from-bottom" 
            style={{ animationDelay: '0.1s' }} 
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Tempo Totale Engagement" 
            value={metrics.totalTime} 
            color="violet" 
            trend="up" 
            trendValue="CSV"
            className="animate-enter-from-right" 
            style={{ animationDelay: '0.2s' }} 
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Tempo Medio per Sessione" 
            value={metrics.avgSessionTime} 
            color="emerald" 
            trend="up" 
            trendValue="CSV"
            className="animate-enter-from-left" 
            style={{ animationDelay: '0.3s' }} 
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Tasso di Conversione" 
            value={`${metrics.conversionRate}%`} 
            color="amber" 
            trend="up" 
            trendValue="CSV"
            className="animate-enter-from-bottom" 
            style={{ animationDelay: '0.4s' }} 
          />
        </div>
        <div className="sm:col-span-2 xl:col-span-2">
          <MetricCard 
            title="Performance Score" 
            value={metrics.performanceScore} 
            color="rose" 
            trend="up" 
            trendValue={`${metrics.performanceScore}pts`}
            className="animate-enter-from-right" 
            style={{ animationDelay: '0.5s' }} 
          />
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="hidden md:block data-table p-4 sm:p-6 lg:p-8 animate-fade-in-up" 
           style={{ animationDelay: '0.8s' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold gradient-text-enhanced mb-2">Analytics da CSV</h3>
            <p className="text-foreground-secondary text-sm sm:text-base">Dati elaborati automaticamente</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 sm:px-4 py-2 bg-glass-background border border-glass-border rounded-lg backdrop-blur-sm">
              <span className="text-xs text-foreground-muted">Dati elaborati: {new Date().toLocaleDateString('it-IT')}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-hidden rounded-xl border border-glass-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-glass-border bg-glass-background/50">
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    <div className="flex items-center gap-2">
                      <Monitor size={16} />
                      Tour VR
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    <div className="flex items-center gap-2">
                      <Eye size={16} />
                      Visualizzazioni
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      Visitatori
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      Tempo Medio
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    <div className="flex items-center gap-2">
                      <Activity size={16} />
                      Conversione
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-foreground-secondary font-semibold text-sm tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-glass-border hover:bg-glass-background/30 transition-all duration-300 group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        <Monitor size={16} className="text-primary-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-foreground-accent transition-colors">
                          Dati Elaborati CSV
                        </p>
                        <p className="text-xs text-foreground-muted">Importazione Automatica</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-metric-blue rounded-full animate-pulse-glow" />
                      <span className="font-semibold text-foreground">{metrics.totalViews.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-metric-cyan rounded-full animate-pulse-glow" />
                      <span className="font-semibold text-foreground">{metrics.uniqueVisitors.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-foreground">{metrics.avgSessionTime}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-glass-background rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-metric-emerald to-metric-amber rounded-full animate-pulse-glow"
                          style={{ width: `${Math.min(100, metrics.conversionRate * 10)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-metric-emerald">{metrics.conversionRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-success/20 text-success text-sm font-medium">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                      Elaborato
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default DesktopDashboard;