// Load testing utilities for performance validation
export interface LoadTestConfig {
  concurrent: number;
  duration: number;
  endpoint: string;
  method: 'GET' | 'POST';
  payload?: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface LoadTestResult {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  requestsPerSecond: number;
  errors: Array<{
    error: string;
    count: number;
  }>;
}

export class LoadTester {
  private static instance: LoadTester;

  static getInstance(): LoadTester {
    if (!LoadTester.instance) {
      LoadTester.instance = new LoadTester();
    }
    return LoadTester.instance;
  }

  async runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
    console.log('Starting load test:', config);
    
    const startTime = Date.now();
    const endTime = startTime + config.duration;
    const results: Array<{ success: boolean; responseTime: number; error?: string }> = [];
    const errorCounts = new Map<string, number>();

    // Create concurrent workers
    const workers = Array.from({ length: config.concurrent }, () => 
      this.createWorker(config, endTime, results, errorCounts)
    );

    // Wait for all workers to complete
    await Promise.all(workers);

    // Calculate results
    const totalRequests = results.length;
    const successfulRequests = results.filter(r => r.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const responseTimes = results.map(r => r.responseTime);
    const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / totalRequests;
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);
    const actualDuration = Date.now() - startTime;
    const requestsPerSecond = (totalRequests / actualDuration) * 1000;

    const errors = Array.from(errorCounts.entries()).map(([error, count]) => ({
      error,
      count
    }));

    const result: LoadTestResult = {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      minResponseTime,
      maxResponseTime,
      requestsPerSecond,
      errors
    };

    console.log('Load test completed:', result);
    return result;
  }

  private async createWorker(
    config: LoadTestConfig,
    endTime: number,
    results: Array<{ success: boolean; responseTime: number; error?: string }>,
    errorCounts: Map<string, number>
  ): Promise<void> {
    while (Date.now() < endTime) {
      const requestStart = performance.now();
      
      try {
        const response = await fetch(config.endpoint, {
          method: config.method,
          headers: {
            'Content-Type': 'application/json',
            ...config.headers
          },
          body: config.payload ? JSON.stringify(config.payload) : undefined,
        });

        const responseTime = performance.now() - requestStart;
        
        if (response.ok) {
          results.push({ success: true, responseTime });
        } else {
          const errorMessage = `HTTP ${response.status}`;
          results.push({ success: false, responseTime, error: errorMessage });
          errorCounts.set(errorMessage, (errorCounts.get(errorMessage) || 0) + 1);
        }
      } catch (error) {
        const responseTime = performance.now() - requestStart;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ success: false, responseTime, error: errorMessage });
        errorCounts.set(errorMessage, (errorCounts.get(errorMessage) || 0) + 1);
      }

      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  // Predefined load tests for common scenarios
  async testDashboardLoad(): Promise<LoadTestResult> {
    return this.runLoadTest({
      concurrent: 5,
      duration: 10000, // 10 seconds
      endpoint: '/',
      method: 'GET'
    });
  }

  async testAPIEndpoint(endpoint: string, authToken?: string): Promise<LoadTestResult> {
    return this.runLoadTest({
      concurrent: 3,
      duration: 15000, // 15 seconds
      endpoint,
      method: 'POST',
      headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
      payload: { test: true }
    });
  }

  // Stress test with gradually increasing load
  async runStressTest(baseConfig: LoadTestConfig): Promise<LoadTestResult[]> {
    const results: LoadTestResult[] = [];
    const concurrencyLevels = [1, 2, 5, 10, 15, 20];

    for (const concurrent of concurrencyLevels) {
      console.log(`Running stress test with ${concurrent} concurrent users`);
      
      const result = await this.runLoadTest({
        ...baseConfig,
        concurrent,
        duration: 5000 // 5 seconds per level
      });
      
      results.push(result);
      
      // Stop if error rate exceeds 10%
      if (result.failedRequests / result.totalRequests > 0.1) {
        console.warn(`Stopping stress test at ${concurrent} concurrent users due to high error rate`);
        break;
      }
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }
}

export const loadTester = LoadTester.getInstance();