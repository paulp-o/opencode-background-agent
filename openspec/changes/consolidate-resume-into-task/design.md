# Design: Consolidate background_resume into background_task

## Context

The plugin currently exposes 7 background tools. The `background_resume` tool is conceptually a mode of `background_task` rather than a separate operation. Users must remember two different tool names for interacting with background sessions. This consolidation simplifies the mental model.

**Stakeholders**: Plugin users (AI agents), plugin maintainers

## Goals / Non-Goals

**Goals**:
- Reduce tool count from 7 to 6
- Unified API for task creation and resumption
- Maintain all existing functionality
- Clear, validated parameter handling
- TDD approach for reliability

**Non-Goals**:
- Adding new features beyond consolidation
- Changing the underlying manager implementation
- Migration tooling (users adapt directly)

## Decisions

### Decision 1: Strategy Pattern for Mode Handling

**What**: Tool layer detects mode and calls appropriate manager methods. Manager API unchanged.

**Why**: 
- Minimal changes to tested manager code
- Clear separation of concerns
- Tool handles UX, manager handles execution

**Alternatives considered**:
- Unified manager method: Would require more refactoring, higher risk
- Command pattern: Over-engineering for this use case

### Decision 2: Parameter Schema Design

**What**: 
```typescript
args: {
  resume: tool.schema.string().optional(),      // First: mode selector
  description: tool.schema.string().nonoptional(),
  prompt: tool.schema.string().nonoptional(),
  agent: tool.schema.string().nonoptional(),
}
```

**Behavior**:
- If `resume` is truthy → Resume mode (only `prompt` used)
- If `resume` is falsy → Launch mode (all params required)

**Why**:
- Simple truthy check for mode detection
- `prompt` serves dual purpose (launch prompt / resume message)
- Runtime validation keeps types simple

### Decision 3: Keep resume.ts as Helper Module

**What**: Convert `resume.ts` from tool factory to helper module with named exports.

**Why**:
- Preserves code organization
- Clear import structure: `import { validateResumeTask, executeResume } from './resume'`
- Easier to test helper functions in isolation

### Decision 4: Error Handling on Resume Failure

**What**: If resume fails mid-execution (after status set to 'resumed'), set status to 'error'.

**Why**:
- Clear indication something went wrong
- User can investigate via `background_output`
- Preferable to leaving in ambiguous 'resumed' state

### Decision 5: List Tool (resumed) Indicator

**What**: Show `(resumed)` after task ID when `resumeCount > 0`.

Example: `bg_abc123 (resumed)    completed    Explore codebase`

**Why**:
- Visual indicator of task history
- Leverages existing `resumeCount` field (no new types needed)
- Minimal output change

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Breaking change disrupts users | Major version bump, detailed CHANGELOG entry |
| Param validation edge cases | TDD approach catches issues early |
| Resume logic regression | Keep resume.ts as isolated helper, same tests apply |

## Open Questions

- None remaining after user clarification.
