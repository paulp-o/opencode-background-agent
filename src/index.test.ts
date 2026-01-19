import { test, expect, describe } from "bun:test";
import plugin from "./index";

describe("Background Agent Plugin", () => {
  test("should export a default function", () => {
    expect(plugin).toBeInstanceOf(Function);
  });

  test("should return an object with tool property when called", async () => {
    const mockContext = {
      client: {
        event: { subscribe: async () => ({ stream: [] }) },
        session: {
          create: async () => ({ data: { id: "test" } }),
          status: async () => ({ data: {} }),
          messages: async () => ({ data: [] }),
          get: async () => ({ data: {} }),
          abort: async () => ({}),
          prompt: async () => ({}),
          promptAsync: async () => ({}),
        },
      },
      directory: "/test",
    };

    const result = await plugin(mockContext);

    expect(result).toBeObject();
    expect(result).toHaveProperty("tool");
    expect(result.tool).toBeObject();
  });

  test("should export all expected tools", async () => {
    const mockContext = {
      client: {
        event: { subscribe: async () => ({ stream: [] }) },
        session: {
          create: async () => ({ data: { id: "test" } }),
          status: async () => ({ data: {} }),
          messages: async () => ({ data: [] }),
          get: async () => ({ data: {} }),
          abort: async () => ({}),
          prompt: async () => ({}),
          promptAsync: async () => ({}),
        },
      },
      directory: "/test",
    };

    const result = await plugin(mockContext);

    expect(result.tool).toHaveProperty("background_task");
    expect(result.tool).toHaveProperty("background_output");
    expect(result.tool).toHaveProperty("background_cancel");
    expect(result.tool).toHaveProperty("background_list");
    expect(result.tool).toHaveProperty("background_clear");
  });

  test("should return an object with event property", async () => {
    const mockContext = {
      client: {
        event: { subscribe: async () => ({ stream: [] }) },
        session: {
          create: async () => ({ data: { id: "test" } }),
          status: async () => ({ data: {} }),
          messages: async () => ({ data: [] }),
          get: async () => ({ data: {} }),
          abort: async () => ({}),
          prompt: async () => ({}),
          promptAsync: async () => ({}),
        },
      },
      directory: "/test",
    };

    const result = await plugin(mockContext);

    expect(result).toHaveProperty("event");
    expect(result.event).toBeInstanceOf(Function);
  });
});
