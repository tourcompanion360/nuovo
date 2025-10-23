import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, HardDrive, Wifi, WifiOff } from 'lucide-react';

interface CacheStatusProps {
  className?: string;
}

export const CacheStatus: React.FC<CacheStatusProps> = ({ className }) => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cacheData = queryClient.getQueryCache();
  const queries = cacheData.getAll();
  
  const cacheStats = {
    totalQueries: queries.length,
    activeQueries: queries.filter(q => q.state.status === 'pending').length,
    cachedQueries: queries.filter(q => q.state.data).length,
    staleQueries: queries.filter(q => q.state.isStale).length,
  };

  const clearCache = () => {
    queryClient.clear();
  };

  const refreshAll = () => {
    queryClient.invalidateQueries();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="h-4 w-4" />
          Cache Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Connection</span>
          <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Cache Statistics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Queries:</span>
            <span className="font-medium">{cacheStats.totalQueries}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cached:</span>
            <span className="font-medium text-green-600">{cacheStats.cachedQueries}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active:</span>
            <span className="font-medium text-blue-600">{cacheStats.activeQueries}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stale:</span>
            <span className="font-medium text-orange-600">{cacheStats.staleQueries}</span>
          </div>
        </div>

        {/* Cache Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshAll}
            className="flex-1 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={clearCache}
            className="flex-1 text-xs"
          >
            <HardDrive className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>

        {/* Cache Hit Rate */}
        {cacheStats.totalQueries > 0 && (
          <div className="pt-2 border-t">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Cache Hit Rate:</span>
              <span className="font-medium">
                {Math.round((cacheStats.cachedQueries / cacheStats.totalQueries) * 100)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

