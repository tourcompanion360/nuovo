import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartData } from '@/hooks/useDashboardData';

interface StatsChartProps {
  data?: ChartData[];
}

const defaultData: ChartData[] = [
  { date: '2025-01-15', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-16', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-17', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-18', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-19', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-20', visitatori: 0, tempoMedio: 0, conversioni: 0 },
  { date: '2025-01-21', visitatori: 0, tempoMedio: 0, conversioni: 0 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('it-IT', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const formatTime = (seconds: number) => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    };

    return (
      <div className="bg-background border border-border rounded-xl p-3 md:p-4 shadow-2xl backdrop-blur-sm max-w-xs">
        <div className="border-b border-border pb-2 mb-2 md:mb-3">
          <p className="font-semibold text-foreground text-xs md:text-sm">
            {formatDate(label)}
          </p>
        </div>
        
        <div className="space-y-1.5 md:space-y-2">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 md:gap-2">
                <div 
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-xs text-foreground-secondary font-medium">
                  {entry.name === 'visitatori' ? 'Visitatori' :
                   entry.name === 'tempoMedio' ? 'Tempo Medio' :
                   'Conversioni'}
                </span>
              </div>
              <span className="text-xs md:text-sm font-bold text-foreground">
                {entry.name === 'tempoMedio' ? formatTime(entry.value) : entry.value}
                {entry.name === 'visitatori' && ' utenti'}
                {entry.name === 'conversioni' && ' leads'}
              </span>
            </div>
          ))}
        </div>
        
        {/* Performance indicator */}
        <div className="border-t border-border pt-1.5 md:pt-2 mt-2 md:mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground-muted">Tasso Conversione:</span>
            <span className="text-xs font-semibold text-success">
              {payload.find((p: any) => p.name === 'conversioni') && payload.find((p: any) => p.name === 'visitatori') ? 
                Math.round((payload.find((p: any) => p.name === 'conversioni').value / payload.find((p: any) => p.name === 'visitatori').value) * 100) + '%' : 
                'N/A'
              }
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const StatsChart = ({ data }: StatsChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="chart-container p-3 md:p-8">
      {/* Mobile Header & Controls */}
      <div className="block md:hidden mb-4">
        <h3 className="text-lg font-semibold gradient-text mb-2">Analytics</h3>
        <p className="text-foreground-secondary text-xs mb-3">Performance trends</p>
        
        {/* Mobile Controls */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Ultima Settimana</SelectItem>
                <SelectItem value="30days">Ultimo Mese</SelectItem>
                <SelectItem value="90days">Ultimi 3 Mesi</SelectItem>
                <SelectItem value="180days">Ultimi 6 Mesi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Mobile Compact Legend */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-metric-blue" />
            <span className="text-foreground-muted">Visitatori</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-metric-emerald" />
            <span className="text-foreground-muted">Tempo</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-metric-violet" />
            <span className="text-foreground-muted">Conversioni</span>
          </div>
        </div>
      </div>

      {/* Desktop Header & Controls */}
      <div className="hidden md:block mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-semibold gradient-text mb-2">Performance Analytics</h3>
            <p className="text-foreground-secondary">Trend delle performance aggiornate - Gennaio 2025</p>
          </div>
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-metric-blue to-metric-cyan shadow-lg" />
              <span className="text-foreground-secondary font-medium">Visitatori</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-metric-emerald to-metric-amber shadow-lg" />
              <span className="text-foreground-secondary font-medium">Tempo Sessione</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-metric-violet to-metric-rose shadow-lg" />
              <span className="text-foreground-secondary font-medium">Conversioni</span>
            </div>
          </div>
        </div>
        
        {/* Desktop Controls */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-foreground-muted" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Ultima Settimana</SelectItem>
                <SelectItem value="30days">Ultimo Mese</SelectItem>
                <SelectItem value="90days">Ultimi 3 Mesi</SelectItem>
                <SelectItem value="180days">Ultimi 6 Mesi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart Container - Mobile Optimized */}
      <div className="h-48 md:h-96 relative overflow-hidden rounded-lg border border-glass-border bg-glass-background/30">
        {/* Background grid pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={chartData} 
            margin={{ 
              top: 20, 
              right: 10, 
              left: 10, 
              bottom: 5 
            }}
          >
            <defs>
              <linearGradient id="visitatoriGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--metric-blue))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--metric-cyan))" stopOpacity={0.2}/>
              </linearGradient>
              <linearGradient id="conversioniGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--metric-violet))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--metric-rose))" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: 'hsl(var(--foreground-secondary))', 
                fontSize: 10,
                fontWeight: 500 
              }}
              tickFormatter={(value) => value.slice(8) + '/' + value.slice(5, 7)}
              interval="preserveStartEnd"
            />
            <YAxis 
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: 'hsl(var(--foreground-secondary))', 
                fontSize: 10,
                fontWeight: 500 
              }}
              width={30}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ 
                fill: 'hsl(var(--foreground-secondary))', 
                fontSize: 10,
                fontWeight: 500 
              }}
              width={30}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Bar 
              yAxisId="left"
              dataKey="visitatori" 
              fill="url(#visitatoriGradient)"
              radius={[6, 6, 0, 0]}
              name="visitatori"
            />
            <Bar 
              yAxisId="left"
              dataKey="conversioni" 
              fill="url(#conversioniGradient)"
              radius={[6, 6, 0, 0]}
              name="conversioni"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="tempoMedio" 
              stroke="hsl(var(--metric-emerald))"
              strokeWidth={3}
              dot={{ 
                fill: 'hsl(var(--metric-emerald))', 
                strokeWidth: 2, 
                r: 4,
                stroke: 'hsl(var(--background))'
              }}
              activeDot={{
                r: 6,
                fill: 'hsl(var(--metric-emerald))',
                stroke: 'hsl(var(--background))',
                strokeWidth: 2,
                filter: 'drop-shadow(0 0 10px hsl(var(--metric-emerald) / 0.6))'
              }}
              name="tempoMedio"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsChart;