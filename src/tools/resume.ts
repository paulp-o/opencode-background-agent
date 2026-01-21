import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_resume tool for resuming completed tasks with follow-up messages
 * @param manager - BackgroundManager instance with getTask(), checkSessionExists(), sendResumePrompt(), sendResumePromptAsync() methods
 * @returns Tool definition for background_resume
 */
export function createBackgroundResume(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  checkSessionExists(sessionID: string): Promise<boolean>;
  sendResumePrompt(task: BackgroundTask, message: string, timeoutMs: number): Promise<string>;
  sendResumePromptAsync(task: BackgroundTask, message: string, toolContext: any): Promise<void>;
}): ToolDefinition {
  return tool({
    description: `Resume a completed background task with a follow-up message.

Sends a new prompt to the subagent session and retrieves the response.
Only completed tasks can be resumed. The task's conversation history is preserved.

Arguments:
- task_id: Required task ID to resume
- message: Follow-up prompt to send (same format as background_task prompt)
- block: If true, wait for response. If false (default), return immediately and notify on completion.
- timeout: Max wait time in ms when blocking (default: 60000, max: 600000)

Returns:
- When blocking: Waits for response, then returns only the new response
- When not blocking: Returns immediately, notifies parent session when response is ready`,
    args: {
      task_id: tool.schema.string().nonoptional(),
      message: tool.schema.string().nonoptional(),
      block: tool.schema.boolean().optional(),
      timeout: tool.schema.number().optional(),
    },
    async execute(
      args: { task_id: string; message: string; block?: boolean; timeout?: number },
      toolContext
    ) {
      const task = manager.getTask(args.task_id);
      if (!task) {
        return `Task not found: ${args.task_id}`;
      }

      if (task.status === "resumed") {
        return `Task is currently being resumed. Wait for completion before sending another message.`;
      }

      if (task.status !== "completed") {
        return `Cannot resume task: status is "${task.status}". Only completed tasks can be resumed.`;
      }

      const shouldBlock = args.block === true;
      const timeoutMs = Math.min(args.timeout ?? 60000, 600000);

      task.status = "resumed";
      task.resumeCount++;

      try {
        const sessionCheck = await manager.checkSessionExists(task.sessionID);
        if (!sessionCheck) {
          task.status = "completed";
          return `Session expired or was deleted. Start a new background_task to continue.`;
        }

        if (shouldBlock) {
          const response = await manager.sendResumePrompt(task, args.message, timeoutMs);
          task.status = "completed";
          return response;
        }

        manager.sendResumePromptAsync(task, args.message, toolContext);
        return `⏳ **Resume initiated**
Task ID: \`${task.id}\`
Resume count: ${task.resumeCount}

Follow-up prompt sent. You'll be notified when the response is ready.`;
      } catch (error) {
        task.status = "completed";
        const message = error instanceof Error ? error.message : String(error);
        return `Error resuming task: ${message}`;
      }
    },
  });
}
