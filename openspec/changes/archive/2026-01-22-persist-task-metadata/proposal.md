# Change: Persist Task Metadata with Session ID as Task ID

## Why

Currently, background tasks are stored only in memory and automatically deleted 10 seconds after result retrieval. This breaks the resume functionality because the task metadata (description, agent, parentSessionID) is lost even though the actual session and chat history persist in OpenCode's storage.

By using session ID directly as the task ID and persisting minimal metadata to disk, we can:
1. Eliminate redundant ID mapping (bg_* → session ID)
2. Enable resume to work indefinitely (as long as session exists in OpenCode)
3. Survive plugin restarts
4. Keep the "clearing" behavior for toast UI purposes without losing task recoverability

## What Changes

- **BREAKING**: Task IDs change from `bg_*` format to session ID format (`ses_*`)
- Use session ID directly as task identifier (no more `bg_` prefix)
- Persist task metadata to `~/.opencode/plugins/background-agent/tasks.json`
- Load persisted tasks on plugin startup
- When task not found in memory, check disk before returning "not found"
- Memory clearing (for toast UI) no longer means permanent deletion
- `background_clear` cancels running tasks but does NOT delete from disk

## Impact

- Affected specs: `background-task`
- Affected code:
  - `src/types.ts` - Remove id field requirement (use sessionID)
  - `src/manager/task-lifecycle.ts` - Use sessionID as id, add persistence
  - `src/manager/index.ts` - Add load/save methods, modify getTask to check disk
  - `src/manager/polling.ts` - Memory clearing no longer deletes permanently
  - `src/tools/*.ts` - Update task ID references in output
  - `src/helpers.ts` - Update formatters for new ID format
  - `src/constants.ts` - Add storage path constant
