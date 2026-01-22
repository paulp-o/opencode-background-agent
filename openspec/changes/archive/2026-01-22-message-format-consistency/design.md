# Design: Message Format Consistency

## Context

Background task messages currently use inconsistent formats across launch, completion, and resume operations. This creates confusion for the AI agent and inconsistent UX. Additionally, session IDs are verbose and hard to work with.

**Stakeholders**: AI agents (primary users), plugin maintainers

## Goals / Non-Goals

**Goals**:
- Consistent message format across all notification types
- GitHub-style short IDs for better UX
- Cleaner launch messages without redundancy
- Toast notifications matching message style

**Non-Goals**:
- Changing the notification delivery mechanism
- Modifying tool behavior (only messages/IDs)
- Redesigning the entire messaging system

## Decisions

### Decision 1: Emoji + Bold Prefix Pattern

**What**: All notifications use emoji + bold markdown pattern:
- `✓ **Background task completed**`
- `✗ **Background task failed**`
- `⊘ **Background task cancelled**`

**Why**:
- Matches existing launch format (`⏳ **Background task launched**`)
- Emoji provides quick visual scanning
- Bold provides emphasis
- Consistent pattern across all states

### Decision 2: GitHub-Style Short IDs

**What**:
```typescript
// Full ID:    ses_41e080918ffeyhQtX6E4vERe4O
// Short ID:   ses_41e08091 (prefix + first 8 chars)

// Resolution: prefix match
getTask("ses_41e08091")     // works
getTask("ses_41e0")          // works if unique
getTask("ses_41e080918ffe")  // works (longer prefix)
```

**Why**:
- Shorter IDs are easier to read and type
- Prefix matching is familiar from git
- 8 chars provides good uniqueness for typical usage
- Agent types less, user sees cleaner output

### Decision 3: Ambiguity Resolution

**What**: When prefix matches multiple tasks, use most recently created task.

**Why**:
- Simple rule, no user interaction needed
- Most recent is usually what user wants
- Edge case (many similar IDs) is rare in practice

### Decision 4: Launch Message Simplification

**What**: Remove from launch message:
1. "Session ID" line (redundant after session-as-task-ID)
2. "Use `background_output` with task_id=..." instruction

**New format**:
```
⏳ **Background task launched**
Task ID: `ses_41e08091`

Task will run in background. You'll be notified when complete.
```

**Why**:
- Session ID = Task ID after persist-task-metadata change
- "Use background_output" instruction is in tool description already
- Cleaner, less confusing for agent

### Decision 5: Resume Count Display

**What**: Show resume count only if > 1.
- First resume: `✓ **Resume completed**`
- Second+ resume: `✓ **Resume #2 completed**`

**Why**:
- First resume doesn't need count (obvious)
- Count helps track multi-resume conversations
- Consistent with existing resumeCount > 1 logic elsewhere

### Decision 6: Toast Title Matching

**What**: Update toast titles to match message prefix style.
- Before: `title: "Background Task COMPLETED"`
- After: `title: "✓ Task completed"`

**Why**:
- Consistency between toast and chat message
- Shorter, cleaner toast titles

## Message Format Reference

### Launch (tool output)
```
⏳ **Background task launched**
Task ID: `ses_41e08091`

Task will run in background. You'll be notified when complete.
```

### Completion (injected message)
```
✓ **Background task completed**
Task "Research X" finished in 5s.
Batch progress: 1/1 tasks complete, 0 still running.
If you need results immediately, use background_output(task_id="ses_41e08091").
Otherwise, continue working or just say 'waiting' and halt.
```

### Error (injected message)
```
✗ **Background task failed**
Task "Research X" failed after 3s.
Batch progress: 1/2 tasks complete, 1 still running.
Use background_output(task_id="ses_41e08091") for error details.
```

### Resume Complete (injected message)
```
✓ **Resume completed**
Task "Research X" resume finished.
Use background_output(task_id="ses_41e08091") for full response.
```

### Resume #2+ (injected message)
```
✓ **Resume #2 completed**
Task "Research X" resume finished.
Use background_output(task_id="ses_41e08091") for full response.
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking change for agents parsing messages | Version bump, clear changelog |
| Short ID collision | 8 chars + most-recent-wins handles this |
| Prefix too short causes wrong task | 8 char minimum is reasonable |

## Open Questions

None - all clarified through user discussion.
