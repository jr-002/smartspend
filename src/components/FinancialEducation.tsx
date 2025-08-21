import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Rocket, Bell } from "lucide-react";

const FinancialEducation = () => {
  return (
    <div className="space-y-6">
      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Financial Education Center
          </CardTitle>
          <p className="text-muted-foreground">
            Coming Soon - Interactive courses and learning resources
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-6 bg-muted/30 rounded-lg">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">We're Building Something Amazing!</h3>
              <p className="text-sm text-muted-foreground">
                Our financial education platform is under development. Soon you'll have access to:
              </p>
            </div>
            
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Interactive courses on budgeting & investing</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Financial articles and guides</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Knowledge quizzes and certifications</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-muted-foreground">Personalized learning paths</span>
              </div>
            </div>
            
            <Button className="bg-gradient-primary gap-2">
              <Bell className="w-4 h-4" />
              Notify Me When Ready
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialEducation;