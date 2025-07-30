import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'default' | 'destructive';
}

export const ErrorBanner = ({ 
  title = 'Error', 
  message, 
  onDismiss, 
  onRetry, 
  variant = 'destructive' 
}: ErrorBannerProps) => {
  return (
    <Alert variant={variant} className="relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="pr-8">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {message}
        {onRetry && (
          <div className="mt-3">
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}
      </AlertDescription>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-2 h-8 w-8 p-0"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </Alert>
  );
};