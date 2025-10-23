/**
 * Enhanced Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree and displays a fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { errorHandler, ErrorType, ErrorSeverity } from '@/utils/errorHandler';
import { ERROR_MESSAGES } from '@/config';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate unique error ID
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Update state with error info
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Handle error through global error handler
    const appError = errorHandler.handleError(error, {
      component: 'ErrorBoundary',
      action: 'Component Error',
      stack: error.stack,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error details in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Error ID:', errorId);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleGoHome = () => {
    // For client portals, don't redirect to main dashboard
    if (window.location.pathname.startsWith('/client/')) {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  handleReportBug = () => {
    const { error, errorId } = this.state;
    if (error && errorId) {
      // In a real app, you might want to open a bug report form
      // or send the error details to your support system
      const bugReportUrl = `mailto:support@tourcompanion.com?subject=Bug Report - Error ID: ${errorId}&body=Error Details:%0D%0A%0D%0AError: ${error.message}%0D%0AStack: ${error.stack}%0D%0AError ID: ${errorId}`;
      window.open(bugReportUrl);
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
          <Card className="w-full max-w-2xl shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                We encountered an unexpected error. Don't worry, we've been notified and are working to fix it.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error ID for support */}
              {errorId && (
                <div className="rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>Error ID:</strong> {errorId}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Please include this ID when contacting support.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button onClick={this.handleReportBug} variant="outline" className="flex-1">
                  <Bug className="mr-2 h-4 w-4" />
                  Report Bug
                </Button>
              </div>

              {/* Development error details */}
              {isDevelopment && error && (
                <details className="rounded-lg border border-slate-200 dark:border-slate-700">
                  <summary className="cursor-pointer p-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    Development Error Details
                  </summary>
                  <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                        Error Message:
                      </h4>
                      <code className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded block">
                        {error.message}
                      </code>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Stack Trace:
                        </h4>
                        <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo?.componentStack && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                          Component Stack:
                        </h4>
                        <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded overflow-auto max-h-32">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

