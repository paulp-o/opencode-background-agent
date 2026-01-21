import type { Hooks, PluginInput } from "@opencode-ai/plugin";
import { BackgroundManager } from "./manager";
import {
  createBackgroundCancel,
  createBackgroundClear,
  createBackgroundList,
  createBackgroundOutput,
  createBackgroundResume,
  createBackgroundTask,
} from "./tools";

// Re-export types for consumers
export type { BackgroundTask, BackgroundTaskStatus, TaskProgress, LaunchInput } from "./types";
// Note: BackgroundManager is not exported to avoid OpenCode plugin loader issues
// (it tries to call all exports as functions, which fails for classes)

/**
 * OpenCode Background Agent Plugin
 *
 * Provides tools for launching and managing asynchronous background tasks
 * that run in separate sessions while the main conversation continues.
 */
export default async function plugin(ctx: PluginInput): Promise<Hooks> {
  const manager = new BackgroundManager(ctx);

  return {
    tool: {
      background_task: createBackgroundTask(manager),
      background_output: createBackgroundOutput(manager),
      background_cancel: createBackgroundCancel(manager),
      background_resume: createBackgroundResume(manager),
      background_list: createBackgroundList(manager),
      background_clear: createBackgroundClear(manager),
    },
    event: async () => {
      // Event handling is started in the manager constructor
    },
  };
}
