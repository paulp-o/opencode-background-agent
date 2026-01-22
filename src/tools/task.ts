import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { shortId } from "../helpers";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, TOOL_DESCRIPTIONS, WARNING_MESSAGES } from "../prompts";
import type { BackgroundTask, LaunchInput } from "../types";
import { type ResumeManager, executeResume, validateResumeTask } from "./resume";

// =============================================================================
// Combined Manager Interface (supports both launch and resume)
// =============================================================================

interface TaskManager extends ResumeManager {
  launch(input: LaunchInput): Promise<BackgroundTask>;
}

// =============================================================================
// Background Task Tool Factory
// =============================================================================

/**
 * Creates the background_task tool for launching async background agent tasks
 * and resuming completed tasks with follow-up prompts
 * @param manager - BackgroundManager instance with launch() and resume methods
 * @returns Tool definition for background_task
 */
export function createBackgroundTask(manager: TaskManager): ToolDefinition {
  return tool({
    description: TOOL_DESCRIPTIONS.backgroundTask,
    args: {
      resume: tool.schema.string().optional(),
      description: tool.schema.string().nonoptional(),
      prompt: tool.schema.string().nonoptional(),
      agent: tool.schema.string().nonoptional(),
    },
    async execute(
      args: { resume?: string; description: string; prompt: string; agent: string },
      toolContext
    ) {
      // =======================================================================
      // Mode Detection: if resume is truthy, use resume mode
      // =======================================================================
      if (args.resume) {
        return handleResumeMode(manager, args, toolContext);
      }

      // =======================================================================
      // Launch Mode: create a new background task
      // =======================================================================
      return handleLaunchMode(manager, args, toolContext);
    },
  });
}

// =============================================================================
// Resume Mode Handler
// =============================================================================

async function handleResumeMode(
  manager: TaskManager,
  args: { resume?: string; description: string; prompt: string; agent: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolContext: any
): Promise<string> {
  // args.resume is guaranteed to be truthy here (checked in caller)
  const taskId = args.resume as string;

  // Validate prompt is provided and non-empty
  const trimmedPrompt = args.prompt?.trim();
  if (!trimmedPrompt) {
    return ERROR_MESSAGES.promptRequired;
  }

  // Warn if extra params are provided (but proceed with resume)
  const warnings: string[] = [];
  if (args.agent?.trim() || args.description?.trim()) {
    warnings.push(WARNING_MESSAGES.resumeModeIgnoresParams);
  }

  // Validate the task can be resumed (async - checks disk if not in memory)
  const validation = await validateResumeTask(manager, taskId);
  if (!validation.valid) {
    return validation.error;
  }

  // Execute the resume
  const result = await executeResume(manager, validation.task, trimmedPrompt, toolContext);

  if (!result.success) {
    return result.error;
  }

  // Return success message with any warnings
  if (warnings.length > 0) {
    return `${warnings.join("\n")}\n\n${result.message}`;
  }

  return result.message;
}

// =============================================================================
// Launch Mode Handler
// =============================================================================

async function handleLaunchMode(
  manager: TaskManager,
  args: { resume?: string; description: string; prompt: string; agent: string },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toolContext: any
): Promise<string> {
  // Validate required params for launch mode
  if (!args.agent || args.agent.trim() === "") {
    return ERROR_MESSAGES.agentRequired;
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

    return SUCCESS_MESSAGES.taskLaunched(shortId(task.sessionID));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return ERROR_MESSAGES.launchFailed(message);
  }
}
