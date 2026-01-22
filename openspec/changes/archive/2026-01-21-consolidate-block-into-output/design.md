# Design: Consolidate background_block into background_output

## Context

The original implementation had blocking in `background_output`. This was later split into a separate `background_block` tool. User wants to revert to the simpler single-tool approach.

**Stakeholders**: Plugin users (AI agents), plugin maintainers

## Goals / Non-Goals

**Goals**:
- Reduce tool count from 6 to 5
- Maintain backward compatibility (block defaults to false)
- Simple, intuitive API
- Timeout in seconds for readability

**Non-Goals**:
- Supporting multiple task IDs (keep single task_id for simplicity)
- Adding new features beyond consolidation

## Decisions

### Decision 1: Parameter Design

**What**:
```typescript
args: {
  task_id: tool.schema.string().nonoptional(),
  block: tool.schema.boolean().optional(),   // default: false
  timeout: tool.schema.number().optional(),  // seconds, default: 30, max: 600
}
```

**Why**:
- `block` defaults to false for backward compatibility
- `timeout` in seconds is more readable than milliseconds
- Single task_id keeps API simple (unlike block tool's array)

### Decision 2: Timeout Behavior

**What**: Ignore `timeout` parameter when `block=false`

**Why**:
- Clear separation of concerns
- No confusing behavior when both params provided inconsistently
- Timeout only makes sense in blocking context

### Decision 3: Return Format

**What**: Same output format whether blocked or not

**Why**:
- Consistent API
- Callers don't need to handle different formats
- Simpler implementation

### Decision 4: Internal Implementation

**What**: Reuse existing `waitForTasks` mechanism from manager

**Why**:
- Proven blocking logic already exists
- Add thin `waitForTask(id, timeout)` wrapper for single task
- Minimizes new code

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking change (remove tool) | Add to 2.0.0 changelog, not released yet |
| Users relied on multi-task blocking | Rare use case, can call output multiple times |

## Open Questions

- None remaining after user clarification.
