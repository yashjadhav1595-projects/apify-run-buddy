import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActorSelector } from '@/components/apify/ActorSelector';
import { DynamicForm } from '@/components/apify/DynamicForm';
import { ResultDisplay } from '@/components/apify/ResultDisplay';
import { ErrorBanner } from '@/components/apify/ErrorBanner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, Play, Settings, BarChart3, Home } from 'lucide-react';
import { useApifyActors, useApifyRun } from '@/hooks/useApify';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { ApifyActor, ApifyRunResult, ExecutionMode } from '@/types/apify';

const ApifyApp = () => {
  console.log('🎯 ApifyApp component rendered');
  
  const [selectedActor, setSelectedActor] = useState<ApifyActor | null>(null);
  const [result, setResult] = useState<ApifyRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { toast } = useToast();
  
  // Use backend token - no frontend token needed
  const BACKEND_TOKEN = 'backend-handled';
  const { data: actors, isLoading: loadingActors, error: actorsError, refetch: refetchActors } = useApifyActors(BACKEND_TOKEN);
  const runMutation = useApifyRun();

  useEffect(() => {
    console.log('🔧 ApifyApp initializing...');
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (actorsError) {
      console.error('❌ Error loading actors:', actorsError);
      setError(`Failed to load actors: ${actorsError.message}`);
    }
  }, [actorsError]);

  useEffect(() => {
    if (actors) {
      console.log(`✅ Loaded ${actors.length} actors successfully`);
    }
  }, [actors]);

  const handleActorSelect = (actor: ApifyActor) => {
    console.log('🎭 Actor selected:', {
      id: actor.id,
      name: actor.name,
      title: actor.title,
      username: actor.username
    });
    setSelectedActor(actor);
    setResult(null);
    setError(null);
  };

  const handleFormSubmit = async (data: any, mode: ExecutionMode) => {
    if (!selectedActor) {
      console.error('❌ No actor selected for form submission');
      return;
    }

    console.log('🚀 Starting actor execution:', {
      actorId: selectedActor.id,
      actorName: selectedActor.name,
      mode,
      inputData: data,
      timestamp: new Date().toISOString()
    });

    try {
      const runResult = await runMutation.mutateAsync({
        token: BACKEND_TOKEN,
        actorId: selectedActor.id,
        input: data,
        mode
      });

      console.log('✅ Actor execution completed:', {
        runId: runResult.run.id,
        status: runResult.run.status,
        duration: runResult.run.stats?.durationMillis,
        resultType: mode,
        hasError: !!runResult.error
      });

      setResult(runResult);
      setError(null);
      
      toast({
        title: 'Actor executed successfully',
        description: `${selectedActor.name} completed in ${runResult.run.stats?.durationMillis ? Math.round(runResult.run.stats.durationMillis / 1000) : '?'}s`,
      });
    } catch (err: any) {
      console.error('❌ Actor execution failed:', {
        error: err.message,
        actorId: selectedActor.id,
        actorName: selectedActor.name,
        inputData: data,
        mode
      });
      
      setError(err.message || 'Failed to execute actor');
      setResult(null);
      
      toast({
        title: 'Execution failed',
        description: err.message || 'Failed to execute actor',
        variant: 'destructive',
      });
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting application state');
    setSelectedActor(null);
    setResult(null);
    setError(null);
  };

  const handleRetryActors = () => {
    console.log('🔄 Retrying actor fetch');
    setError(null);
    refetchActors();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">Apify Actor Runner</h1>
                <p className="text-sm text-muted-foreground">Professional Integration Demo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden md:flex">
                Backend Authenticated
              </Badge>
              {selectedActor && (
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Error Banner */}
          {error && (
            <ErrorBanner
              message={error}
              onDismiss={() => setError(null)}
              onRetry={actorsError ? handleRetryActors : undefined}
            />
          )}

          {/* Progress Indicator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Workflow Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <span className="text-sm font-medium">Select Actor</span>
                  {selectedActor && <Badge variant="default" className="text-xs">✓</Badge>}
                </div>
                
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    selectedActor ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <span className={`text-sm ${selectedActor ? 'font-medium' : 'text-muted-foreground'}`}>
                    Configure & Run
                  </span>
                  {result && <Badge variant="default" className="text-xs">✓</Badge>}
                </div>
                
                <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    result ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    3
                  </div>
                  <span className={`text-sm ${result ? 'font-medium' : 'text-muted-foreground'}`}>
                    View Results
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 1: Actor Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Step 1: Select Actor</h2>
            </div>
            
            {loadingActors ? (
              <Card>
                <CardHeader>
                  <CardTitle>Loading Actors...</CardTitle>
                </CardHeader>
                <CardContent>
                  <LoadingSpinner />
                </CardContent>
              </Card>
            ) : (
              <ActorSelector
                token={BACKEND_TOKEN}
                selectedActor={selectedActor || undefined}
                onActorSelect={handleActorSelect}
              />
            )}
          </div>

          {/* Step 2: Configuration and Execution */}
          {selectedActor && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Step 2: Configure & Execute</h2>
              </div>
              
              <DynamicForm
                token={BACKEND_TOKEN}
                actorId={selectedActor.id}
                actorName={selectedActor.title || selectedActor.name}
                onSubmit={handleFormSubmit}
                isSubmitting={runMutation.isPending}
              />
            </div>
          )}

          {/* Step 3: Results */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Step 3: Execution Results</h2>
              </div>
              
              <ResultDisplay result={result} />
              
              <div className="flex justify-center pt-4">
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Another Actor
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApifyApp;