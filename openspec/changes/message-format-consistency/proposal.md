# Change: Message Format Consistency

## Why

Current notification messages use inconsistent formats:
- Launch: `⏳ **Background task launched**` (emoji + bold)
- Completion: `[BACKGROUND TASK COMPLETED]` (bracket prefix)
- Resume: `[BACKGROUND RESUME COMPLETED]` with preview section

This inconsistency confuses the agent and makes messages harder to parse. Additionally:
- Session IDs are too long for display (`ses_41e080918ffeyhQtX6E4vERe4O`)
- Launch message has redundant "Use background_output" instruction
- Resume notifications have unnecessary preview sections

## What Changes

### Message Format Unification
- **Success**: `✓ **Background task completed**` (emoji + bold)
- **Error**: `✗ **Background task failed**`
- **Cancelled**: `⊘ **Background task cancelled**`
- **Resume success**: `✓ **Resume completed**`
- **Resume error**: `✗ **Resume failed**`

### Short ID System (GitHub-style)
- Display short IDs: `ses_41e08091` (first 8 chars after prefix)
- Accept prefix matching for tool calls (like git commit hashes)
- Resolve ambiguous prefixes to most recent task
- All tools accept both short and full IDs

### Launch Message Simplification
- Remove redundant "Session ID" line (same as Task ID after persist-task-metadata)
- Remove "Use `background_output` with task_id=..." instruction (confusing, already in tool description)

### Resume Notification Cleanup
- Remove preview section entirely
- Show resume count only if > 1 (e.g., "Resume #2 completed")

### Toast Notification Updates
- Update toast titles to match message style (`✓ Task completed` vs `Background Task COMPLETED`)

## Impact

- Affected specs: `background-task`
- Affected code:
  - `src/manager/notifications.ts` - All notification formats
  - `src/tools/task.ts` - Launch message format
  - `src/tools/output.ts` - Accept short IDs
  - `src/tools/list.ts` - Display short IDs
  - `src/tools/cancel.ts` - Accept short IDs
  - `src/manager/index.ts` - Add short ID resolution
  - `src/helpers.ts` - Add short ID utilities
