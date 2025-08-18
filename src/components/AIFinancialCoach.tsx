import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Sparkles, Mic, MicOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/currencies";
import { generateFinancialAdvice } from "@/lib/api";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIFinancialCoach = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI Financial Coach. I can help you with budgeting, savings advice, spending analysis, and financial planning. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { profile } = useAuth();

  const currency = profile?.currency || 'USD';
  const quickQuestions = [
    "Can I afford this purchase?",
    "Why am I overspending this month?",
    `How can I save ${formatCurrency(50000, currency)} in 3 months?`,
    "What's my spending pattern?",
    "Should I invest or save more?",
    "How to reduce my expenses?"
  ];

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Rate limiting check
    const lastMessage = localStorage.getItem('lastCoachMessage');
    const now = Date.now();
    if (lastMessage && now - parseInt(lastMessage) < 3000) {
      toast({
        title: "Please wait",
        description: "Please wait a moment before sending another message.",
        variant: "destructive",
      });
      return;
    }
    localStorage.setItem('lastCoachMessage', now.toString());

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const aiResponse = await generateFinancialAdvice(inputMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to local response
      const fallbackResponse = generateAIResponse(inputMessage);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('afford') || lowerQuestion.includes('purchase')) {
      return `To help you determine if you can afford this purchase, I need to know:
      
1. What's the item and its cost?
2. Your current available balance
3. Your upcoming expenses this month

Based on your profile, you have a monthly income of ${formatCurrency(profile?.monthly_income || 0, profile?.currency || 'USD')}. 

💡 **Smart Tip**: Follow the 50/30/20 rule - only spend from your 30% "wants" budget for non-essential purchases.`;
    }
    
    if (lowerQuestion.includes('overspend') || lowerQuestion.includes('spending')) {
      return `Let me analyze your spending patterns:

🔍 **Common overspending triggers:**
- Impulse purchases (especially online shopping)
- Eating out frequently instead of cooking
- Subscription services you forgot about
- Emergency expenses without an emergency fund

📊 **Quick fixes:**
1. Set up spending alerts at 80% of your budget
2. Use the 24-hour rule for non-essential purchases
3. Track every expense for one week to identify patterns

Would you like me to help you create a personalized spending plan?`;
    }
    
    if (lowerQuestion.includes('save') && (lowerQuestion.includes('50000') || lowerQuestion.includes('50,000'))) {
      const target = 50000;
      const monthly = Math.ceil(target / 3);
      const weekly = Math.ceil(target / 13);
      const daily = Math.ceil(target / 90);
      return `Great goal! Here's your ${formatCurrency(target, currency)} savings plan for 3 months:

💰 **Monthly target**: ${formatCurrency(monthly, currency)}
📅 **Weekly target**: ${formatCurrency(weekly, currency)}
🎯 **Daily target**: ${formatCurrency(daily, currency)}

**Smart Savings Strategy:**
1. **Automate**: Set up automatic transfers on payday
2. **Side hustle**: Consider freelancing or selling skills
3. **Cut expenses**: Reduce dining out by 50%
4. **Challenge yourself**: Try a "no-spend weekend" monthly

🏆 **Pro tip**: Start with ${formatCurrency(500, currency)}/day and increase gradually. Small consistent amounts beat large irregular ones!

Want me to create a detailed weekly action plan?`;
    }
    
    if (lowerQuestion.includes('pattern') || lowerQuestion.includes('analysis')) {
      return `Based on typical spending patterns, here's what I observe:

📈 **Your likely spending trends:**
- Highest spending: First week after payday
- Peak categories: Food, transportation, entertainment
- Danger zones: Weekends and month-end

🎯 **Optimization opportunities:**
1. **Meal prep Sundays** - Save 40% on food costs
2. **Transport bundling** - Buy weekly/monthly passes
3. **Entertainment budget** - Set a fixed weekly limit

📊 **Next steps:**
- Track expenses for 2 weeks for personalized insights
- Set category-specific budgets
- Enable spending alerts

Would you like me to help set up your personalized budget categories?`;
    }
    
    return `That's a great question! Here are some personalized insights:

💡 **Based on your profile:**
- Monthly income: ${formatCurrency(profile?.monthly_income || 0, profile?.currency || 'USD')}
- Currency: ${profile?.currency || 'USD'}

🎯 **My recommendations:**
1. **Emergency fund**: Aim for 3-6 months of expenses
2. **Savings rate**: Target 20% of income minimum
3. **Investment**: Start small with index funds or savings apps

📱 **Quick actions you can take:**
- Set up automatic savings transfers
- Use the 50/30/20 budgeting rule
- Track expenses daily for better awareness

What specific area would you like me to dive deeper into?`;
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const toggleVoiceInput = () => {
    if (!isListening) {
      // Start voice recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
        
        recognition.start();
      }
    } else {
      setIsListening(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary" />
            AI Financial Coach
            <Badge className="bg-gradient-primary text-primary-foreground">
              <Sparkles className="w-3 h-3 mr-1" />
              Beta
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Get personalized financial advice powered by AI. Ask me anything about budgeting, saving, or spending!
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Questions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Quick Questions:</h3>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickQuestion(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-[400px] w-full border rounded-lg p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}>
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-muted text-foreground rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask me anything about your finances..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="pr-12"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={`absolute right-1 top-1 h-8 w-8 p-0 ${isListening ? 'text-destructive' : 'text-muted-foreground'}`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="bg-gradient-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            💡 Tip: Try voice input by clicking the microphone icon, or ask in Pidgin English!
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFinancialCoach;