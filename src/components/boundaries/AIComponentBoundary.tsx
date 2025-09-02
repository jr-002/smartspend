import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/error-handler';
import { captureException } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
  showRetry?: boolean;
  showFeedback?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
  errorId: string;
}

class AIComponentBoundary extends Component<Props, State> {
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `ai-error-${Date.now()}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = 'AIComponent', onError } = this.props;
    
    // Log error with context
    logError(error, {
      component: componentName,
      errorBoundary: 'AIComponentBoundary',
      errorInfo,
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    // Send to monitoring service
    captureException(error, {
      tags: {
        component: componentName,
        boundary: 'ai-component',
      },
      extra: {
        errorInfo,
        retryCount: this.state.retryCount,
      },
    });

    // Call custom error handler
    if (onError) {
      onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReportIssue = () => {
    const { componentName = 'AIComponent' } = this.props;
    const { error, errorId } = this.state;
    
    // Create issue report
    const issueData = {
      errorId,
      component: componentName,
      error: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Log issue report
    console.log('Issue reported:', issueData);
    
    // In production, this would send to a support system
    alert('Issue reported successfully. Our team will investigate.');
  };

  render() {
    const { children, fallback, componentName = 'AI Component', showRetry = true, showFeedback = true } = this.props;
    const { hasError, error, retryCount } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const canRetry = retryCount < this.maxRetries && showRetry;
      
      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">
                {componentName} Error
              </CardTitle>
            </div>
            <CardDescription>
              {error?.message?.includes('AI') || error?.message?.includes('API')
                ? 'AI service is temporarily unavailable. This might be due to high demand or a temporary outage.'
                : 'An unexpected error occurred while loading this component.'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-3 rounded text-sm font-mono">
                <strong>Error:</strong> {error?.message}
                {error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 text-xs overflow-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Retry ({this.maxRetries - retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
              
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
              
              {showFeedback && (
                <Button
                  onClick={this.handleReportIssue}
                  variant="outline"
                  size="sm"
                >
                  Report Issue
                </Button>
              )}
            </div>

            {retryCount >= this.maxRetries && (
              <div className="bg-muted p-3 rounded text-sm">
                <strong>Still having issues?</strong>
                <p className="mt-1 text-muted-foreground">
                  Try refreshing the page or check back in a few minutes. 
                  If the problem persists, please report the issue.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    return children;
  }
}

export default AIComponentBoundary;