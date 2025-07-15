import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Insight {
  id: string;
  type: 'spending' | 'saving' | 'investment' | 'budget' | 'goal';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  priority: number;
}

const AIInsights = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      generateAIInsights();
    }, 1000);
  };

  const generateAIInsights = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to generate insights.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.insights && Array.isArray(data.insights)) {
        setInsights(data.insights.sort((a, b) => a.priority - b.priority));
        toast({
          title: "Success",
          description: "AI insights generated successfully!",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive",
      });
      
      // Fallback to demo insights if API fails
      setInsights([
        {
          id: "fallback-1",
          type: "spending",
          title: "Analysis Unavailable",
          description: "Unable to connect to AI service. Please check your internet connection and try again.",
          impact: "medium",
          action: "Retry generating insights or review your financial data manually.",
          priority: 1
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'spending': return <TrendingUp className="w-5 h-5" />;
      case 'saving': return <Target className="w-5 h-5" />;
      case 'investment': return <Sparkles className="w-5 h-5" />;
      case 'budget': return <AlertTriangle className="w-5 h-5" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'spending': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'saving': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'investment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'budget': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="shadow-card bg-gradient-card border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            AI Financial Insights
          </CardTitle>
          <Button 
            variant="outline" 
            onClick={generateInsights}
            disabled={isGenerating}
            className="bg-gradient-primary text-primary-foreground border-0"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Generating AI Insights...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>
        <p className="text-muted-foreground">
          AI-powered personalized recommendations based on your financial behavior and goals
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="p-6 border rounded-lg bg-card/50 hover:bg-card transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  {getTypeIcon(insight.type)}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{insight.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getTypeColor(insight.type)}>
                          {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                        </Badge>
                        <Badge className={getImpactColor(insight.impact)}>
                          {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                  
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium text-foreground mb-2">💡 Recommended Action:</p>
                    <p className="text-sm text-muted-foreground">{insight.action}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                    <Button size="sm" className="bg-gradient-primary">
                      Apply Suggestion
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {insights.length === 0 && !isGenerating && (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No insights available</h3>
              <p className="text-muted-foreground mb-4">
                Add more transactions and financial data to get AI-powered personalized insights
              </p>
              <Button onClick={generateInsights} className="bg-gradient-primary">
                Generate Insights
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsights;