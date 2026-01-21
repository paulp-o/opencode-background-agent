import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import type { BackgroundTask, LaunchInput } from "../types";

/**
 * Creates the background_task tool for launching async background agent tasks
 * @param manager - BackgroundManager instance with launch() method
 * @returns Tool definition for background_task
 */
export function createBackgroundTask(manager: {
  launch(input: LaunchInput): Promise<BackgroundTask>;
}): ToolDefinition {
  return tool({
    description: `Launch a background agent task that runs asynchronously.

The task runs in a separate session while you continue with other work.

Use this for:
- Long-running research tasks
- Complex analysis that doesn't need immediate results
- Parallel workloads to maximize throughput

Arguments:
- description: Short task description (shown in status)
- prompt: Full detailed prompt for the agent
- agent: Agent type to use (any registered agent)

IMPORTANT: You'll be informed when each task is complete.DO NOT assume all tasks were done, check again if all agents you need are complete.

Returns immediately with task ID. The task will run in background and notify you when complete.
Optionally use \`background_output\` later if you need to check results manually with or without blocking.`,
    args: {
      description: tool.schema
        .string()
        // .describe("Short task description (shown in status)")
        .nonoptional(),
      prompt: tool.schema
        .string()
        // .describe("Full detailed prompt for the agent")
        .nonoptional(),
      agent: tool.schema
        .string()
        // .describe("Agent type to use (any registered agent)")
        .nonoptional(),
    },
    async execute(args: { description: string; prompt: string; agent: string }, toolContext) {
      if (!args.agent || args.agent.trim() === "") {
        return `Agent parameter is required. Specify which agent to use.`;
      }

      try {
        const task = await manager.launch({
          description: args.description,
          prompt: args.prompt,
          agent: args.agent.trim(),
          parentSessionID: toolContext.sessionID,
          parentMessageID: toolContext.messageID,
          parentAgent: toolContext.agent,
        });

        return `⏳ **Background task launched**
Task ID: \`${task.id}\`
Session ID: \`${task.sessionID}\`

Task will run in background. You'll be notified when complete. Use \`background_output\` with task_id=\`${task.id}\` to get results.`;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return `Failed to launch background task: ${message}`;
      }
    },
  });
}
