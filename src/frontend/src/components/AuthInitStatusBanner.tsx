import { useAuthInit } from '../hooks/useAuthInit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, RotateCw } from 'lucide-react';

export default function AuthInitStatusBanner() {
  const { initStatus, initError, retryInitialization } = useAuthInit();

  // Only show banner during initialization or on error/timeout
  if (initStatus === 'success') {
    return null;
  }

  if (initStatus === 'initializing') {
    return (
      <Card className="border-primary/50 bg-primary/5 mb-6">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Initializing authentication...</p>
        </CardContent>
      </Card>
    );
  }

  // Error or timeout state
  return (
    <Card className="border-destructive/50 bg-destructive/5 mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div className="flex-1">
            <CardTitle className="text-base">Authentication Initialization Failed</CardTitle>
            <CardDescription className="mt-1">
              {initStatus === 'timeout'
                ? 'The authentication system took too long to respond. This might be due to a slow connection or network issue.'
                : initError?.message || 'An error occurred while initializing the authentication system.'}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2 pt-0">
        <Button
          onClick={retryInitialization}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RotateCw className="h-4 w-4" />
          Retry
        </Button>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Page
        </Button>
      </CardContent>
    </Card>
  );
}
