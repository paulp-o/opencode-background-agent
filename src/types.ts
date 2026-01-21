import type { PluginInput } from "@opencode-ai/plugin";

// =============================================================================
// Types
// =============================================================================

export type BackgroundTaskStatus = "running" | "completed" | "error" | "cancelled" | "resumed";

export interface TaskProgress {
  toolCalls: number;
  lastTools: string[];
  lastUpdate: string;
}

export interface BackgroundTask {
  id: string;
  sessionID: string;
  parentSessionID: string;
  parentMessageID: string;
  parentAgent: string;
  description: string;
  prompt: string;
  agent: string;
  status: BackgroundTaskStatus;
  startedAt: string;
  completedAt?: string;
  resultRetrievedAt?: string;
  result?: string;
  error?: string;
  progress?: TaskProgress;
  batchId: string;
  resumeCount: number;
}

export interface LaunchInput {
  description: string;
  prompt: string;
  agent: string;
  parentSessionID: string;
  parentMessageID: string;
  parentAgent: string;
}

export type OpencodeClient = PluginInput["client"];
