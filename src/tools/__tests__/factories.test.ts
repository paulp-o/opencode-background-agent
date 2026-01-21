import { describe, expect, mock, test } from "bun:test";
import type { BackgroundTask } from "../../types";
import { createBackgroundBlock } from "../block";
import { createBackgroundCancel } from "../cancel";
import { createBackgroundClear } from "../clear";
import { createBackgroundList } from "../list";
import { createBackgroundTask } from "../task";

const createMockTask = (overrides: Partial<BackgroundTask> = {}): BackgroundTask => ({
  id: "bg_test123",
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
  ...overrides,
});

describe("tool factories", () => {
  describe("createBackgroundTask", () => {
    test("creates a tool with correct description", () => {
      const mockManager = { launch: mock(() => Promise.resolve(createMockTask())) };
      const tool = createBackgroundTask(mockManager);

      expect(tool.description).toContain("background agent task");
    });

    test("returns error when agent is empty", async () => {
      const mockManager = { launch: mock(() => Promise.resolve(createMockTask())) };
      const tool = createBackgroundTask(mockManager);

      const result = await tool.execute({ description: "test", prompt: "test", agent: "" }, {
        sessionID: "ses",
        messageID: "msg",
        agent: "test",
      } as any);

      expect(result).toContain("Agent parameter is required");
    });

    test("launches task with valid parameters", async () => {
      const mockTask = createMockTask();
      const launchMock = mock(() => Promise.resolve(mockTask));
      const mockManager = { launch: launchMock };
      const tool = createBackgroundTask(mockManager);

      const result = await tool.execute(
        { description: "test", prompt: "test prompt", agent: "explore" },
        { sessionID: "ses", messageID: "msg", agent: "test" } as any
      );

      expect(result).toContain("Background task launched");
      expect(result).toContain(mockTask.id);
      expect(launchMock).toHaveBeenCalled();
    });
  });

  describe("createBackgroundCancel", () => {
    test("creates a tool with correct description", () => {
      const mockManager = {
        getTask: mock(() => undefined),
        cancelTask: mock(() => Promise.resolve()),
      };
      const tool = createBackgroundCancel(mockManager);

      expect(tool.description).toContain("Cancel a running background task");
    });

    test("returns error when task not found", async () => {
      const mockManager = {
        getTask: mock(() => undefined),
        cancelTask: mock(() => Promise.resolve()),
      };
      const tool = createBackgroundCancel(mockManager);

      const result = await tool.execute({ task_id: "nonexistent" });

      expect(result).toContain("Task not found");
    });
  });

  describe("createBackgroundList", () => {
    test("creates a tool with correct description", () => {
      const mockManager = { getAllTasks: mock(() => []) };
      const tool = createBackgroundList(mockManager);

      expect(tool.description).toContain("List all background tasks");
    });

    test("returns empty message when no tasks", async () => {
      const mockManager = { getAllTasks: mock(() => []) };
      const tool = createBackgroundList(mockManager);

      const result = await tool.execute({});

      expect(result).toContain("No background tasks found");
    });

    test("lists tasks with status filter", async () => {
      const tasks = [
        createMockTask({ id: "bg_1", status: "running" }),
        createMockTask({ id: "bg_2", status: "completed" }),
      ];
      const mockManager = { getAllTasks: mock(() => tasks) };
      const tool = createBackgroundList(mockManager);

      const result = await tool.execute({ status: "running" });

      expect(result).toContain("bg_1");
      expect(result).not.toContain("bg_2");
    });
  });

  describe("createBackgroundClear", () => {
    test("creates a tool with correct description", () => {
      const mockManager = {
        getAllTasks: mock(() => []),
        clearAllTasks: mock(() => {}),
      };
      const tool = createBackgroundClear(mockManager);

      expect(tool.description).toContain("Clear and abort all background tasks");
    });

    test("returns empty message when no tasks to clear", async () => {
      const clearMock = mock(() => {});
      const mockManager = {
        getAllTasks: mock(() => []),
        clearAllTasks: clearMock,
      };
      const tool = createBackgroundClear(mockManager);

      const result = await tool.execute();

      expect(result).toContain("No background tasks to clear");
      expect(clearMock).toHaveBeenCalled();
    });

    test("clears tasks and reports count", async () => {
      const tasks = [
        createMockTask({ status: "running" }),
        createMockTask({ status: "completed" }),
      ];
      const clearMock = mock(() => {});
      const mockManager = {
        getAllTasks: mock(() => tasks),
        clearAllTasks: clearMock,
      };
      const tool = createBackgroundClear(mockManager);

      const result = await tool.execute();

      expect(result).toContain("Cleared all background tasks");
      expect(result).toContain("Running tasks aborted: 1");
      expect(result).toContain("Total tasks cleared: 2");
      expect(clearMock).toHaveBeenCalled();
    });
  });

  describe("createBackgroundBlock", () => {
    test("creates a tool with correct description", () => {
      const mockManager = {
        getTask: mock(() => undefined),
        waitForTasks: mock(() => Promise.resolve(new Map())),
      };
      const tool = createBackgroundBlock(mockManager);

      expect(tool.description).toContain("Wait for specific background tasks");
    });

    test("returns error when task_ids is empty", async () => {
      const mockManager = {
        getTask: mock(() => undefined),
        waitForTasks: mock(() => Promise.resolve(new Map())),
      };
      const tool = createBackgroundBlock(mockManager);

      const result = await tool.execute({ task_ids: [] });

      expect(result).toContain("task_ids array is required");
    });

    test("returns immediately if all tasks already completed", async () => {
      const completedTask = createMockTask({
        id: "bg_1",
        status: "completed",
        completedAt: new Date().toISOString(),
      });
      const waitMock = mock(() => Promise.resolve(new Map()));
      const mockManager = {
        getTask: mock(() => completedTask),
        waitForTasks: waitMock,
      };
      const tool = createBackgroundBlock(mockManager);

      const result = await tool.execute({ task_ids: ["bg_1"] });

      expect(result).toContain("All Tasks Completed");
      expect(waitMock).not.toHaveBeenCalled();
    });

    test("waits for running tasks to complete", async () => {
      const runningTask = createMockTask({ id: "bg_1", status: "running" });
      const completedTask = createMockTask({
        id: "bg_1",
        status: "completed",
        completedAt: new Date().toISOString(),
      });

      const waitMock = mock(() => {
        const results = new Map<string, BackgroundTask | null>();
        results.set("bg_1", completedTask);
        return Promise.resolve(results);
      });
      const mockManager = {
        getTask: mock(() => runningTask),
        waitForTasks: waitMock,
      };
      const tool = createBackgroundBlock(mockManager);

      const result = await tool.execute({ task_ids: ["bg_1"] });

      expect(waitMock).toHaveBeenCalled();
      expect(result).toContain("bg_1");
    });

    test("handles task not found", async () => {
      const waitMock = mock(() => {
        const results = new Map<string, BackgroundTask | null>();
        results.set("nonexistent", null);
        return Promise.resolve(results);
      });
      const mockManager = {
        getTask: mock(() => undefined),
        waitForTasks: waitMock,
      };
      const tool = createBackgroundBlock(mockManager);

      const result = await tool.execute({ task_ids: ["nonexistent"] });

      expect(result).toContain("Not found");
    });

    test("reports timeout when tasks don't complete", async () => {
      const runningTask = createMockTask({ id: "bg_1", status: "running" });

      const waitMock = mock(() => {
        const results = new Map<string, BackgroundTask | null>();
        results.set("bg_1", runningTask); // Still running after wait
        return Promise.resolve(results);
      });
      const mockManager = {
        getTask: mock(() => runningTask),
        waitForTasks: waitMock,
      };
      const tool = createBackgroundBlock(mockManager);

      const result = await tool.execute({ task_ids: ["bg_1"], timeout: 100 });

      expect(result).toContain("Timeout");
      expect(result).toContain("still running");
    });
  });
});
