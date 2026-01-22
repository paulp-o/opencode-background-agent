import { type ToolDefinition, tool } from "@opencode-ai/plugin";
import { shortId } from "../helpers";
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
    description: `Launch a background agent task that runs asynchronously.

The task runs in a separate session while you continue with other work.

Use this for:
- Long-running research tasks
- Complex analysis that doesn't need immediate results
- Parallel workloads to maximize throughput

Arguments:
- resume: (Optional) Task ID to resume - if provided, enters resume mode
- description: Short task description (shown in status)
- prompt: Full detailed prompt for the agent (or follow-up message in resume mode)
- agent: Agent type to use (any registered agent)

IMPORTANT: You'll be informed when each task is complete.DO NOT assume all tasks were done, check again if all agents you need are complete.

Returns immediately with task ID. The task will run in background and notify you when complete.
Optionally use \`background_output\` later if you need to check results manually with or without blocking.`,
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
    return "Prompt is required when resuming a task";
  }

  // Warn if extra params are provided (but proceed with resume)
  const warnings: string[] = [];
  if (args.agent?.trim() || args.description?.trim()) {
    warnings.push("Note: agent and description are ignored in resume mode.");
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
    return "Agent parameter is required. Specify which agent to use.";
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
Task ID: \`${shortId(task.sessionID)}\`

Task will run in background. You'll be notified when complete.`;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Failed to launch background task: ${message}`;
  }
}
