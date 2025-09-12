import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  showResourceWarning?: boolean;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Loading...", 
  showResourceWarning = false 
}) => {
  return (
    <Card className="card-clean">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-center">{message}</p>
        {showResourceWarning && (
          <p className="text-xs text-warning mt-2 text-center max-w-sm">
            If loading takes too long, try refreshing the page or closing other browser tabs.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadingFallback;