import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, Loader2, User } from 'lucide-react';
import { useApifyToken } from '@/hooks/useApify';

interface TokenInputProps {
  onTokenValidated: (token: string) => void;
}

export const TokenInput = ({ onTokenValidated }: TokenInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const { validateToken, user, isValidating, validationError } = useApifyToken();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      validateToken.mutate(inputValue.trim(), {
        onSuccess: () => {
          onTokenValidated(inputValue.trim());
        }
      });
    }
  };

  if (user) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Connected to Apify
          </CardTitle>
          <CardDescription>
            Logged in as {user.username} ({user.email})
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Apify API Token
        </CardTitle>
        <CardDescription>
          Enter your Apify API token to get started. You can find it in your Apify console under API settings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">API Token</Label>
            <Input
              id="token"
              type="password"
              placeholder="Enter your Apify API token"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isValidating}
            />
          </div>
          
          {validationError && (
            <div className="text-sm text-destructive">
              {validationError}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!inputValue.trim() || isValidating}
          >
            {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Validate Token
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};