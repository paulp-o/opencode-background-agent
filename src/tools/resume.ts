import type { BackgroundTask } from "../types";

// =============================================================================
// Resume Helper Types
// =============================================================================

export interface ResumeManager {
  getTask(taskId: string): BackgroundTask | undefined;
  checkSessionExists(sessionID: string): Promise<boolean>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendResumePromptAsync(task: BackgroundTask, message: string, toolContext: any): Promise<void>;
}

export type ResumeValidationResult =
  | { valid: true; task: BackgroundTask }
  | { valid: false; error: string };

// =============================================================================
// Resume Helper Functions
// =============================================================================

/**
 * Validates that a task can be resumed
 * @param manager - BackgroundManager instance
 * @param taskId - Task ID to validate
 * @returns Validation result with task if valid, or error message
 */
export function validateResumeTask(manager: ResumeManager, taskId: string): ResumeValidationResult {
  const task = manager.getTask(taskId);

  if (!task) {
    return {
      valid: false,
      error: `Task not found: ${taskId}. Use background_list to see available tasks.`,
    };
  }

  if (task.status === "resumed") {
    return {
      valid: false,
      error: "Task is currently being resumed. Wait for completion.",
    };
  }

  if (task.status !== "completed") {
    return {
      valid: false,
      error: `Only completed tasks can be resumed. Current status: ${task.status}`,
    };
  }

  return { valid: true, task };
}

/**
 * Executes the resume operation on a validated task
 * @param manager - BackgroundManager instance
 * @param task - The task to resume (must be validated first)
 * @param prompt - The follow-up prompt to send
 * @param toolContext - Tool context for notifications
 * @returns Success message or error message
 */
export async function executeResume(
  manager: ResumeManager,
  task: BackgroundTask,
  prompt: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolContext: any
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  // Set status to resumed and increment count
  task.status = "resumed";
  task.resumeCount++;

  try {
    // Verify session still exists
    const sessionExists = await manager.checkSessionExists(task.sessionID);
    if (!sessionExists) {
      task.status = "completed"; // Revert status
      return {
        success: false,
        error: "Session expired or was deleted. Start a new background_task to continue.",
      };
    }

    // Fire async resume - notification will be sent when complete
    manager.sendResumePromptAsync(task, prompt, toolContext);

    // Build success message
    const resumeCountInfo = task.resumeCount > 1 ? `\nResume count: ${task.resumeCount}` : "";

    return {
      success: true,
      message: `⏳ **Resume initiated**
Task ID: \`${task.id}\`${resumeCountInfo}

Follow-up prompt sent. You'll be notified when the response is ready.`,
    };
  } catch (error) {
    // On error, set status to error (per spec)
    task.status = "error";
    task.error = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Error resuming task: ${task.error}`,
    };
  }
}
