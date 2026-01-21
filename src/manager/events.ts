import type { BackgroundTask } from "../types";

// =============================================================================
// Event Handling Functions
// =============================================================================

/**
 * Starts the event subscription to listen for session events.
 * Automatically reconnects on errors or stream closure.
 */
export async function startEventSubscription(
  client: {
    event: {
      subscribe: () => Promise<{
        stream: AsyncIterable<{ type: string; properties?: Record<string, unknown> }>;
      }>;
    };
  },
  handleEvent: (event: { type: string; properties?: Record<string, unknown> }) => void
): Promise<void> {
  try {
    const subscription = await client.event.subscribe();
    // Process events in background
    (async () => {
      for await (const event of subscription.stream) {
        handleEvent(event);
      }
    })().catch(() => {
      // Stream ended, try to reconnect
      setTimeout(() => startEventSubscription(client, handleEvent), 1000);
    });
  } catch {
    // Failed to subscribe, retry
    setTimeout(() => startEventSubscription(client, handleEvent), 1000);
  }
}

/**
 * Handles incoming events and triggers appropriate actions.
 * Primary completion detection mechanism via session.idle events.
 */
export function handleEvent(
  event: {
    type: string;
    properties?: Record<string, unknown>;
  },
  callbacks: {
    clearAllTasks: () => void;
    getTasksArray: () => BackgroundTask[];
    notifyParentSession: (task: BackgroundTask) => void;
  }
): void {
  const { clearAllTasks, getTasksArray, notifyParentSession } = callbacks;
  const props = event.properties;

  // Debug: log all events to understand what's being received
  // console.log("[background-agent] Event received:", event.type, JSON.stringify(props));

  // Clear on session.new, prompt.clear, or session.interrupt (ESC key)
  if (event.type === "tui.command.execute") {
    const command = props?.command as string | undefined;
    if (
      command === "session.new" ||
      command === "prompt.clear" ||
      command === "session.interrupt"
    ) {
      clearAllTasks();
      return;
    }
  }

  // Clear if parent session is deleted
  if (event.type === "session.deleted") {
    const info = props?.info as { id?: string } | undefined;
    if (!info?.id) return;

    // Check if this is a parent session being deleted
    const affectedTasks = getTasksArray().filter((t) => t.parentSessionID === info.id);
    if (affectedTasks.length > 0) {
      clearAllTasks();
      return;
    }

    // Also handle if it's a background task's session
    const task = getTasksArray().find((t) => t.sessionID === info.id);
    if (!task) return;

    if (task.status === "running") {
      task.status = "cancelled";
      task.completedAt = new Date().toISOString();
      task.error = "Session deleted";
    }
    return;
  }

  if (event.type === "session.idle") {
    const sessionID = props?.sessionID as string | undefined;
    if (!sessionID) return;

    const task = getTasksArray().find((t) => t.sessionID === sessionID);
    // Handle both running tasks and resumed tasks
    if (!task || (task.status !== "running" && task.status !== "resumed")) return;

    task.status = "completed";
    task.completedAt = new Date().toISOString();
    // Trigger notification immediately on event-based completion
    notifyParentSession(task);
  }

  if (event.type === "session.deleted") {
    const info = props?.info as { id?: string } | undefined;
    if (!info?.id) return;

    const task = getTasksArray().find((t) => t.sessionID === info.id);
    if (!task) return;

    if (task.status === "running") {
      task.status = "cancelled";
      task.completedAt = new Date().toISOString();
      task.error = "Session deleted";
    }
  }
}
