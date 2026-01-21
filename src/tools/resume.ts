import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import type { BackgroundTask } from "../types";

/**
 * Creates the background_resume tool for resuming completed tasks with follow-up messages (notification-based)
 * @param manager - BackgroundManager instance with getTask(), checkSessionExists(), sendResumePromptAsync() methods
 * @returns Tool definition for background_resume
 */
export function createBackgroundResume(manager: {
  getTask(taskId: string): BackgroundTask | undefined;
  checkSessionExists(sessionID: string): Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendResumePromptAsync(task: BackgroundTask, message: string, toolContext: any): Promise<void>;
}): ToolDefinition {
  return tool({
    description: `Resume a completed background task with a follow-up message.

Sends a new prompt to the subagent session and retrieves the response.
Only completed tasks can be resumed. The task's conversation history is preserved.

Arguments:
- task_id: Required task ID to resume
- message: Follow-up prompt to send (same format as background_task prompt)

Returns:
- Immediately with confirmation (non-blocking)
- Notifies parent session when response is ready

Note: Use \`background_block\` with the task_id after resume if you need to wait for the response.`,
    args: {
      task_id: tool.schema.string().nonoptional(),
      message: tool.schema.string().nonoptional(),
    },
    async execute(args: { task_id: string; message: string }, toolContext) {
      const task = manager.getTask(args.task_id);
      if (!task) {
        return `Task not found: ${args.task_id}`;
      }

      if (task.status === "resumed") {
        return "Task is currently being resumed. Wait for completion before sending another message.";
      }

      if (task.status !== "completed") {
        return `Cannot resume task: status is "${task.status}". Only completed tasks can be resumed.`;
      }

      task.status = "resumed";
      task.resumeCount++;

      try {
        const sessionCheck = await manager.checkSessionExists(task.sessionID);
        if (!sessionCheck) {
          task.status = "completed";
          return "Session expired or was deleted. Start a new background_task to continue.";
        }

        // Fire async resume - notification will be sent when complete
        manager.sendResumePromptAsync(task, args.message, toolContext);

        return `⏳ **Resume initiated**
Task ID: \`${task.id}\`
Resume count: ${task.resumeCount}

Follow-up prompt sent. You'll be notified when the response is ready.
Use \`background_block(["${task.id}"])\` if you need to wait for the response.`;
      } catch (error) {
        task.status = "completed";
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Error resuming task: ${errorMessage}`;
      }
    },
  });
}
