import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ActorSelector } from '@/components/apify/ActorSelector';
import { DynamicForm } from '@/components/apify/DynamicForm';
import { ResultDisplay } from '@/components/apify/ResultDisplay';
import { ErrorBanner } from '@/components/apify/ErrorBanner';
import { TokenInput } from '@/components/apify/TokenInput';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw, Play, Settings, BarChart3, Home, LogOut, Search, Download, Copy, History, Star, Filter, Clock, User } from 'lucide-react';
import { useApifyToken, useApifyActors, useApifyRun } from '@/hooks/useApify';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import type { ApifyActor, ApifyRunResult, ExecutionMode } from '@/types/apify';

const ApifyApp = () => {
  console.log('🎯 ApifyApp component rendered - Enhanced v3.0');
  
  const [selectedActor, setSelectedActor] = useState<ApifyActor | null>(null);
  const [result, setResult] = useState<ApifyRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [runHistory, setRunHistory] = useState<Array<{
    id: string;
    actorName: string;
    timestamp: string;
    duration: number;
    status: string;
  }>>([]);
  const [favoriteActors, setFavoriteActors] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();
  
  // Token management
  const { 
    token, 
    validateToken, 
    user, 
    isValidating, 
    validationError,
    clearToken 
  } = useApifyToken();
  
  const { data: actors, isLoading: loadingActors, error: actorsError, refetch: refetchActors } = useApifyActors(token);
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

  const handleTokenSubmit = (apiToken: string) => {
    console.log('🔑 Token submitted for validation');
    validateToken.mutate(apiToken);
  };

  const handleLogout = () => {
    console.log('🚪 Logging out user');
    clearToken();
    handleReset();
  };

  // Enhanced functionality handlers
  const handleToggleFavorite = (actorId: string) => {
    console.log('⭐ Toggling favorite for actor:', actorId);
    setFavoriteActors(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(actorId)) {
        newFavorites.delete(actorId);
      } else {
        newFavorites.add(actorId);
      }
      return newFavorites;
    });
  };

  const handleExportResult = () => {
    if (!result) return;
    
    console.log('📁 Exporting result data');
    const dataStr = JSON.stringify(result, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `apify-result-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: 'Result exported',
      description: 'JSON file downloaded successfully',
    });
  };

  const handleCopyResult = async () => {
    if (!result) return;
    
    console.log('📋 Copying result to clipboard');
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      toast({
        title: 'Copied to clipboard',
        description: 'Result data copied successfully',
      });
    } catch (err) {
      console.error('❌ Failed to copy to clipboard:', err);
      toast({
        title: 'Copy failed',
        description: 'Unable to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const filteredActors = actors?.filter(actor => {
    const matchesSearch = !searchTerm || 
      actor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actor.username?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  }) || [];

  const handleFormSubmit = async (data: any, mode: ExecutionMode) => {
    if (!selectedActor) {
      console.error('❌ No actor selected for form submission');
      return;
    }

    const startTime = Date.now();
    console.log('🚀 Starting actor execution:', {
      actorId: selectedActor.id,
      actorName: selectedActor.name,
      mode,
      inputData: data,
      timestamp: new Date().toISOString()
    });

    try {
      const runResult = await runMutation.mutateAsync({
        token: token,
        actorId: selectedActor.id,
        input: data,
        mode
      });

      const duration = Date.now() - startTime;
      console.log('✅ Actor execution completed:', {
        runId: runResult.run.id,
        status: runResult.run.status,
        duration: runResult.run.stats?.durationMillis || duration,
        resultType: mode,
        hasError: !!runResult.error
      });

      // Add to run history
      setRunHistory(prev => [{
        id: runResult.run.id,
        actorName: selectedActor.title || selectedActor.name,
        timestamp: new Date().toISOString(),
        duration: runResult.run.stats?.durationMillis || duration,
        status: runResult.run.status
      }, ...prev.slice(0, 9)]); // Keep last 10 runs

      setResult(runResult);
      setError(null);
      
      toast({
        title: 'Actor executed successfully',
        description: `${selectedActor.name} completed in ${runResult.run.stats?.durationMillis ? Math.round(runResult.run.stats.durationMillis / 1000) : Math.round(duration / 1000)}s`,
      });
    } catch (err: any) {
      const duration = Date.now() - startTime;
      console.error('❌ Actor execution failed:', {
        error: err.message,
        actorId: selectedActor.id,
        actorName: selectedActor.name,
        inputData: data,
        mode,
        duration
      });
      
      // Add failed run to history
      setRunHistory(prev => [{
        id: `failed-${Date.now()}`,
        actorName: selectedActor.title || selectedActor.name,
        timestamp: new Date().toISOString(),
        duration,
        status: 'FAILED'
      }, ...prev.slice(0, 9)]);
      
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

  // Show token input if no token is available
  if (!token) {
    return (
      <TokenInput
        onTokenSubmit={handleTokenSubmit}
        isValidating={isValidating}
        validationError={validationError}
      />
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
              {user && (
                <Badge variant="secondary" className="hidden md:flex">
                  <User className="h-3 w-3 mr-1" />
                  {user.username}
                </Badge>
              )}
              {runHistory.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  <History className="h-4 w-4 mr-2" />
                  History ({runHistory.length})
                </Button>
              )}
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
          {/* Run History Panel */}
          {showFilters && runHistory.length > 0 && (
            <Card className="animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Run History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {runHistory.map((run, index) => (
                    <div key={run.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={run.status === 'SUCCEEDED' ? 'default' : run.status === 'FAILED' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {run.status}
                        </Badge>
                        <span className="text-sm font-medium">{run.actorName}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(run.duration / 1000)}s
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(run.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Step 1: Select Actor</h2>
              </div>
              
              {actors && actors.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  {filteredActors.length} of {actors.length} actors
                </Badge>
              )}
            </div>
            
            {/* Actor Search */}
            {actors && actors.length > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search actors by name, title, or username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
            
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
                token={token}
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
                token={token}
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Step 3: Execution Results</h2>
                </div>
                
                {/* Export Actions */}
                <div className="flex items-center gap-2">
                  <Button onClick={handleCopyResult} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                  <Button onClick={handleExportResult} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export JSON
                  </Button>
                </div>
              </div>
              
              <ResultDisplay result={result} />
              
              <div className="flex justify-center gap-4 pt-4">
                <Button onClick={handleReset} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Another Actor
                </Button>
                <Button onClick={handleCopyResult} variant="ghost">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Result
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