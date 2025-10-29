import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useErrorHandling';

export function NetworkStatusIndicator() {
  const { isOnline, wasOffline } = useNetworkStatus();

  if (isOnline && !wasOffline) {
    return null; // Don't show anything when online and always was
  }

  if (!isOnline) {
    return (
      <Alert variant="destructive" className="fixed top-4 left-4 right-4 z-50">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>You're currently offline. Some features may not work properly.</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="ml-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (wasOffline) {
    return (
      <Alert className="fixed top-4 left-4 right-4 z-50 bg-green-50 border-green-200">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          Connection restored! You're back online.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
