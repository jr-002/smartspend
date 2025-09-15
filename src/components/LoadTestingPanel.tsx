import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { loadTester, LoadTestResult } from '@/lib/load-testing';

const LoadTestingPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [results, setResults] = useState<LoadTestResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runBasicLoadTest = async () => {
    setIsRunning(true);
    setCurrentTest('Dashboard Load Test');
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      const result = await loadTester.testDashboardLoad();
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(prev => [...prev, result]);
    } catch (error) {
      console.error('Load test failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const runAPILoadTest = async () => {
    setIsRunning(true);
    setCurrentTest('API Endpoint Test');
    setProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 8, 90));
      }, 1200);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const result = await loadTester.testAPIEndpoint(`${supabaseUrl}/functions/v1/ai-insights`);
      
      clearInterval(progressInterval);
      setProgress(100);
      setResults(prev => [...prev, result]);
    } catch (error) {
      console.error('API load test failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest('');
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const getResultStatus = (result: LoadTestResult): 'success' | 'warning' | 'error' => {
    const errorRate = result.failedRequests / result.totalRequests;
    const avgResponseTime = result.averageResponseTime;
    
    if (errorRate > 0.05 || avgResponseTime > 5000) return 'error';
    if (errorRate > 0.01 || avgResponseTime > 2000) return 'warning';
    return 'success';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-success text-success-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Load Testing
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test application performance under load
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={runBasicLoadTest}
              disabled={isRunning}
              className="gap-2"
            >
              <Zap className="w-4 h-4" />
              Test Dashboard Load
            </Button>
            
            <Button 
              onClick={runAPILoadTest}
              disabled={isRunning}
              variant="outline"
              className="gap-2"
            >
              <Activity className="w-4 h-4" />
              Test API Performance
            </Button>
          </div>

          {/* Progress */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Running: {currentTest}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Test Results</h3>
              
              <div className="space-y-3">
                {results.map((result, index) => {
                  const status = getResultStatus(result);
                  const errorRate = ((result.failedRequests / result.totalRequests) * 100).toFixed(1);
                  
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="font-medium">Test #{index + 1}</span>
                        </div>
                        <Badge className={getStatusColor(status)}>
                          {status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Requests</p>
                          <p className="font-medium">{result.totalRequests}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">{(100 - parseFloat(errorRate)).toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Response</p>
                          <p className="font-medium">{result.averageResponseTime.toFixed(0)}ms</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requests/sec</p>
                          <p className="font-medium">{result.requestsPerSecond.toFixed(1)}</p>
                        </div>
                      </div>
                      
                      {result.errors.length > 0 && (
                        <div className="mt-3 p-2 bg-destructive/10 rounded border border-destructive/20">
                          <p className="text-sm font-medium text-destructive mb-1">Errors:</p>
                          {result.errors.map((error, i) => (
                            <p key={i} className="text-xs text-destructive">
                              {error.error} ({error.count}x)
                            </p>
                          ))}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setResults([])}
                className="w-full"
              >
                Clear Results
              </Button>
            </div>
          )}

          {/* Performance Guidelines */}
          <Alert>
            <Activity className="h-4 w-4" />
            <AlertDescription>
              <strong>Performance Targets:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Response time: &lt;2s average, &lt;5s maximum</li>
                <li>• Success rate: &gt;99% under normal load</li>
                <li>• Throughput: &gt;10 requests/second</li>
                <li>• Error rate: &lt;1% under normal conditions</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadTestingPanel;