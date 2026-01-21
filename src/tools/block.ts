import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { formatTaskStatus, getStatusIcon } from "../helpers";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_block tool for waiting on multiple tasks to complete
 * @param manager - BackgroundManager instance with getTask(), waitForTasks() methods
 * @returns Tool definition for background_block
 */
export function createBackgroundBlock(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  waitForTasks(taskIds: string[], timeoutMs: number): Promise<Map<string, BackgroundTask | null>>;
}): ToolDefinition {
  return tool({
    description: `Wait for specific background tasks to complete.

This tool blocks until all specified tasks complete OR the timeout is reached.
Use this when you need to wait for task results before proceeding.

Arguments:
- task_ids: Required array of task IDs to wait for
- timeout: Max wait time in ms (default: 60000, max: 600000)

Returns:
- Status summary of all specified tasks
- Completes immediately if all tasks are already done`,
    args: {
      task_ids: tool.schema.array(tool.schema.string()).nonoptional(),
      timeout: tool.schema.number().optional(),
    },
    async execute(args: { task_ids: string[]; timeout?: number }) {
      try {
        if (!args.task_ids || args.task_ids.length === 0) {
          return "Error: task_ids array is required and must not be empty";
        }

        const timeoutMs = Math.min(args.timeout ?? 60000, 600000);

        // Check which tasks exist and their current status
        const taskStatuses: Array<{ id: string; task: BackgroundTask | null; needsWait: boolean }> =
          [];

        for (const taskId of args.task_ids) {
          const task = manager.getTask(taskId);
          if (!task) {
            taskStatuses.push({ id: taskId, task: null, needsWait: false });
          } else if (
            task.status === "completed" ||
            task.status === "error" ||
            task.status === "cancelled"
          ) {
            taskStatuses.push({ id: taskId, task, needsWait: false });
          } else {
            taskStatuses.push({ id: taskId, task, needsWait: true });
          }
        }

        // Check if all tasks are already done
        const needsWait = taskStatuses.some((t) => t.needsWait);

        if (!needsWait) {
          return formatBlockResult(taskStatuses, false);
        }

        // Wait for tasks to complete
        const waitingTaskIds = taskStatuses.filter((t) => t.needsWait).map((t) => t.id);
        const results = await manager.waitForTasks(waitingTaskIds, timeoutMs);

        // Build final result with updated task states
        const finalStatuses: Array<{
          id: string;
          task: BackgroundTask | null;
          needsWait: boolean;
        }> = [];

        for (const taskId of args.task_ids) {
          const task = results.get(taskId) ?? manager.getTask(taskId);
          const isStillRunning = task?.status === "running" || task?.status === "resumed";
          finalStatuses.push({ id: taskId, task: task ?? null, needsWait: isStillRunning });
        }

        const timedOut = finalStatuses.some((t) => t.needsWait);
        return formatBlockResult(finalStatuses, timedOut);
      } catch (error) {
        return `Error waiting for tasks: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}

/**
 * Format the result of blocking on tasks
 */
function formatBlockResult(
  statuses: Array<{ id: string; task: BackgroundTask | null; needsWait: boolean }>,
  timedOut: boolean
): string {
  const lines: string[] = [];

  if (timedOut) {
    lines.push("# ⏱️ Block Timeout\n");
    lines.push("Some tasks did not complete within the timeout period.\n");
  } else {
    lines.push("# ✓ All Tasks Completed\n");
  }

  lines.push("| Task ID | Status | Description |");
  lines.push("|---------|--------|-------------|");

  for (const { id, task, needsWait } of statuses) {
    if (!task) {
      lines.push(`| \`${id}\` | ❓ Not found | - |`);
    } else {
      const icon = getStatusIcon(task.status);
      const status = needsWait
        ? `${icon} ${task.status} (still running)`
        : `${icon} ${task.status}`;
      lines.push(`| \`${id}\` | ${status} | ${task.description} |`);
    }
  }

  // Add details for completed tasks
  const completedTasks = statuses.filter(
    (s) => s.task && (s.task.status === "completed" || s.task.status === "error")
  );

  if (completedTasks.length > 0) {
    lines.push("\n## Task Details\n");
    for (const { task } of completedTasks) {
      if (task) {
        lines.push(`### ${task.id}\n`);
        lines.push(formatTaskStatus(task));
        lines.push("");
      }
    }
  }

  return lines.join("\n");
}
