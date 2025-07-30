export interface ApifyUser {
  id: string;
  username: string;
  email: string;
}

export interface ApifyActor {
  id: string;
  name: string;
  title: string;
  description?: string;
  username: string;
}

export interface ApifySchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  title?: string;
  description?: string;
}

export interface ApifyRun {
  id: string;
  status: 'READY' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'TIMED-OUT' | 'ABORTED';
  startedAt: string;
  finishedAt?: string;
  stats?: {
    inputBodyLen?: number;
    restartCount?: number;
    resurrectCount?: number;
    memAvgBytes?: number;
    memMaxBytes?: number;
    memCurrentBytes?: number;
    cpuAvgUsage?: number;
    cpuMaxUsage?: number;
    cpuCurrentUsage?: number;
    netRxBytes?: number;
    netTxBytes?: number;
    durationMillis?: number;
    runTimeSecs?: number;
    metamorph?: number;
    computeUnits?: number;
  };
}

export interface ApifyRunResult {
  run: ApifyRun;
  result?: any;
  error?: string;
  message?: string;
}

export type ExecutionMode = 'OUTPUT' | 'DATASET';