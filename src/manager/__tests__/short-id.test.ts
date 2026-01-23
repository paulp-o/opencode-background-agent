import { describe, expect, test } from "bun:test";
import type { BackgroundTask } from "../../types";

// Create a mock BackgroundManager class with only the methods we need to test
class MockBackgroundManager {
  private tasks: Map<string, BackgroundTask> = new Map();

  addTask(task: BackgroundTask): void {
    this.tasks.set(task.sessionID, task);
  }

  getTask(id: string): BackgroundTask | undefined {
    return this.tasks.get(id);
  }

  findTasksByPrefix(prefix: string): BackgroundTask[] {
    const matching: BackgroundTask[] = [];
    for (const [id] of this.tasks) {
      if (id.startsWith(prefix)) {
        const task = this.tasks.get(id);
        if (task) {
          matching.push(task);
        }
      }
    }
    // Sort by most recent first
    return matching.sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  resolveTaskId(idOrPrefix: string): string | null {
    // Direct lookup first (exact match)
    if (this.tasks.has(idOrPrefix)) {
      return idOrPrefix;
    }

    // Prefix matching
    const matching = this.findTasksByPrefix(idOrPrefix);
    if (matching.length === 0) {
      return null;
    }

    // Return most recent if multiple matches
    const firstMatch = matching[0];
    return firstMatch ? firstMatch.sessionID : null;
  }
}

const createMockTask = (
  sessionID: string,
  startedAt: string,
  overrides: Partial<BackgroundTask> = {}
): BackgroundTask => ({
  sessionID,
  parentSessionID: "ses_parent",
  parentMessageID: "msg_parent",
  parentAgent: "test-agent",
  description: "Test task",
  prompt: "Test prompt",
  agent: "explore",
  status: "running",
  startedAt,
  batchId: "batch_123",
  resumeCount: 0,
  isForked: false,
  ...overrides,
});

describe("Short ID Resolution", () => {
  describe("findTasksByPrefix", () => {
    test("finds tasks matching prefix", () => {
      const manager = new MockBackgroundManager();
      manager.addTask(createMockTask("ses_abc12345def", "2024-01-01T00:00:00Z"));
      manager.addTask(createMockTask("ses_abc99999xyz", "2024-01-01T00:01:00Z"));
      manager.addTask(createMockTask("ses_xyz12345abc", "2024-01-01T00:02:00Z"));

      const results = manager.findTasksByPrefix("ses_abc");
      expect(results).toHaveLength(2);
      // Should be sorted by most recent first
      expect(results[0].sessionID).toBe("ses_abc99999xyz");
      expect(results[1].sessionID).toBe("ses_abc12345def");
    });

    test("returns empty array when no matches", () => {
      const manager = new MockBackgroundManager();
      manager.addTask(createMockTask("ses_abc12345", "2024-01-01T00:00:00Z"));

      const results = manager.findTasksByPrefix("ses_xyz");
      expect(results).toHaveLength(0);
    });

    test("finds exact match", () => {
      const manager = new MockBackgroundManager();
      const fullId = "ses_abc12345def67890";
      manager.addTask(createMockTask(fullId, "2024-01-01T00:00:00Z"));

      const results = manager.findTasksByPrefix(fullId);
      expect(results).toHaveLength(1);
      expect(results[0].sessionID).toBe(fullId);
    });
  });

  describe("resolveTaskId", () => {
    test("resolves exact full ID", () => {
      const manager = new MockBackgroundManager();
      const fullId = "ses_41e080918ffeyhQtX6E4vERe4O";
      manager.addTask(createMockTask(fullId, "2024-01-01T00:00:00Z"));

      const resolved = manager.resolveTaskId(fullId);
      expect(resolved).toBe(fullId);
    });

    test("resolves short ID (8 char prefix)", () => {
      const manager = new MockBackgroundManager();
      const fullId = "ses_41e080918ffeyhQtX6E4vERe4O";
      manager.addTask(createMockTask(fullId, "2024-01-01T00:00:00Z"));

      const resolved = manager.resolveTaskId("ses_41e08091");
      expect(resolved).toBe(fullId);
    });

    test("resolves shorter prefix", () => {
      const manager = new MockBackgroundManager();
      const fullId = "ses_41e080918ffeyhQtX6E4vERe4O";
      manager.addTask(createMockTask(fullId, "2024-01-01T00:00:00Z"));

      const resolved = manager.resolveTaskId("ses_41e0");
      expect(resolved).toBe(fullId);
    });

    test("returns most recent task on ambiguous prefix", () => {
      const manager = new MockBackgroundManager();
      const oldTask = "ses_abc12345older";
      const newTask = "ses_abc12345newer";
      manager.addTask(createMockTask(oldTask, "2024-01-01T00:00:00Z"));
      manager.addTask(createMockTask(newTask, "2024-01-01T00:01:00Z"));

      // Ambiguous prefix - should return most recent
      const resolved = manager.resolveTaskId("ses_abc12345");
      expect(resolved).toBe(newTask);
    });

    test("returns null when no match found", () => {
      const manager = new MockBackgroundManager();
      manager.addTask(createMockTask("ses_abc12345", "2024-01-01T00:00:00Z"));

      const resolved = manager.resolveTaskId("ses_xyz");
      expect(resolved).toBeNull();
    });

    test("returns null for empty manager", () => {
      const manager = new MockBackgroundManager();

      const resolved = manager.resolveTaskId("ses_abc");
      expect(resolved).toBeNull();
    });

    test("prefers exact match over prefix match", () => {
      const manager = new MockBackgroundManager();
      const shortId = "ses_abc";
      const longerId = "ses_abc12345";
      manager.addTask(createMockTask(shortId, "2024-01-01T00:00:00Z"));
      manager.addTask(createMockTask(longerId, "2024-01-01T00:01:00Z"));

      // When exact match exists, use it (not prefix matching)
      const resolved = manager.resolveTaskId(shortId);
      expect(resolved).toBe(shortId);
    });
  });
});
