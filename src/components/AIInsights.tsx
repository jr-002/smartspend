import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, RefreshCw, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generateAIInsights } from '@/lib/api';
import { useAsyncOperation } from '@/hooks/useAsyncOperation';
import { toast } from '@/hooks/use-toast';

interface AIInsight {
  id: string;
  type: 'spending' | 'saving' | 'budget' | 'investment';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'spending':
      return <TrendingUp className="h-4 w-4" />;
    case 'saving':
      return <Target className="h-4 w-4" />;
    case 'budget':
      return <AlertCircle className="h-4 w-4" />;
    case 'investment':
      return <Brain className="h-4 w-4" />;
    default:
      return <Brain className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: AIInsight['priority']) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-500';
  }
};

export default function AIInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  
  const {
    execute: generateInsights,
    isLoading,
    error,
    reset
  } = useAsyncOperation<AIInsight[]>();

  const handleGenerateInsights = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please sign in to generate AI insights.",
        variant: "destructive"
      });
      return;
    }

    const result = await generateInsights(async () => {
      try {
        const apiInsights = await generateAIInsights(user.id);
        // generateAIInsights returns AIInsight[]
        return apiInsights.map((insight, index) => ({
          id: insight.id || `insight-${index}`,
          type: insight.type as 'spending' | 'saving' | 'budget' | 'investment',
          title: insight.title || `Insight #${index + 1}`,
          message: insight.description || insight.action || 'No description available',
          priority: insight.impact as 'high' | 'medium' | 'low',
          actionable: true
        }));
      } catch (error) {
        console.error('Error generating insights:', error);
        // Return fallback insights
        return [
          {
            id: 'fallback-1',
            type: 'spending' as const,
            title: 'Track Your Spending',
            message: 'Start by adding more transactions to get personalized insights about your spending patterns.',
            priority: 'medium' as const,
            actionable: true
          },
          {
            id: 'fallback-2',
            type: 'budget' as const,
            title: 'Create Budgets',
            message: 'Set up budget categories to better control your spending and reach your financial goals.',
            priority: 'high' as const,
            actionable: true
          }
        ];
      }
    });

    if (result) {
      setInsights(result);
      toast({
        title: "Success",
        description: `Generated ${result.length} AI insights for you.`
      });
    }
  };

  const handleRefresh = () => {
    reset();
    handleGenerateInsights();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Insights</h2>
          <p className="text-muted-foreground">
            Get personalized financial insights powered by AI
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleGenerateInsights}
            disabled={isLoading}
            variant="default"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isLoading ? 'Generating...' : 'Generate Insights'}
          </Button>
          {insights.length > 0 && (
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <p>Failed to generate insights: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {insights.length === 0 && !isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No insights yet</h3>
                <p className="text-muted-foreground">
                  Click "Generate Insights" to get personalized financial advice based on your data.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <Card 
              key={insight.id} 
              className={`border-l-4 ${getPriorityColor(insight.priority)}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <CardTitle className="text-base">{insight.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {insight.message}
                </p>
                {insight.actionable && (
                  <Button size="sm" variant="outline">
                    Take Action
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}