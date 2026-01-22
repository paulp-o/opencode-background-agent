import { setTaskStatus, shortId } from "../helpers";
import type { BackgroundTask } from "../types";

// =============================================================================
// Resume Helper Types
// =============================================================================

export interface ResumeManager {
  getTask(taskId: string): BackgroundTask | undefined;
  resolveTaskId(idOrPrefix: string): string | null;
  resolveTaskIdWithFallback(idOrPrefix: string): Promise<string | null>;
  getTaskWithFallback(id: string): Promise<BackgroundTask | undefined>;
  persistTask(task: BackgroundTask): Promise<void>;
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
 * Validates that a task can be resumed (async version that checks disk)
 * @param manager - BackgroundManager instance
 * @param taskId - Task ID (full or short) to validate
 * @returns Validation result with task if valid, or error message
 */
export async function validateResumeTask(
  manager: ResumeManager,
  taskId: string
): Promise<ResumeValidationResult> {
  // Resolve short ID or prefix to full ID (checks disk if not in memory)
  const resolvedId = await manager.resolveTaskIdWithFallback(taskId);
  if (!resolvedId) {
    return {
      valid: false,
      error: `Task not found: ${taskId}. Use background_list to see available tasks.`,
    };
  }

  // Get task from memory or disk
  const task = await manager.getTaskWithFallback(resolvedId);

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
  setTaskStatus(task, "resumed");
  task.resumeCount++;
  await manager.persistTask(task);

  try {
    // Verify session still exists
    const sessionExists = await manager.checkSessionExists(task.sessionID);
    if (!sessionExists) {
      setTaskStatus(task, "completed"); // Revert status
      await manager.persistTask(task);
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
Task ID: \`${shortId(task.sessionID)}\`${resumeCountInfo}

Follow-up prompt sent. You'll be notified when the response is ready.`,
    };
  } catch (error) {
    // On error, set status to error (per spec)
    const errorMsg = error instanceof Error ? error.message : String(error);
    setTaskStatus(task, "error", { error: errorMsg });
    await manager.persistTask(task);

    return {
      success: false,
      error: `Error resuming task: ${errorMsg}`,
    };
  }
}
