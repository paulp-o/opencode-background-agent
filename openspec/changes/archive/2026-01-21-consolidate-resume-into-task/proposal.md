# Change: Consolidate background_resume into background_task Tool

## Why

The current plugin exposes separate `background_task` and `background_resume` tools, but these represent two modes of the same conceptual operation: interacting with background agent sessions. Consolidating them reduces cognitive load for users, simplifies the API surface from 7 tools to 6, and aligns with the principle that "resume" is just another way to "task" an existing session.

## What Changes

- **BREAKING** Remove standalone `background_resume` tool entirely
- Add optional `resume` parameter to `background_task` tool for resuming existing tasks
- When `resume` is provided, the `prompt` parameter serves as the follow-up message
- Update `background_list` to show `(resumed)` indicator after task ID when `resumeCount > 0`
- Update `background_block` tool description to emphasize "emergency only" usage
- Update tool references in AGENTS.md and other documentation
- Major version bump due to breaking change

## Impact

- Affected specs: `background-task`
- Affected code:
  - `src/tools/task.ts` - Add resume mode handling
  - `src/tools/resume.ts` - Convert to helper module with named exports
  - `src/tools/list.ts` - Add `(resumed)` indicator to task IDs
  - `src/tools/block.ts` - Update description for "emergency only" emphasis
  - `src/tools/output.ts` - Review and update docs if needed
  - `src/index.ts` - Remove `background_resume` from tool exports
  - `src/types.ts` - Extend `LaunchInput` with optional `resume` field
  - `AGENTS.md` - Update references to use `background_task(resume:...)`
  - `CHANGELOG.md` - Detailed breaking change entry
