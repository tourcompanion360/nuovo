/**
 * Performance monitoring utilities
 * Provides timing, memory usage, and performance metrics
 */

import { logPerformance } from './logger';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

class PerformanceMonitor {
  private timers = new Map<string, number>();
  private metrics: PerformanceMetrics[] = [];

  /**
   * Start timing an operation
   */
  startTimer(operation: string): void {
    this.timers.set(operation, performance.now());
  }

  /**
   * End timing an operation and log the result
   */
  endTimer(operation: string, metadata?: Record<string, unknown>): number {
    const startTime = this.timers.get(operation);
    if (!startTime) {
      console.warn(`Timer for operation "${operation}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(operation);

    const metric: PerformanceMetrics = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.metrics.push(metric);
    logPerformance(operation, duration, metadata);

    return duration;
  }

  /**
   * Measure the execution time of a function
   */
  async measureAsync<T>(
    operation: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startTimer(operation);
    try {
      const result = await fn();
      this.endTimer(operation, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(operation, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Measure the execution time of a synchronous function
   */
  measure<T>(
    operation: string,
    fn: () => T,
    metadata?: Record<string, unknown>
  ): T {
    this.startTimer(operation);
    try {
      const result = fn();
      this.endTimer(operation, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(operation, { ...metadata, success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  /**
   * Get memory usage information
   */
  getMemoryUsage(): MemoryUsage | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
      };
    }
    return null;
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear performance metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get average performance for an operation
   */
  getAveragePerformance(operation: string): number {
    const operationMetrics = this.metrics.filter(m => m.operation === operation);
    if (operationMetrics.length === 0) return 0;
    
    const totalDuration = operationMetrics.reduce((sum, m) => sum + m.duration, 0);
    return totalDuration / operationMetrics.length;
  }

  /**
   * Get slowest operations
   */
  getSlowestOperations(limit = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const startTimer = (operation: string) => performanceMonitor.startTimer(operation);
export const endTimer = (operation: string, metadata?: Record<string, unknown>) => 
  performanceMonitor.endTimer(operation, metadata);
export const measureAsync = <T>(
  operation: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>
) => performanceMonitor.measureAsync(operation, fn, metadata);
export const measure = <T>(
  operation: string,
  fn: () => T,
  metadata?: Record<string, unknown>
) => performanceMonitor.measure(operation, fn, metadata);
export const getMemoryUsage = () => performanceMonitor.getMemoryUsage();
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const getAveragePerformance = (operation: string) => 
  performanceMonitor.getAveragePerformance(operation);
export const getSlowestOperations = (limit = 10) => 
  performanceMonitor.getSlowestOperations(limit);

/**
 * React hook for measuring component render performance
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startRender = () => startTimer(`${componentName}-render`);
  const endRender = (metadata?: Record<string, unknown>) => 
    endTimer(`${componentName}-render`, metadata);

  return { startRender, endRender };
};

/**
 * Higher-order component for measuring component performance
 */
export const withPerformanceMonitoring = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) => {
  return (props: P) => {
    const { startRender, endRender } = usePerformanceMonitor(componentName);
    
    React.useEffect(() => {
      startRender();
      return () => endRender();
    });

    return React.createElement(WrappedComponent, props);
  };
};


