import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { shortId } from "../helpers";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_cancel tool for cancelling running tasks
 * @param manager - BackgroundManager instance with getTask(), cancelTask(), resolveTaskId() methods
 * @returns Tool definition for background_cancel
 */
export function createBackgroundCancel(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  resolveTaskId(idOrPrefix: string): string | null;
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
        // Resolve short ID or prefix to full ID
        const resolvedId = manager.resolveTaskId(args.task_id);
        if (!resolvedId) {
          return `Task not found: ${args.task_id}`;
        }

        const task = manager.getTask(resolvedId);
        if (!task) {
          return `Task not found: ${args.task_id}`;
        }

        await manager.cancelTask(resolvedId);

        return `⊘ **Task cancelled**

Task ID: \`${shortId(task.sessionID)}\`
Description: ${task.description}
Status: ⊘ cancelled`;
      } catch (error) {
        return `Error cancelling task: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
