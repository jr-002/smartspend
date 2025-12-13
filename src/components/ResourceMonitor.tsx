import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Zap } from 'lucide-react';
import { resourceMonitor } from '@/lib/resource-monitor';

const ResourceMonitor: React.FC = () => {
  const [resourceStatus, setResourceStatus] = useState(resourceMonitor.getResourceStatus());
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = resourceMonitor.getResourceStatus();
      setResourceStatus(status);

      // Show warning only if resources are critically low
      const memoryUsage = status.memoryUsage?.used || 0;
      const isHighMemory = memoryUsage > 350; // 350MB threshold - very high
      const isHighRequestRate = status.recentRequests > 200; // 200+ requests is excessive

      setShowWarning(isHighMemory || isHighRequestRate || !status.canMakeRequest);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleCleanup = () => {
    resourceMonitor.cleanup();
    setShowWarning(false);
    // Force a small delay to let cleanup complete
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  if (!showWarning) {
    return null;
  }

  return (
    <Alert className="border-warning bg-warning/10 mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium">System Resources Low</p>
          <p className="text-sm text-muted-foreground">
            {resourceStatus.memoryUsage && (
              <>Memory: {resourceStatus.memoryUsage.used}MB used. </>
            )}
            {resourceStatus.recentRequests > 20 && (
              <>High request rate detected. </>
            )}
            Consider closing other tabs or refreshing the page.
          </p>
        </div>
        <div className="flex gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCleanup}
            className="gap-2"
          >
            <Zap className="w-4 h-4" />
            Optimize
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ResourceMonitor;