import React from 'react';
import { Clock, Activity, Eye, Users, Monitor } from 'lucide-react';
import { DashboardMetrics } from '@/hooks/useDashboardData';

interface MobileDashboardProps {
  metrics: DashboardMetrics;
}

const MobileDashboard = ({ metrics }: MobileDashboardProps) => {
  return (
    <div className="block md:hidden">
      <div className="space-y-3 mb-6">
        {/* Primary metrics */}
        <div className="bg-glass-background/50 backdrop-blur-sm border border-glass-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide">Metriche Principali</h3>
            <div className="w-8 h-1 bg-primary rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-metric-blue/10 to-metric-blue/5 border border-metric-blue/20 rounded-xl p-3">
              <div className="text-xs text-metric-blue font-semibold mb-1">VISUALIZZAZIONI</div>
              <div className="text-2xl font-bold text-foreground">{metrics.totalViews.toLocaleString()}</div>
              <div className="text-xs text-success flex items-center gap-1">
                <div className="w-1 h-1 bg-success rounded-full" />
                Aggiornato
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-metric-cyan/10 to-metric-cyan/5 border border-metric-cyan/20 rounded-xl p-3">
              <div className="text-xs text-metric-cyan font-semibold mb-1">VISITATORI</div>
              <div className="text-2xl font-bold text-foreground">{metrics.uniqueVisitors.toLocaleString()}</div>
              <div className="text-xs text-success flex items-center gap-1">
                <div className="w-1 h-1 bg-success rounded-full" />
                Aggiornato
              </div>
            </div>
          </div>
          
          {/* Performance bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground-secondary">Performance Score</span>
              <span className="text-sm font-bold text-foreground">{metrics.performanceScore}/100</span>
            </div>
            <div className="w-full h-2 bg-glass-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-metric-violet to-metric-rose rounded-full transition-all duration-500"
                style={{ width: `${metrics.performanceScore}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Engagement metrics */}
        <div className="bg-glass-background/50 backdrop-blur-sm border border-glass-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground-secondary uppercase tracking-wide">Engagement</h3>
            <div className="w-8 h-1 bg-metric-emerald rounded-full" />
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-metric-emerald/5 to-transparent border border-metric-emerald/10 rounded-xl">
              <div>
                <div className="text-xs text-metric-emerald font-semibold">TEMPO MEDIO SESSIONE</div>
                <div className="text-lg font-bold text-foreground">{metrics.avgSessionTime}</div>
              </div>
              <div className="w-12 h-12 bg-metric-emerald/20 rounded-full flex items-center justify-center">
                <Clock size={20} className="text-metric-emerald" />
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-metric-amber/5 to-transparent border border-metric-amber/10 rounded-xl">
              <div>
                <div className="text-xs text-metric-amber font-semibold">TASSO CONVERSIONE</div>
                <div className="text-lg font-bold text-foreground">{metrics.conversionRate}%</div>
              </div>
              <div className="w-12 h-12 bg-metric-amber/20 rounded-full flex items-center justify-center">
                <Activity size={20} className="text-metric-amber" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Data Cards */}
      <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold gradient-text-enhanced mb-1">Dettagli Tour</h3>
            <p className="text-foreground-secondary text-sm">Performance elaborata da CSV</p>
          </div>
        </div>
        
        <div className="bg-glass-background/50 backdrop-blur-sm border border-glass-border rounded-2xl p-4 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-glass-border">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Monitor size={18} className="text-primary-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Tour Elaborati da CSV</p>
              <p className="text-xs text-foreground-muted">Dati in tempo reale</p>
            </div>
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-success/20 text-success text-xs font-medium">
              <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
              Attivo
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-metric-blue/10 to-transparent border border-metric-blue/20 rounded-xl">
              <Eye size={16} className="text-metric-blue mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{metrics.totalViews.toLocaleString()}</div>
              <div className="text-xs text-foreground-secondary">Visualizzazioni</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-metric-cyan/10 to-transparent border border-metric-cyan/20 rounded-xl">
              <Users size={16} className="text-metric-cyan mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{metrics.uniqueVisitors.toLocaleString()}</div>
              <div className="text-xs text-foreground-secondary">Visitatori</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-metric-emerald/10 to-transparent border border-metric-emerald/20 rounded-xl">
              <Clock size={16} className="text-metric-emerald mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{metrics.totalTime}</div>
              <div className="text-xs text-foreground-secondary">Tempo Totale</div>
            </div>
            
            <div className="text-center p-3 bg-gradient-to-br from-metric-amber/10 to-transparent border border-metric-amber/20 rounded-xl">
              <Activity size={16} className="text-metric-amber mx-auto mb-1" />
              <div className="text-lg font-bold text-foreground">{metrics.conversionRate}%</div>
              <div className="text-xs text-foreground-secondary">Conversione</div>
            </div>
          </div>
          
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-foreground-secondary">Performance Complessiva</span>
              <span className="text-xs font-semibold text-foreground">{metrics.performanceScore}%</span>
            </div>
            <div className="w-full h-1.5 bg-glass-background rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-metric-emerald to-metric-amber rounded-full transition-all duration-500"
                style={{ width: `${metrics.performanceScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;