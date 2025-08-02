import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface TokenInputProps {
  onTokenSubmit: (token: string) => void;
  isValidating: boolean;
  validationError?: string;
}

export const TokenInput = ({ onTokenSubmit, isValidating, validationError }: TokenInputProps) => {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      console.log('🔑 Submitting token for validation...');
      onTokenSubmit(token.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            <CardTitle className="text-2xl">Apify API Key</CardTitle>
          </div>
          <CardDescription>
            Enter your Apify API key to access and run your actors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">API Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="apify_api_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isValidating}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowToken(!showToken)}
                  disabled={isValidating}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {validationError && (
              <div className="text-sm text-destructive">
                {validationError}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={!token.trim() || isValidating}
            >
              {isValidating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Validating Token...
                </>
              ) : (
                'Connect to Apify'
              )}
            </Button>
          </form>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>Don't have an API key?</p>
            <a 
              href="https://console.apify.com/account/integrations" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Get your API key from Apify Console →
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};