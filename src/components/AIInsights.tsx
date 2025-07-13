import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Sparkles } from "lucide-react";

interface Insight {
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

  const generateInsights = () => {
    setIsGenerating(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const newInsights: Insight[] = [
        {
          id: "1",
          type: "spending",
          title: "Food Spending Alert",
          description: "Your food expenses have increased by 23% this month compared to your average. You've spent ₦45,200 on dining and groceries.",
          impact: "high",
          action: "Consider meal planning and cooking at home 2-3 more times per week to save ₦8,000-12,000",
          priority: 1
        },
        {
          id: "2",
          type: "saving",
          title: "Emergency Fund Opportunity",
          description: "Based on your income pattern, you could build a 6-month emergency fund faster by increasing your savings rate slightly.",
          impact: "medium",
          action: "Increase your monthly savings by ₦15,000 to reach your emergency fund goal 4 months earlier",
          priority: 2
        },
        {
          id: "3",
          type: "investment",
          title: "Portfolio Rebalancing Needed",
          description: "Your stock allocation is currently 65%, which exceeds your target of 60%. Consider rebalancing for better risk management.",
          impact: "medium",
          action: "Move ₦150,000 from stocks to treasury bills to maintain your desired asset allocation",
          priority: 3
        },
        {
          id: "4",
          type: "budget",
          title: "Transportation Efficiency",
          description: "You could save ₦6,500 monthly by optimizing your transportation choices. Uber rides account for 40% of transport costs.",
          impact: "high",
          action: "Consider using public transport 2-3 times per week or carpooling options",
          priority: 4
        }
      ];
      
      setInsights(newInsights.sort((a, b) => a.priority - b.priority));
      setIsGenerating(false);
    }, 2000);
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
                Analyzing...
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
          Personalized recommendations based on your financial behavior and goals
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
                Add more transactions and financial data to get personalized insights
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