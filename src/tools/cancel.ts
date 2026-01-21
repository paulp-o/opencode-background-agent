import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_cancel tool for cancelling running tasks
 * @param manager - BackgroundManager instance with getTask(), cancelTask() methods
 * @returns Tool definition for background_cancel
 */
export function createBackgroundCancel(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  cancelTask(taskId: string): Promise<void>;
}): ToolDefinition {
  return tool({
    description: `Cancel a running background task.

Only works for tasks with status "running". Aborts the background session and marks the task as cancelled.

Arguments:
- task_id: Required task ID to cancel.`,
    args: {
      task_id: tool.schema.string(),
      // .describe("Task ID to cancel"),
    },
    async execute(args: { task_id: string }) {
      try {
        const task = manager.getTask(args.task_id);
        if (!task) {
          return `Task not found: ${args.task_id}`;
        }

        await manager.cancelTask(args.task_id);

        return `⊘ **Task cancelled**

Task ID: \`${task.id}\`
Description: ${task.description}
Session ID: \`${task.sessionID}\`
Status: ⊘ cancelled`;
      } catch (error) {
        return `Error cancelling task: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
