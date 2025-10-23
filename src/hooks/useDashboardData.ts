import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DashboardMetrics {
  totalViews: number;
  uniqueVisitors: number;
  totalTime: string;
  avgSessionTime: string;
  conversionRate: number;
  performanceScore: number;
}

export interface ChartData {
  date: string;
  visitatori: number;
  tempoMedio: number;
  conversioni: number;
}

const useDashboardData = () => {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalViews: 0,
    uniqueVisitors: 0,
    totalTime: '00:00:00',
    avgSessionTime: '00:00',
    conversionRate: 0,
    performanceScore: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const { toast } = useToast();

  const parseCSV = useCallback((text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index]?.trim() || '';
      });
      return obj;
    });
  }, []);

  const calculateMetrics = useCallback((data: any[]) => {
    if (!data.length) return;

    // Extract metrics from CSV data
    const totalViews = data.reduce((sum, row) => {
      const views = parseInt(row.views || row.visualizzazioni || row.pageviews || '0');
      return sum + (isNaN(views) ? 0 : views);
    }, 0);

    const uniqueVisitors = data.reduce((sum, row) => {
      const visitors = parseInt(row.visitors || row.visitatori || row.users || '0');
      return sum + (isNaN(visitors) ? 0 : visitors);
    }, 0);

    const sessionTimes = data.map(row => {
      const time = parseFloat(row.sessiontime || row.tempo || row.duration || '0');
      return isNaN(time) ? 0 : time;
    }).filter(time => time > 0);

    const totalTimeSeconds = sessionTimes.reduce((sum, time) => sum + time, 0);
    const avgTimeSeconds = sessionTimes.length > 0 ? totalTimeSeconds / sessionTimes.length : 0;

    const conversions = data.reduce((sum, row) => {
      const conv = parseInt(row.conversions || row.conversioni || row.leads || '0');
      return sum + (isNaN(conv) ? 0 : conv);
    }, 0);

    const conversionRate = uniqueVisitors > 0 ? (conversions / uniqueVisitors) * 100 : 0;
    const performanceScore = Math.min(100, Math.round(
      (totalViews * 0.3 + uniqueVisitors * 0.4 + conversionRate * 0.3)
    ));

    const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return h > 0 ? `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` 
                   : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    setMetrics({
      totalViews,
      uniqueVisitors,
      totalTime: formatTime(totalTimeSeconds),
      avgSessionTime: formatTime(avgTimeSeconds),
      conversionRate: Math.round(conversionRate * 10) / 10,
      performanceScore
    });

    // Generate chart data from CSV
    const chartDataMap = new Map<string, ChartData>();
    data.forEach(row => {
      const date = row.date || row.data || new Date().toISOString().split('T')[0];
      const visitors = parseInt(row.visitors || row.visitatori || '0') || 0;
      const sessionTime = parseFloat(row.sessiontime || row.tempo || '0') || 0;
      const convs = parseInt(row.conversions || row.conversioni || '0') || 0;

      if (chartDataMap.has(date)) {
        const existing = chartDataMap.get(date)!;
        existing.visitatori += visitors;
        existing.tempoMedio = (existing.tempoMedio + sessionTime) / 2;
        existing.conversioni += convs;
      } else {
        chartDataMap.set(date, {
          date,
          visitatori: visitors,
          tempoMedio: sessionTime,
          conversioni: convs
        });
      }
    });

    setChartData(Array.from(chartDataMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ));
  }, []);

  const handleCSVUpload = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Errore",
        description: "Per favore seleziona un file CSV valido.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const data = parseCSV(text);
      
      if (data.length === 0) {
        toast({
          title: "Errore",
          description: "Il file CSV è vuoto o non valido.",
          variant: "destructive",
        });
        return;
      }

      setCsvData(data);
      calculateMetrics(data);
      
      toast({
        title: "Successo",
        description: `File CSV elaborato! ${data.length} righe importate.`,
      });
    };
    reader.readAsText(file);
  }, [parseCSV, calculateMetrics, toast]);

  return {
    csvData,
    metrics,
    chartData,
    handleCSVUpload,
    hasData: csvData.length > 0
  };
};

export default useDashboardData;