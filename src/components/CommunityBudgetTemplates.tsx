import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Rocket, Bell, Share, Download, Heart } from "lucide-react";

const CommunityBudgetTemplates = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Community Budget Templates</h2>
        <p className="text-muted-foreground">
          Coming Soon - Share and discover budget templates
        </p>
      </div>

      <Card className="shadow-card bg-gradient-card border-0">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-glow">
            <Users className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Community Features Coming Soon!
          </CardTitle>
          <p className="text-muted-foreground">
            We're building an amazing community platform for budget sharing
          </p>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="p-6 bg-muted/30 rounded-lg">
              <Rocket className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Building Something Special!</h3>
              <p className="text-sm text-muted-foreground">
                Our community platform is under development. Soon you'll be able to:
              </p>
            </div>
            
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Share className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Share your budget templates with others</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Download community-created templates</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Heart className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Rate and review budget templates</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">Connect with other users and share tips</span>
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

export default CommunityBudgetTemplates;