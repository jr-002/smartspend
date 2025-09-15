// Capacity planning and scaling utilities
export interface CapacityMetrics {
  currentLoad: number;
  maxCapacity: number;
  utilizationPercentage: number;
  recommendedScaling: 'none' | 'up' | 'down';
  bottlenecks: string[];
}

export interface ScalingRecommendation {
  component: string;
  currentCapacity: number;
  recommendedCapacity: number;
  reasoning: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost: string;
}

export class CapacityPlanner {
  private static instance: CapacityPlanner;
  private metrics: Map<string, number[]> = new Map();
  private thresholds = {
    cpu: 70, // 70% CPU utilization
    memory: 80, // 80% memory utilization
    requests: 1000, // requests per minute
    responseTime: 2000, // 2 seconds
    errorRate: 1, // 1% error rate
  };

  static getInstance(): CapacityPlanner {
    if (!CapacityPlanner.instance) {
      CapacityPlanner.instance = new CapacityPlanner();
    }
    return CapacityPlanner.instance;
  }

  recordMetric(component: string, value: number): void {
    if (!this.metrics.has(component)) {
      this.metrics.set(component, []);
    }
    
    const values = this.metrics.get(component)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  analyzeCapacity(): CapacityMetrics {
    const allMetrics = Array.from(this.metrics.values()).flat();
    const currentLoad = allMetrics.length > 0 
      ? allMetrics.reduce((sum, val) => sum + val, 0) / allMetrics.length 
      : 0;
    
    const maxCapacity = 100; // Simplified capacity model
    const utilizationPercentage = (currentLoad / maxCapacity) * 100;
    
    let recommendedScaling: 'none' | 'up' | 'down' = 'none';
    const bottlenecks: string[] = [];

    // Analyze each component
    for (const [component, values] of this.metrics.entries()) {
      const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      const threshold = this.getThreshold(component);
      
      if (avgValue > threshold) {
        bottlenecks.push(component);
        if (recommendedScaling === 'none') {
          recommendedScaling = 'up';
        }
      }
    }

    // Check if we can scale down
    if (utilizationPercentage < 30 && bottlenecks.length === 0) {
      recommendedScaling = 'down';
    }

    return {
      currentLoad,
      maxCapacity,
      utilizationPercentage,
      recommendedScaling,
      bottlenecks
    };
  }

  generateScalingRecommendations(): ScalingRecommendation[] {
    const recommendations: ScalingRecommendation[] = [];
    const capacity = this.analyzeCapacity();

    if (capacity.recommendedScaling === 'up') {
      recommendations.push({
        component: 'API Endpoints',
        currentCapacity: 100,
        recommendedCapacity: 150,
        reasoning: 'High request volume detected, recommend increasing API capacity',
        priority: 'high',
        estimatedCost: '$50-100/month additional'
      });

      if (capacity.bottlenecks.includes('database')) {
        recommendations.push({
          component: 'Database',
          currentCapacity: 100,
          recommendedCapacity: 200,
          reasoning: 'Database queries showing high latency',
          priority: 'high',
          estimatedCost: '$100-200/month additional'
        });
      }
    }

    if (capacity.bottlenecks.includes('memory')) {
      recommendations.push({
        component: 'Memory',
        currentCapacity: 512,
        recommendedCapacity: 1024,
        reasoning: 'Memory usage consistently above 80%',
        priority: 'medium',
        estimatedCost: '$25-50/month additional'
      });
    }

    return recommendations;
  }

  private getThreshold(component: string): number {
    switch (component) {
      case 'cpu': return this.thresholds.cpu;
      case 'memory': return this.thresholds.memory;
      case 'requests': return this.thresholds.requests;
      case 'responseTime': return this.thresholds.responseTime;
      case 'errorRate': return this.thresholds.errorRate;
      default: return 70;
    }
  }

  // Simulate load for testing
  simulateLoad(component: string, duration: number = 60000): void {
    const interval = setInterval(() => {
      const randomLoad = Math.random() * 100;
      this.recordMetric(component, randomLoad);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
    }, duration);
  }

  // Get capacity planning report
  getCapacityReport(): {
    summary: CapacityMetrics;
    recommendations: ScalingRecommendation[];
    trends: Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }>;
  } {
    const summary = this.analyzeCapacity();
    const recommendations = this.generateScalingRecommendations();
    const trends = this.calculateTrends();

    return {
      summary,
      recommendations,
      trends
    };
  }

  private calculateTrends(): Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }> {
    const trends: Record<string, { trend: 'increasing' | 'decreasing' | 'stable'; change: number }> = {};

    for (const [component, values] of this.metrics.entries()) {
      if (values.length < 10) continue;

      const recent = values.slice(-10);
      const older = values.slice(-20, -10);
      
      if (older.length === 0) continue;

      const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
      const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
      
      const change = ((recentAvg - olderAvg) / olderAvg) * 100;
      
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (Math.abs(change) > 10) {
        trend = change > 0 ? 'increasing' : 'decreasing';
      }

      trends[component] = { trend, change };
    }

    return trends;
  }
}

export const capacityPlanner = CapacityPlanner.getInstance();