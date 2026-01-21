import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { formatTaskResult, formatTaskStatus } from "../helpers";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_output tool for retrieving task status and results (non-blocking)
 * @param manager - BackgroundManager instance with getTask(), checkAndUpdateTaskStatus() methods
 * @returns Tool definition for background_output
 */
export function createBackgroundOutput(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  checkAndUpdateTaskStatus(
    task: BackgroundTask,
    skipNotification?: boolean
  ): Promise<BackgroundTask>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTaskMessages(sessionID: string): Promise<any[]>;
}): ToolDefinition {
  return tool({
    description: `Get output from a background task.

Arguments:
- task_id: Required task ID to get output from

Returns:
- Current status and result (if completed) immediately (non-blocking)

Note: This tool returns immediately. Use \`background_block\` if you need to wait for task completion.`,
    args: {
      task_id: tool.schema.string().nonoptional(),
    },
    async execute(args: { task_id: string }) {
      try {
        let task = manager.getTask(args.task_id);
        if (!task) {
          return `Task not found: ${args.task_id}`;
        }

        // Update task status (may detect completion via fallback mechanisms)
        task = await manager.checkAndUpdateTaskStatus(task, false);

        if (task.status === "completed") {
          if (!task.resultRetrievedAt) {
            task.resultRetrievedAt = new Date().toISOString();
          }
          return await formatTaskResult(task, (sessionID: string) =>
            manager.getTaskMessages(sessionID)
          );
        }

        if (task.status === "error" || task.status === "cancelled") {
          if (!task.resultRetrievedAt) {
            task.resultRetrievedAt = new Date().toISOString();
          }
          return formatTaskStatus(task);
        }

        // Task is still running or resumed - return current status
        return formatTaskStatus(task);
      } catch (error) {
        return `Error getting output: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
