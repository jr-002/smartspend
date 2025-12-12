import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Database, Wifi } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { logError } from '@/lib/error-handler';
import { captureException } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
  showOfflineMessage?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isOnline: boolean;
  errorType: 'network' | 'data' | 'unknown';
}

class DataBoundary extends Component<Props, State> {
  private onlineDebounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private offlineDebounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isOnline: navigator.onLine,
      errorType: 'unknown',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Detect error type based on error message
    let errorType: 'network' | 'data' | 'unknown' = 'unknown';
    
    if (error.message.includes('fetch') || 
        error.message.includes('network') || 
        error.message.includes('NetworkError')) {
      errorType = 'network';
    } else if (error.message.includes('data') || 
               error.message.includes('database') ||
               error.message.includes('supabase')) {
      errorType = 'data';
    }

    return {
      hasError: true,
      error,
      errorType,
    };
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    // Clear any pending timeouts
    if (this.onlineDebounceTimeout) {
      clearTimeout(this.onlineDebounceTimeout);
    }
    if (this.offlineDebounceTimeout) {
      clearTimeout(this.offlineDebounceTimeout);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = 'DataComponent', onError } = this.props;
    
    // Enhanced error logging for data-related errors
    logError(error, {
      component: componentName,
      errorBoundary: 'DataBoundary',
      errorInfo,
      errorType: this.state.errorType,
      isOnline: this.state.isOnline,
      timestamp: new Date().toISOString(),
      connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } })?.connection?.effectiveType || 'unknown',
      userAgent: navigator.userAgent,
    });

    // Send to monitoring service with data-specific tags
    captureException(error, {
      tags: {
        component: componentName,
        boundary: 'data-boundary',
        errorType: this.state.errorType,
        isOnline: this.state.isOnline.toString(),
      },
      extra: {
        errorInfo,
        connectionInfo: {
          onLine: navigator.onLine,
          connectionType: (navigator as Navigator & { connection?: { effectiveType?: string } })?.connection?.effectiveType,
        },
      },
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleOnline = () => {
    // Debounce online event to prevent rapid state changes
    if (this.onlineDebounceTimeout) {
      clearTimeout(this.onlineDebounceTimeout);
    }
    
    this.onlineDebounceTimeout = setTimeout(() => {
      // Only update if we're actually online now
      if (navigator.onLine && !this.state.isOnline) {
        this.setState({ isOnline: true });
        
        // If we were offline and now online, try to recover after a delay
        if (this.state.hasError && this.state.errorType === 'network') {
          setTimeout(() => {
            this.setState({
              hasError: false,
              error: null,
            });
          }, 2000);
        }
      }
    }, 500);
  };

  handleOffline = () => {
    // Debounce offline event to prevent rapid state changes
    if (this.offlineDebounceTimeout) {
      clearTimeout(this.offlineDebounceTimeout);
    }
    
    this.offlineDebounceTimeout = setTimeout(() => {
      // Only update if we're actually offline now
      if (!navigator.onLine && this.state.isOnline) {
        this.setState({ isOnline: false });
      }
    }, 500);
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  getErrorMessage(): { title: string; description: string; icon: ReactNode } {
    const { errorType, isOnline } = this.state;
    
    if (!isOnline || errorType === 'network') {
      return {
        title: 'Connection Problem',
        description: isOnline 
          ? 'Unable to connect to our servers. Please check your internet connection and try again.'
          : 'You appear to be offline. Please check your internet connection.',
        icon: <Wifi className="h-5 w-5 text-destructive" />,
      };
    }
    
    if (errorType === 'data') {
      return {
        title: 'Data Loading Error',
        description: 'We encountered an issue loading your financial data. This might be temporary.',
        icon: <Database className="h-5 w-5 text-destructive" />,
      };
    }
    
    return {
      title: 'Loading Error',
      description: 'Something went wrong while loading this section. Please try again.',
      icon: <AlertTriangle className="h-5 w-5 text-destructive" />,
    };
  }

  renderLoadingSkeleton(): ReactNode {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  render() {
    const { children, fallback, componentName: _componentName = 'Data Component', showOfflineMessage = true } = this.props;
    const { hasError, isOnline } = this.state;

    // Show offline message if configured and offline
    if (!isOnline && showOfflineMessage && !hasError) {
      return (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-warning">
              <Wifi className="h-5 w-5" />
              <span className="font-medium">You're offline</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Some features may not work properly until you reconnect.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const { title, description, icon } = this.getErrorMessage();

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-destructive">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!isOnline && this.state.errorType === 'network'}
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>

            {this.state.errorType === 'network' && !isOnline && (
              <div className="bg-muted p-3 rounded text-sm">
                <strong>Tips for connectivity issues:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Check your WiFi or mobile data connection</li>
                  <li>Try moving to an area with better signal</li>
                  <li>Restart your router if using WiFi</li>
                </ul>
              </div>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="bg-muted p-3 rounded text-sm">
                <summary className="cursor-pointer font-medium">
                  Debug Information
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default DataBoundary;