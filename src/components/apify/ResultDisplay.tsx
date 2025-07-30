import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, XCircle, Clock, Download, Copy, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ApifyRunResult } from '@/types/apify';

interface ResultDisplayProps {
  result: ApifyRunResult;
}

export const ResultDisplay = ({ result }: ResultDisplayProps) => {
  const [activeTab, setActiveTab] = useState('result');
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'RUNNING':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SUCCEEDED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'RUNNING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Result data has been copied to your clipboard.',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const downloadJson = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDuration = (durationMs?: number) => {
    if (!durationMs) return 'N/A';
    const seconds = Math.round(durationMs / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(result.run.status)}
            Execution Results
          </CardTitle>
          <Badge variant={getStatusVariant(result.run.status)}>
            {result.run.status}
          </Badge>
        </div>
        <CardDescription>
          Run ID: {result.run.id}
          {result.run.finishedAt && (
            <span className="ml-4">
              Duration: {formatDuration(result.run.stats?.durationMillis)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="result">Result</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="result" className="space-y-4">
            {result.error ? (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Error</h4>
                <p className="text-sm">{result.error}</p>
              </div>
            ) : result.message ? (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{result.message}</p>
              </div>
            ) : result.result ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(result.result, null, 2))}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadJson(result.result, `actor-result-${result.run.id}.json`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <ScrollArea className="h-96 w-full rounded-md border p-4">
                  <pre className="text-sm">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No result data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            {result.run.stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(result.run.stats.durationMillis)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Runtime:</span>
                      <span>{result.run.stats.runTimeSecs || 0}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Compute Units:</span>
                      <span>{result.run.stats.computeUnits || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Memory Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span>{formatBytes(result.run.stats.memCurrentBytes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average:</span>
                      <span>{formatBytes(result.run.stats.memAvgBytes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak:</span>
                      <span>{formatBytes(result.run.stats.memMaxBytes)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">CPU Usage</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current:</span>
                      <span>{(result.run.stats.cpuCurrentUsage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average:</span>
                      <span>{(result.run.stats.cpuAvgUsage || 0).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peak:</span>
                      <span>{(result.run.stats.cpuMaxUsage || 0).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Network</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Received:</span>
                      <span>{formatBytes(result.run.stats.netRxBytes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transmitted:</span>
                      <span>{formatBytes(result.run.stats.netTxBytes)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No statistics available
              </div>
            )}
          </TabsContent>

          <TabsContent value="raw" className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadJson(result, `actor-raw-${result.run.id}.json`)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
            <ScrollArea className="h-96 w-full rounded-md border p-4">
              <pre className="text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};