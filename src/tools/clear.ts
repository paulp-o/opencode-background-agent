import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOOL_DESCRIPTIONS } from "../prompts";

// =============================================================================
// Background Clear Tool Factory
// =============================================================================

export function createBackgroundClear(manager: {
  getAllTasks(): { status: string }[];
  clearAllTasks(): void;
}): ToolDefinition {
  return tool({
    description: TOOL_DESCRIPTIONS.backgroundClear,
    args: {},
    async execute() {
      try {
        const tasks = manager.getAllTasks();
        const runningCount = tasks.filter((t) => t.status === "running").length;
        const totalCount = tasks.length;

        manager.clearAllTasks();

        if (totalCount === 0) {
          return ERROR_MESSAGES.noTasksToClear;
        }

        return SUCCESS_MESSAGES.clearedAllTasks(runningCount, totalCount);
      } catch (error) {
        return ERROR_MESSAGES.clearFailed(error instanceof Error ? error.message : String(error));
      }
    },
  });
}
