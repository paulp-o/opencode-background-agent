# Design: Persist Task Metadata with Session ID as Task ID

## Context

Background tasks currently live only in memory and are deleted 10 seconds after result retrieval. The session and chat history persist in OpenCode, but our plugin loses track of which sessions are background tasks. This breaks resume functionality.

**Stakeholders**: Plugin users (AI agents), plugin maintainers

## Goals / Non-Goals

**Goals**:
- Resume works indefinitely (as long as session exists)
- Survive plugin/OpenCode restarts
- Simplify architecture (one ID instead of two)
- Keep toast UI clearing behavior (cosmetic, not destructive)

**Non-Goals**:
- Store full chat history (OpenCode already does this)
- Complex database (simple JSON file is sufficient)
- TTL/expiration logic (can add later if needed)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Disk Storage (persistent)                              │
│  ~/.opencode/plugins/background-agent/tasks.json        │
│  {                                                      │
│    "ses_abc123": {                                      │
│      "description": "Research task",                    │
│      "agent": "explore",                                │
│      "parentSessionID": "ses_xyz789",                   │
│      "createdAt": "2024-01-21T...",                     │
│      "status": "completed"                              │
│    }                                                    │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                    ↑ load on startup / when not in memory
                    ↓ save on task create/update
┌─────────────────────────────────────────────────────────┐
│  Memory (working state, can be cleared for UI)          │
│  Map<sessionID, BackgroundTask>                         │
│  - Full task object with progress, timestamps           │
│  - Cleared after timeout (toast UI cleanup)             │
│  - Reloaded from disk + OpenCode on demand              │
└─────────────────────────────────────────────────────────┘
                    ↓ session ID reference
┌─────────────────────────────────────────────────────────┐
│  OpenCode Session Storage (source of truth for chat)    │
│  - Actual conversation history                          │
│  - Managed entirely by OpenCode                         │
└─────────────────────────────────────────────────────────┘
```

## Decisions

### Decision 1: Session ID as Task ID

**What**: Use OpenCode's session ID directly instead of generating `bg_*` IDs

**Why**:
- Eliminates redundant mapping
- Session ID is already unique and persistent
- Simpler mental model (task = session)

**Trade-off**: Breaking change for existing users (IDs change format)

### Decision 2: Minimal Metadata on Disk

**What**: Store only fields not available from OpenCode:
```typescript
interface PersistedTask {
  description: string;
  agent: string;
  parentSessionID: string;
  createdAt: string;
  status: BackgroundTaskStatus;
  resumeCount?: number;
}
```

**Why**:
- OpenCode stores chat history, we don't duplicate
- Small file size, fast read/write
- Easy to inspect/debug

### Decision 3: Lazy Loading

**What**: Load task from disk only when not found in memory

**Why**:
- Memory stays lean (only active tasks)
- Disk read only when needed
- Cleared tasks can still be resumed

### Decision 4: Clear vs Delete

**What**: 
- `background_clear` = cancel running tasks, remove from memory (toast cleanup)
- Does NOT delete from disk
- Tasks remain resumable

**Why**:
- Clear is for UI cleanup, not permanent deletion
- User expectation: "clear the view" not "destroy history"
- Can add explicit `background_delete` later if needed

### Decision 5: Storage Location

**What**: `~/.opencode/plugins/background-agent/tasks.json`

**Why**:
- Follows OpenCode's data directory convention
- Plugin-specific namespace
- Easy to find and backup

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking change (ID format) | Major version bump, clear migration docs |
| Disk I/O performance | Async writes, debounce if needed |
| File corruption | Atomic writes (write temp, rename) |
| Stale tasks accumulate | Can add cleanup command later |

## Open Questions

- Should we validate session still exists in OpenCode before returning from disk?
- Add `background_delete` tool for permanent removal?
