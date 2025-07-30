import { useState } from 'react';
import { TokenInput } from '@/components/apify/TokenInput';
import { ActorSelector } from '@/components/apify/ActorSelector';
import { DynamicForm } from '@/components/apify/DynamicForm';
import { ResultDisplay } from '@/components/apify/ResultDisplay';
import { ErrorBanner } from '@/components/apify/ErrorBanner';
import { Button } from '@/components/ui/button';
import { RotateCcw, Bot } from 'lucide-react';
import { useApifyRun } from '@/hooks/useApify';
import { useToast } from '@/hooks/use-toast';
import type { ApifyActor, ApifyRunResult, ExecutionMode } from '@/types/apify';

export default function ApifyRunner() {
  const [token, setToken] = useState<string>('');
  const [selectedActor, setSelectedActor] = useState<ApifyActor | undefined>();
  const [result, setResult] = useState<ApifyRunResult | undefined>();
  const [error, setError] = useState<string>('');
  
  const runActor = useApifyRun();
  const { toast } = useToast();

  const handleTokenValidated = (validToken: string) => {
    setToken(validToken);
    setError('');
  };

  const handleActorSelect = (actor: ApifyActor) => {
    setSelectedActor(actor);
    setResult(undefined);
    setError('');
  };

  const handleFormSubmit = async (data: any, mode: ExecutionMode) => {
    if (!token || !selectedActor) return;

    setError('');
    setResult(undefined);

    try {
      const runResult = await runActor.mutateAsync({
        token,
        actorId: selectedActor.id,
        input: data,
        mode
      });

      setResult(runResult);
      
      if (runResult.run.status === 'SUCCEEDED') {
        toast({
          title: 'Actor executed successfully',
          description: `${selectedActor.title || selectedActor.name} completed successfully.`,
        });
      } else if (runResult.run.status === 'FAILED') {
        toast({
          title: 'Actor execution failed',
          description: runResult.error || 'The actor run failed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Execution failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    setToken('');
    setSelectedActor(undefined);
    setResult(undefined);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bot className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Apify Actor Runner</h1>
              <p className="text-muted-foreground">
                Execute any Apify actor with custom input parameters
              </p>
            </div>
          </div>
          {token && (
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6">
            <ErrorBanner 
              message={error} 
              onDismiss={() => setError('')}
              onRetry={() => setError('')}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Step 1: Token Input */}
          {!token && (
            <div className="flex justify-center">
              <TokenInput onTokenValidated={handleTokenValidated} />
            </div>
          )}

          {/* Step 2: Actor Selection */}
          {token && !selectedActor && (
            <div className="max-w-2xl mx-auto">
              <ActorSelector 
                token={token} 
                selectedActor={selectedActor}
                onActorSelect={handleActorSelect} 
              />
            </div>
          )}

          {/* Step 3: Configuration Form */}
          {token && selectedActor && !result && (
            <div className="max-w-2xl mx-auto">
              <DynamicForm
                token={token}
                actorId={selectedActor.id}
                actorName={selectedActor.title || selectedActor.name}
                onSubmit={handleFormSubmit}
                isSubmitting={runActor.isPending}
              />
            </div>
          )}

          {/* Step 4: Results */}
          {result && (
            <div className="max-w-4xl mx-auto space-y-4">
              <ResultDisplay result={result} />
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setResult(undefined);
                    setError('');
                  }}
                >
                  Run Another Actor
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}