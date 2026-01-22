import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { formatDuration, getStatusIcon, shortId } from "../helpers";
import { ERROR_MESSAGES, FORMAT_TEMPLATES, TOOL_DESCRIPTIONS } from "../prompts";
import type { BackgroundTask } from "../types";

// =============================================================================
// Background List Tool Factory
// =============================================================================

export function createBackgroundList(manager: {
  getAllTasks(): BackgroundTask[];
}): ToolDefinition {
  return tool({
    description: TOOL_DESCRIPTIONS.backgroundList,
    args: {
      status: tool.schema.string().optional().describe("Filter by status"),
    },
    async execute(args: { status?: string }) {
      try {
        let tasks = manager.getAllTasks();

        if (args.status) {
          tasks = tasks.filter((t) => t.status === args.status?.toLowerCase());
        }

        if (tasks.length === 0) {
          return args.status
            ? ERROR_MESSAGES.noTasksWithStatus(args.status)
            : ERROR_MESSAGES.noTasksFound;
        }

        tasks.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

        const header = FORMAT_TEMPLATES.listHeader;

        const rows = tasks
          .map((task) => {
            const duration = formatDuration(task.startedAt, task.completedAt);
            const desc =
              task.description.length > 30
                ? `${task.description.slice(0, 27)}...`
                : task.description;
            const icon = getStatusIcon(task.status);
            return `| \`${shortId(task.sessionID)}${task.resumeCount > 0 ? " (resumed)" : ""}\` | ${desc} | ${task.agent} | ${icon} ${task.status} | ${duration} |`;
          })
          .join("\n");

        const running = tasks.filter((t) => t.status === "running").length;
        const completed = tasks.filter((t) => t.status === "completed").length;
        const errored = tasks.filter((t) => t.status === "error").length;
        const cancelled = tasks.filter((t) => t.status === "cancelled").length;

        return `${header}
${rows}

---
${FORMAT_TEMPLATES.listSummary(tasks.length, running, completed, errored, cancelled)}`;
      } catch (error) {
        return ERROR_MESSAGES.listFailed(error instanceof Error ? error.message : String(error));
      }
    },
  });
}
