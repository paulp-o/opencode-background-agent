# OpenCode Background Agent

[![npm version](https://img.shields.io/npm/v/@paulp-o/opencode-background-agent)](https://www.npmjs.com/package/@paulp-o/opencode-background-agent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Async background tasks for OpenCode. Run multiple AI agents in parallel—just like Claude Code, but for OpenCode.**

[What is this?](#what-does-it-do) • [Quick Start](#-quick-start) • [Features](#-features) • [Tools](#-tools-provided)

---

## What does it do?

OpenCode Background Agent lets you spawn multiple AI agents that work **in parallel** while you continue your main conversation. Fire off a research task, a code review, and a documentation update—all running simultaneously in the background.

When tasks complete, you get notified. Check results when you're ready. No blocking, no waiting.

## Background

Modern AI coding workflows aren't sequential anymore. You're not waiting for one thing to finish before starting another—you're orchestrating multiple agents, each handling different parts of your codebase.

The problem? Most AI coding tools force you into a single-threaded conversation. One question, one answer, repeat.

This plugin brings **true parallel execution** to OpenCode:

- Spawn background agents for long-running tasks
- Continue your main conversation while they work  
- Get notified when tasks complete
- Retrieve results when you need them

Think of it as `&` for your AI workflow—run things in the background and come back to them later.

---

## 🚀 Quick Start

Add to your `opencode.json`:

```json
{
  "plugin": ["@paulp-o/opencode-background-agent"]
}
```

That's it. You now have 5 new tools available.

### Basic Usage

```typescript
// Fire off a background task
background_task(
  description: "Research authentication patterns",
  prompt: "Analyze the auth implementation in src/auth/",
  agent: "researcher"
)
// Returns immediately with task ID: ses_a1b2c3d4

// Continue working on other things...

// Check results when ready
background_output(task_id: "ses_a1b2")  // Short IDs work!
```

---

## ✨ Features

### 🔄 True Parallel Execution

Run 2, 5, 10 agents simultaneously. Each gets its own session, works independently, and reports back when done. Your main conversation never blocks.

### 🍴 Fork Context Inheritance

Pass your current conversation context to child agents with `fork: true`. They start with full awareness of what you've been discussing—no need to re-explain everything.

```typescript
background_task(
  prompt: "Continue investigating the memory leak",
  agent: "debugger",
  fork: true  // Child inherits parent conversation
)
```

### 💾 Persistent Tasks

Tasks survive plugin restarts. Come back hours later and your completed tasks are still there, ready for result retrieval. Task metadata persists at `~/.opencode/plugins/background-agent/tasks.json`.

### 🔔 Real-time Notifications

- **Toast notifications** when tasks complete, fail, or get cancelled
- **Progress tracking** with tool call counts
- **Spinner animations** for running tasks

### 🔑 GitHub-style Short IDs

No more copying 30-character IDs. Task IDs display in short format (`ses_a1b2c3d4`) and you can reference them with any unique prefix:

```typescript
background_output(task_id: "ses_a1b2")  // Works if unique
background_output(task_id: "ses_a1b2c3d4e5f6...")  // Full ID also works
```

### 🔁 Multi-turn Conversations

Resume completed tasks with follow-up prompts. The agent picks up right where it left off with full conversation history.

```typescript
// Initial task completes
background_task(resume: "ses_a1b2", prompt: "Now implement option B")
```

---

## 🤔 Why This vs. Manual Sequential Prompts?

| Without Background Agent | With Background Agent |
|-------------------------|----------------------|
| "Research X" → wait → "Now do Y" → wait → "Finally Z" | Fire all three, continue working, collect results |
| Context lost between prompts | Fork preserves full conversation context |
| One task at a time | True parallel execution |
| Blocking workflow | Non-blocking, async-first |

---

## 🛠 Tools Provided

### `background_task`
Launch a new background agent or resume an existing one.

| Parameter | Type | Description |
|-----------|------|-------------|
| `description` | string | Short description (shown in status) |
| `prompt` | string | Full prompt for the agent |
| `agent` | string | Agent type to use |
| `fork` | boolean | Inherit parent conversation context |
| `resume` | string | Task ID to resume (mutually exclusive with fork) |

### `background_output`
Retrieve task results.

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | Task ID (short or full) |
| `block` | boolean | Wait for completion (default: false) |
| `timeout` | number | Timeout in seconds when blocking (default: 120) |

### `background_list`
List all tasks from current session.

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter: "running", "completed", "error", "cancelled" |

### `background_cancel`
Cancel a running task.

| Parameter | Type | Description |
|-----------|------|-------------|
| `task_id` | string | Task ID to cancel |

### `background_clear`
Clear all tasks from memory (doesn't delete persisted metadata).

---

## 🚀 Roadmap

- [ ] Batch task launching (fire N tasks with one call)
- [ ] Task dependencies (run B after A completes)
- [ ] Priority queuing
- [ ] Resource limits (max concurrent tasks)
- [ ] Task templates

---

## Development

```bash
bun install        # Install dependencies
bun run build:all  # Build the project
bun test           # Run tests
bun run typecheck  # Type check
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Support

Issues, questions, or contributions → [GitHub repository](https://github.com/paulp-o/opencode-background-agent)
