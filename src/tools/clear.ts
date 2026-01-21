import { type ToolDefinition, tool } from "@opencode-ai/plugin";

// =============================================================================
// Background Clear Tool Factory
// =============================================================================

export function createBackgroundClear(manager: {
  getAllTasks(): { status: string }[];
  clearAllTasks(): void;
}): ToolDefinition {
  return tool({
    description: `Clear and abort all background tasks immediately.

Use this to stop all running background agents and clear the task list.
This is useful when you want to start fresh or cancel all pending work.`,
    args: {},
    async execute() {
      try {
        const tasks = manager.getAllTasks();
        const runningCount = tasks.filter((t) => t.status === "running").length;
        const totalCount = tasks.length;

        manager.clearAllTasks();

        if (totalCount === 0) {
          return `No background tasks to clear.`;
        }

        return `✓ **Cleared all background tasks**

Running tasks aborted: ${runningCount}
Total tasks cleared: ${totalCount}`;
      } catch (error) {
        return `Error clearing tasks: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
