import { countTokens } from "@anthropic-ai/tokenizer";
import { FORK_MAX_TOKENS, FORK_TOOL_PARAMS_LIMIT, FORK_TOOL_RESULT_LIMIT } from "../constants";

// =============================================================================
// Fork Context Processing Utilities
// =============================================================================

export interface SessionMessage {
  info?: { role?: string };
  parts?: Array<{
    type?: string;
    text?: string;
    // OpenCode ToolPart fields
    tool?: string;
    state?: { input?: Record<string, unknown> };
    // Legacy fields (kept for compatibility)
    name?: string;
    id?: string;
    input?: Record<string, unknown>;
  }>;
}

export interface ProcessingStats {
  originalCount: number;
  finalCount: number;
  totalTokens: number;
  truncatedResults: number;
  removedMessages: number;
}

function extractTextFromMessage(message: SessionMessage): string {
  if (!message.parts) return "";
  return message.parts
    .filter((p) => p.type === "text" && p.text)
    .map((p) => p.text!)
    .join("\n");
}

export function countMessageTokens(message: SessionMessage): number {
  try {
    const textContent = extractTextFromMessage(message);
    return countTokens(textContent);
  } catch {
    const textContent = extractTextFromMessage(message);
    return Math.ceil(textContent.length / 4);
  }
}

export function truncateToolResult(
  text: string,
  limit: number = FORK_TOOL_RESULT_LIMIT
): { text: string; wasTruncated: boolean } {
  if (text.length <= limit) {
    return { text, wasTruncated: false };
  }

  const truncated = text.slice(0, limit);
  const indicator = `\n[Tool result truncated - original ${text.length} chars]`;
  return {
    text: truncated + indicator,
    wasTruncated: true,
  };
}

function processMessage(message: SessionMessage, stats: ProcessingStats): SessionMessage {
  if (!message.parts) return message;

  const processedParts = message.parts.map((part) => {
    // Truncate long text in user messages
    if (part.type === "text" && part.text && message.info?.role === "user") {
      const result = truncateToolResult(part.text);
      if (result.wasTruncated) {
        stats.truncatedResults++;
        return { ...part, text: result.text };
      }
    }
    // Truncate tool_result content
    if (part.type === "tool_result" && part.text) {
      const result = truncateToolResult(part.text);
      if (result.wasTruncated) {
        stats.truncatedResults++;
        return { ...part, text: result.text };
      }
    }
    return part;
  });

  return { ...message, parts: processedParts };
}

export function processMessagesForFork(
  messages: SessionMessage[],
  maxTokens: number = FORK_MAX_TOKENS
): { messages: SessionMessage[]; stats: ProcessingStats } {
  const stats: ProcessingStats = {
    originalCount: messages.length,
    finalCount: messages.length,
    totalTokens: 0,
    truncatedResults: 0,
    removedMessages: 0,
  };

  const processedMessages = messages.map((msg) => processMessage(msg, stats));

  let totalTokens = 0;
  const tokenCounts: number[] = [];

  for (const msg of processedMessages) {
    const tokens = countMessageTokens(msg);
    tokenCounts.push(tokens);
    totalTokens += tokens;
  }

  stats.totalTokens = totalTokens;

  let result = processedMessages;
  let startIndex = 0;

  while (totalTokens > maxTokens && startIndex < result.length - 1) {
    totalTokens -= tokenCounts[startIndex] ?? 0;
    startIndex++;
    stats.removedMessages++;
  }

  if (startIndex > 0) {
    result = result.slice(startIndex);
  }

  stats.finalCount = result.length;
  stats.totalTokens = totalTokens;

  return { messages: result, stats };
}

/**
 * Formats processed messages into a context string for injection.
 */
export function formatMessagesAsContext(messages: SessionMessage[]): string {
  if (messages.length === 0) return "";

  const lines: string[] = ["<inherited_context>"];

  for (const msg of messages) {
    const role = msg.info?.role ?? "unknown";
    const roleLabel =
      role === "user"
        ? "User"
        : role === "assistant"
          ? "Agent"
          : role.charAt(0).toUpperCase() + role.slice(1);

    lines.push(`\n${roleLabel}:`);

    if (msg.parts) {
      for (const part of msg.parts) {
        if (part.type === "text" && part.text) {
          lines.push(part.text);
        } else if (part.type === "tool" && part.tool) {
          // OpenCode uses part.tool for name and part.state.input for params
          let paramsPreview = "";
          const input = part.state?.input;
          if (input) {
            const paramsStr = JSON.stringify(input);
            paramsPreview =
              paramsStr.length > FORK_TOOL_PARAMS_LIMIT
                ? ` ${paramsStr.slice(0, FORK_TOOL_PARAMS_LIMIT)}...`
                : ` ${paramsStr}`;
          }
          lines.push(`[Tool: ${part.tool}]${paramsPreview}`);
        } else if (part.type === "tool_result" && part.text) {
          // Include actual tool result content (already truncated by processMessage)
          lines.push(`[Tool result]\n${part.text}`);
        }
      }
    }
  }

  lines.push("\n</inherited_context>");
  return lines.join("\n");
}
