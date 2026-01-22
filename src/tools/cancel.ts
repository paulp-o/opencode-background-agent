import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { shortId } from "../helpers";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOOL_DESCRIPTIONS } from "../prompts";
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
    description: TOOL_DESCRIPTIONS.backgroundCancel,
    args: {
      task_id: tool.schema.string(),
      // .describe("Task ID to cancel"),
    },
    async execute(args: { task_id: string }) {
      try {
        // Resolve short ID or prefix to full ID
        const resolvedId = manager.resolveTaskId(args.task_id);
        if (!resolvedId) {
          return ERROR_MESSAGES.taskNotFound(args.task_id);
        }

        const task = manager.getTask(resolvedId);
        if (!task) {
          return ERROR_MESSAGES.taskNotFound(args.task_id);
        }

        await manager.cancelTask(resolvedId);

        return SUCCESS_MESSAGES.taskCancelled(shortId(task.sessionID), task.description);
      } catch (error) {
        return ERROR_MESSAGES.cancelFailed(error instanceof Error ? error.message : String(error));
      }
    },
  });
}
