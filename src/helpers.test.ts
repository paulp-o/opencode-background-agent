import { describe, expect, test } from "bun:test";
import { formatDuration, formatTaskStatus, getStatusIcon, shortId, truncateText } from "./helpers";
import type { BackgroundTask } from "./types";

describe("helpers", () => {
  describe("formatDuration", () => {
    test("formats seconds only", () => {
      const start = new Date("2024-01-01T00:00:00Z").toISOString();
      const end = new Date("2024-01-01T00:00:45Z").toISOString();
      expect(formatDuration(start, end)).toBe("45s");
    });

    test("formats minutes and seconds", () => {
      const start = new Date("2024-01-01T00:00:00Z").toISOString();
      const end = new Date("2024-01-01T00:02:30Z").toISOString();
      expect(formatDuration(start, end)).toBe("2m 30s");
    });

    test("formats hours, minutes and seconds", () => {
      const start = new Date("2024-01-01T00:00:00Z").toISOString();
      const end = new Date("2024-01-01T01:15:45Z").toISOString();
      expect(formatDuration(start, end)).toBe("1h 15m 45s");
    });

    test("uses current time when end is not provided", () => {
      const start = new Date(Date.now() - 5000).toISOString();
      const result = formatDuration(start);
      expect(result).toMatch(/^\d+s$/);
    });
  });

  describe("shortId", () => {
    test("converts full session ID to short format", () => {
      expect(shortId("ses_41e080918ffeyhQtX6E4vERe4O")).toBe("ses_41e08091");
    });

    test("handles session IDs with exactly 8 chars after prefix", () => {
      expect(shortId("ses_12345678")).toBe("ses_12345678");
    });

    test("handles session IDs with fewer than 8 chars after prefix", () => {
      expect(shortId("ses_1234")).toBe("ses_1234");
    });

    test("handles non-standard IDs by taking first 12 chars", () => {
      expect(shortId("bg_1234567890abcdef")).toBe("bg_123456789");
    });

    test("handles empty suffix after ses_ prefix", () => {
      expect(shortId("ses_")).toBe("ses_");
    });
  });

  describe("truncateText", () => {
    test("returns text unchanged if under maxLength", () => {
      expect(truncateText("hello", 10)).toBe("hello");
    });

    test("returns text unchanged if exactly maxLength", () => {
      expect(truncateText("hello", 5)).toBe("hello");
    });

    test("truncates and adds ellipsis if over maxLength", () => {
      expect(truncateText("hello world", 5)).toBe("hello...");
    });
  });

  describe("getStatusIcon", () => {
    test("returns correct icon for running", () => {
      expect(getStatusIcon("running")).toBe("⏳");
    });

    test("returns correct icon for completed", () => {
      expect(getStatusIcon("completed")).toBe("✓");
    });

    test("returns correct icon for error", () => {
      expect(getStatusIcon("error")).toBe("✗");
    });

    test("returns correct icon for cancelled", () => {
      expect(getStatusIcon("cancelled")).toBe("⊘");
    });

    test("returns correct icon for resumed", () => {
      expect(getStatusIcon("resumed")).toBe("↻");
    });
  });

  describe("formatTaskStatus", () => {
    const createMockTask = (overrides: Partial<BackgroundTask> = {}): BackgroundTask => ({
      sessionID: "ses_test123",
      parentSessionID: "ses_parent",
      parentMessageID: "msg_parent",
      parentAgent: "test-agent",
      description: "Test task description",
      prompt: "Test prompt",
      agent: "explore",
      status: "running",
      startedAt: new Date().toISOString(),
      batchId: "batch_123",
      resumeCount: 0,
      isForked: false,
      ...overrides,
    });

    test("includes task ID and description", () => {
      const task = createMockTask();
      const result = formatTaskStatus(task);
      expect(result).toContain(task.sessionID);
      expect(result).toContain(task.description);
    });

    test("includes running status note for running tasks", () => {
      const task = createMockTask({ status: "running" });
      const result = formatTaskStatus(task);
      expect(result).toContain("Running");
      expect(result).toContain("still in progress");
    });

    test("includes error message for error tasks", () => {
      const task = createMockTask({ status: "error", error: "Something went wrong" });
      const result = formatTaskStatus(task);
      expect(result).toContain("Failed");
      expect(result).toContain("Something went wrong");
    });

    test("includes cancelled note for cancelled tasks", () => {
      const task = createMockTask({ status: "cancelled" });
      const result = formatTaskStatus(task);
      expect(result).toContain("Cancelled");
    });

    test("includes last tools if available", () => {
      const task = createMockTask({
        progress: {
          toolCalls: 5,
          lastTools: ["read", "write", "bash"],
          lastUpdate: new Date().toISOString(),
        },
      });
      const result = formatTaskStatus(task);
      expect(result).toContain("read → write → bash");
    });
  });
});
