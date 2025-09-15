import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Settings, Info } from 'lucide-react';
import { gdprManager } from '@/lib/gdpr-compliance';

const GDPRConsentBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState(gdprManager.getConsentStatus());

  useEffect(() => {
    setShowBanner(gdprManager.shouldShowConsentBanner());
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      essential: true,
      analytics: true,
      marketing: false,
      personalization: true
    };
    setConsent(fullConsent);
    gdprManager.updateConsent(fullConsent);
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    const essentialConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      personalization: false
    };
    setConsent(essentialConsent);
    gdprManager.updateConsent(essentialConsent);
    setShowBanner(false);
  };

  const handleCustomConsent = () => {
    gdprManager.updateConsent(consent);
    setShowBanner(false);
    setShowSettings(false);
  };

  const updateConsentSetting = (key: string, value: boolean) => {
    setConsent(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-2">
                We respect your privacy
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                We use cookies and similar technologies to provide essential functionality, 
                analyze usage, and improve your experience. You can customize your preferences below.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAcceptAll} className="bg-primary">
                  Accept All
                </Button>
                <Button variant="outline" onClick={handleAcceptEssential}>
                  Essential Only
                </Button>
                
                <Dialog open={showSettings} onOpenChange={setShowSettings}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Settings className="w-4 h-4" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Privacy Preferences
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Essential Cookies</Label>
                            <p className="text-xs text-muted-foreground">
                              Required for basic functionality
                            </p>
                          </div>
                          <Switch checked={true} disabled />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Analytics</Label>
                            <p className="text-xs text-muted-foreground">
                              Help us improve the app
                            </p>
                          </div>
                          <Switch 
                            checked={consent.analytics}
                            onCheckedChange={(checked) => updateConsentSetting('analytics', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="font-medium">Personalization</Label>
                            <p className="text-xs text-muted-foreground">
                              Personalized insights and recommendations
                            </p>
                          </div>
                          <Switch 
                            checked={consent.personalization}
                            onCheckedChange={(checked) => updateConsentSetting('personalization', checked)}
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button onClick={handleCustomConsent} className="flex-1">
                          Save Preferences
                        </Button>
                        <Button variant="outline" onClick={() => setShowSettings(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Button variant="ghost" size="sm" className="gap-1">
                  <Info className="w-3 h-3" />
                  Learn More
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GDPRConsentBanner;