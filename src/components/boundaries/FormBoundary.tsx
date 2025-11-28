import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { logError } from '@/lib/error-handler';
import { captureException } from '@/lib/sentry';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  formName?: string;
  onDataRecover?: () => void;
  formData?: Record<string, unknown>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  savedFormData: Record<string, unknown>;
  retryCount: number;
}

class FormBoundary extends Component<Props, State> {
  private storageKey: string;
  private maxRetries = 2;

  constructor(props: Props) {
    super(props);
    this.storageKey = `form-recovery-${props.formName || 'default'}`;
    
    this.state = {
      hasError: false,
      error: null,
      savedFormData: {} as Record<string, unknown>,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { formName = 'Form', onError, formData } = this.props;
    
    // Save form data for recovery
    if (formData) {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify({
          data: formData,
          timestamp: Date.now(),
        }));
        this.setState({ savedFormData: formData });
      } catch (storageError) {
        console.warn('Failed to save form data for recovery:', storageError);
      }
    }

    // Log form-specific error
    logError(error, {
      component: formName,
      errorBoundary: 'FormBoundary',
      errorInfo,
      formData: formData ? 'present' : 'not-present',
      retryCount: this.state.retryCount,
      timestamp: new Date().toISOString(),
    });

    // Send to monitoring service
    captureException(error, {
      tags: {
        component: formName,
        boundary: 'form-boundary',
        hasFormData: !!formData,
      },
      extra: {
        errorInfo,
        retryCount: this.state.retryCount,
      },
    });

    if (onError) {
      onError(error, errorInfo);
    }
  }

  componentDidMount() {
    // Check for previously saved form data
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const { data, timestamp } = JSON.parse(saved);
        // Only recover data from the last 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          this.setState({ savedFormData: data });
        } else {
          localStorage.removeItem(this.storageKey);
        }
      }
    } catch (error) {
      console.warn('Failed to check for saved form data:', error);
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

  handleRecoverData = () => {
    const { onDataRecover } = this.props;
    const { savedFormData } = this.state;

    if (savedFormData && onDataRecover) {
      onDataRecover();
      this.setState({
        hasError: false,
        error: null,
      });
    }
  };

  handleClearSavedData = () => {
    try {
      localStorage.removeItem(this.storageKey);
      this.setState({ savedFormData: {} as Record<string, unknown> });
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  };

  getErrorType(): 'validation' | 'network' | 'submission' | 'unknown' {
    const error = this.state.error;
    if (!error) return 'unknown';

    const message = error.message.toLowerCase();
    
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    if (message.includes('submit') || message.includes('save')) {
      return 'submission';
    }
    
    return 'unknown';
  }

  getErrorMessage(): { title: string; description: string; suggestions: string[] } {
    const errorType = this.getErrorType();
    
    switch (errorType) {
      case 'validation':
        return {
          title: 'Form Validation Error',
          description: 'There was an issue with the information you entered.',
          suggestions: [
            'Check that all required fields are filled out',
            'Verify that dates and numbers are in the correct format',
            'Remove any special characters that might not be allowed',
          ],
        };
      
      case 'network':
        return {
          title: 'Connection Error',
          description: 'We couldn\'t save your form due to a connection issue.',
          suggestions: [
            'Check your internet connection',
            'Try again in a few moments',
            'Your data has been saved locally and can be recovered',
          ],
        };
      
      case 'submission':
        return {
          title: 'Save Error',
          description: 'We encountered an issue while saving your form.',
          suggestions: [
            'Try submitting the form again',
            'Check that all information is correct',
            'Contact support if the problem persists',
          ],
        };
      
      default:
        return {
          title: 'Form Error',
          description: 'Something went wrong with this form.',
          suggestions: [
            'Try filling out the form again',
            'Refresh the page if the issue persists',
            'Your progress may have been saved automatically',
          ],
        };
    }
  }

  render() {
    const { children, fallback, formName: _formName = 'Form' } = this.props;
    const { hasError, savedFormData, retryCount } = this.state;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      const { title, description, suggestions } = this.getErrorMessage();
      const canRetry = retryCount < this.maxRetries;

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedFormData && (
              <div className="bg-primary/10 border border-primary/20 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Save className="h-4 w-4 text-primary" />
                  <span className="font-medium text-primary">Data Recovery Available</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  We found previously entered form data that can be restored.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={this.handleRecoverData}
                    size="sm"
                    variant="outline"
                  >
                    Restore Data
                  </Button>
                  <Button
                    onClick={this.handleClearSavedData}
                    size="sm"
                    variant="ghost"
                  >
                    Clear Saved Data
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Suggested actions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-2">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again ({this.maxRetries - retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Start Over
              </Button>
            </div>

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

export default FormBoundary;