import { describe, expect, mock, test } from "bun:test";
import type { BackgroundTask } from "../../types";
import { cancelTask, checkSessionExists, getTaskMessages } from "../task-lifecycle";

const createMockTask = (overrides: Partial<BackgroundTask> = {}): BackgroundTask => ({
  sessionID: "ses_test123",
  parentSessionID: "ses_parent",
  parentMessageID: "msg_parent",
  parentAgent: "test-agent",
  description: "Test task",
  prompt: "Test prompt",
  agent: "explore",
  status: "running",
  startedAt: new Date().toISOString(),
  batchId: "batch_123",
  resumeCount: 0,
  isForked: false,
  ...overrides,
});

describe("task-lifecycle", () => {
  describe("cancelTask", () => {
    test("throws error when task not found", async () => {
      const tasks = new Map<string, BackgroundTask>();
      const mockClient = {
        session: { abort: mock(() => Promise.resolve()) },
      };

      await expect(cancelTask("nonexistent", tasks, mockClient as any)).rejects.toThrow(
        "Task not found"
      );
    });

    test("throws error when task is not running", async () => {
      const task = createMockTask({ status: "completed" });
      const tasks = new Map<string, BackgroundTask>([[task.sessionID, task]]);
      const mockClient = {
        session: { abort: mock(() => Promise.resolve()) },
      };

      await expect(cancelTask(task.sessionID, tasks, mockClient as any)).rejects.toThrow(
        "Cannot cancel task"
      );
    });

    test("cancels running task successfully", async () => {
      const task = createMockTask({ status: "running" });
      const tasks = new Map<string, BackgroundTask>([[task.sessionID, task]]);
      const abortMock = mock(() => Promise.resolve());
      const mockClient = {
        session: { abort: abortMock },
      };

      await cancelTask(task.sessionID, tasks, mockClient as any);

      expect(task.status).toBe("cancelled");
      expect(task.completedAt).toBeDefined();
      expect(abortMock).toHaveBeenCalled();
    });
  });

  describe("getTaskMessages", () => {
    test("returns messages array on success", async () => {
      const mockMessages = [
        { info: { role: "user" }, parts: [{ type: "text", text: "hello" }] },
        { info: { role: "assistant" }, parts: [{ type: "text", text: "hi" }] },
      ];
      const mockClient = {
        session: {
          messages: mock(() => Promise.resolve({ data: mockMessages })),
        },
      };

      const result = await getTaskMessages("ses_123", mockClient as any);
      expect(result).toHaveLength(2);
    });

    test("throws error on failure", async () => {
      const mockClient = {
        session: {
          messages: mock(() => Promise.resolve({ error: "Session not found" })),
        },
      };

      await expect(getTaskMessages("ses_123", mockClient as any)).rejects.toThrow(
        "Error fetching messages"
      );
    });
  });

  describe("checkSessionExists", () => {
    test("returns true when session exists", async () => {
      const mockClient = {
        session: {
          get: mock(() => Promise.resolve({ data: { id: "ses_123" } })),
        },
      };

      const result = await checkSessionExists("ses_123", mockClient as any);
      expect(result).toBe(true);
    });

    test("returns false when session does not exist", async () => {
      const mockClient = {
        session: {
          get: mock(() => Promise.resolve({ error: "not found", data: null })),
        },
      };

      const result = await checkSessionExists("ses_123", mockClient as any);
      expect(result).toBe(false);
    });

    test("returns false on error", async () => {
      const mockClient = {
        session: {
          get: mock(() => Promise.reject(new Error("Network error"))),
        },
      };

      const result = await checkSessionExists("ses_123", mockClient as any);
      expect(result).toBe(false);
    });
  });
});
