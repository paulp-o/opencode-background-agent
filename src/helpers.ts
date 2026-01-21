import type { BackgroundTask, BackgroundTaskStatus } from "./types";

// =============================================================================
// Helper Functions
// =============================================================================

export function formatDuration(startStr: string, endStr?: string): string {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  const duration = end.getTime() - start.getTime();
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

export function getStatusIcon(status: BackgroundTaskStatus): string {
  switch (status) {
    case "running":
      return "⏳";
    case "completed":
      return "✓";
    case "error":
      return "✗";
    case "cancelled":
      return "⊘";
    case "resumed":
      return "↻";
  }
}

export function formatTaskStatus(task: BackgroundTask): string {
  const duration = formatDuration(task.startedAt, task.completedAt);
  const promptPreview = truncateText(task.prompt, 500);
  const icon = getStatusIcon(task.status);

  let progressSection = "";
  if (task.progress?.lastTools && task.progress.lastTools.length > 0) {
    progressSection = `\n| Last tools | ${task.progress.lastTools.join(" → ")} |`;
  }

  let statusNote = "";
  if (task.status === "running") {
    statusNote = "\n\n> ⏳ **Running**: Task is still in progress. Check back later for results.";
  } else if (task.status === "error") {
    statusNote = `\n\n> ✗ **Failed**: ${task.error || "Unknown error"}`;
  } else if (task.status === "cancelled") {
    statusNote = "\n\n> ⊘ **Cancelled**: Task was cancelled before completion.";
  }

  return `# ${icon} Task Status

| Field | Value |
|-------|-------|
| Task ID | \`${task.id}\` |
| Description | ${task.description} |
| Agent | ${task.agent} |
| Status | ${icon} **${task.status}** |
| Duration | ${duration} |
| Session ID | \`${task.sessionID}\` |${progressSection}
${statusNote}
## Original Prompt

\`\`\`
${promptPreview}
\`\`\``;
}

// Interface for getTaskMessages return type
interface TaskMessage {
  info?: { role?: string };
  parts?: Array<{ type?: string; text?: string }>;
}

export async function formatTaskResult(
  task: BackgroundTask,
  getMessages: (sessionID: string) => Promise<TaskMessage[]>
): Promise<string> {
  try {
    const messages = await getMessages(task.sessionID);

    if (!Array.isArray(messages) || messages.length === 0) {
      return `✓ **Task Completed**

| Field | Value |
|-------|-------|
| Task ID | \`${task.id}\` |
| Description | ${task.description} |
| Duration | ${formatDuration(task.startedAt, task.completedAt)} |
| Session ID | \`${task.sessionID}\` |

---

(No messages found)`;
    }

    const assistantMessages = messages.filter((m) => m.info?.role === "assistant");

    if (assistantMessages.length === 0) {
      return `✓ **Task Completed**

| Field | Value |
|-------|-------|
| Task ID | \`${task.id}\` |
| Description | ${task.description} |
| Duration | ${formatDuration(task.startedAt, task.completedAt)} |
| Session ID | \`${task.sessionID}\` |

---

(No assistant response found)`;
    }

    const lastMessage = assistantMessages[assistantMessages.length - 1];
    const textParts = lastMessage?.parts?.filter((p) => p.type === "text") ?? [];
    const textContent = textParts
      .map((p) => p.text ?? "")
      .filter((text) => text.length > 0)
      .join("\n");

    return `✓ **Task Completed**

| Field | Value |
|-------|-------|
| Task ID | \`${task.id}\` |
| Description | ${task.description} |
| Duration | ${formatDuration(task.startedAt, task.completedAt)} |
| Session ID | \`${task.sessionID}\` |

---

${textContent || "(No text output)"}`;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return `Task Result

Task ID: ${task.id}
Description: ${task.description}
Duration: ${formatDuration(task.startedAt, task.completedAt)}
Session ID: ${task.sessionID}

---

Error fetching messages: ${errMsg}`;
  }
}
