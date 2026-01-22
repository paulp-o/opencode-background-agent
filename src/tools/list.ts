import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { formatDuration, getStatusIcon, shortId } from "../helpers";
import type { BackgroundTask } from "../types";

// =============================================================================
// Background List Tool Factory
// =============================================================================

export function createBackgroundList(manager: {
  getAllTasks(): BackgroundTask[];
}): ToolDefinition {
  return tool({
    description: `List all background tasks.

Shows all running, completed, error, and cancelled background tasks with their status.

Arguments:
- status: Optional filter by status ("running", "completed", "error", "cancelled").`,
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
            ? `No background tasks found with status "${args.status}".`
            : "No background tasks found.";
        }

        tasks.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

        const header = `# Background Tasks

| Task ID | Description | Agent | Status | Duration |
|---------|-------------|-------|--------|----------|`;

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
**Total: ${tasks.length}** | ⏳ ${running} running | ✓ ${completed} completed | ✗ ${errored} error | ⊘ ${cancelled} cancelled`;
      } catch (error) {
        return `Error listing tasks: ${error instanceof Error ? error.message : String(error)}`;
      }
    },
  });
}
