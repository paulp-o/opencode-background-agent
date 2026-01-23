# Tasks: Add Fork Context Inheritance

## 1. Setup and Dependencies

- [x] 1.1 Add `@anthropic-ai/tokenizer` dependency to package.json
- [x] 1.2 Add fork-related constants to `src/constants.ts`:
  - `FORK_MAX_TOKENS = 100000`
  - `FORK_TOOL_RESULT_LIMIT = 1500`
- [x] 1.3 Add fork-related prompts/messages to `src/prompts.ts`:
  - Fork preamble system message
  - Fork+resume conflict error message

## 2. Type Definitions

- [x] 2.1 Extend `LaunchInput` interface in `src/types.ts` with `fork?: boolean`
- [x] 2.2 Add `isForked: boolean` field to `BackgroundTask` interface
- [x] 2.3 Add `isForked?: boolean` to `PersistedTask` for disk persistence

## 3. Context Processing Utilities

- [x] 3.1 Create `src/fork/index.ts` module for fork-related utilities
- [x] 3.2 Implement `countMessageTokens()` using @anthropic-ai/tokenizer
- [x] 3.3 Implement `truncateToolResult()` for results >1500 chars
- [x] 3.4 Implement `processMessagesForFork()`:
  - Count total tokens
  - Remove oldest messages if >100k tokens
  - Truncate verbose tool results
  - Return processed messages
- [ ] 3.5 Write unit tests for context processing utilities (deferred - utilities ready for use)

## 4. Fork Mode Implementation

- [x] 4.1 Update `createBackgroundTask()` in `src/tools/task.ts`:
  - Add `fork` parameter to schema
  - Add validation: error if `fork && resume` both truthy
- [x] 4.2 Fork mode implemented in `src/manager/task-lifecycle.ts`:
  - Two methods available via `FORK_METHOD` constant: "inject" (default) or "native"
  - "inject": session.create + context injection (UI works correctly)
  - "native": session.fork API (UI visibility issues)
- [x] 4.3 Update `launchTask()` in `src/manager/task-lifecycle.ts`:
  - Handle fork vs create session logic
  - Set `isForked: true` when fork mode
- [x] 4.4 Implement `formatMessagesAsContext()` in `src/fork/index.ts`:
  - Format messages as `<inherited_context>` block
  - Include tool_result content (not just placeholder)

## 5. Manager Integration

- [x] 5.1 Context injection approach (default):
  - Use `session.create` with `parentID` (ensures UI visibility)
  - Fetch parent messages via `session.messages`
  - Process and inject as user message with `noReply: true`
- [x] 5.2 Preamble + context injection integrated in `launchTask()`
- [x] 5.3 Update `persistTask()` to include `isForked` field

## 6. List Display Updates

- [x] 6.1 Update `src/tools/list.ts` to show `(forked)` indicator:
  - Check `task.isForked` 
  - Append `(forked)` after task ID in table row
  - Similar pattern to existing `(resumed)` indicator

## 7. Error Handling

- [x] 7.1 Add error handling for session.fork API failures
- [x] 7.2 Add error handling for token counting failures (fallback to char estimate)
- [x] 7.3 Add error handling for context processing edge cases:
  - Empty message history
  - Messages with missing parts

## 7b. UI Visibility Fixes

- [x] 7b.1 Fix forked tasks not appearing in OpenCode UI:
  - Context injection approach uses `session.create` with `parentID` (guaranteed UI visibility)
  - Native approach tries `session.update` after fork (may not work)
- [x] 7b.2 Fix preamble triggering AI response:
  - Use `noReply: true` in session.prompt for preamble injection
- [x] 7b.3 Fix resumed tasks not showing in progress toast:
  - Include `status === "resumed"` in runningTasks filter in notifications.ts
- [x] 7b.4 Fix tool_result content not being passed to forked context:
  - Include actual tool_result text in `formatMessagesAsContext()`
  - Apply truncation to tool_result parts in `processMessage()`

## 7c. List Tool Enhancement

- [x] 7c.1 Filter `background_list` to show only current session's children:
  - Get `toolContext.sessionID` in execute function
  - Filter tasks where `parentSessionID === currentSessionID`

## 8. Testing

- [x] 8.1 Updated test mocks to include `isForked` field
- [ ] 8.2 Unit tests for `truncateToolResult()` function (deferred)
- [ ] 8.3 Unit tests for `processMessagesForFork()` function (deferred)
- [ ] 8.4 Unit tests for token counting accuracy (deferred)
- [ ] 8.5 Integration test: fork mode creates new session with context (deferred)
- [ ] 8.6 Integration test: isForked flag persists correctly (deferred)

## 9. Documentation

- [x] 9.1 Update tool description in `src/prompts.ts` for background_task:
  - Document `fork` parameter
  - Explain fork vs resume difference
- [x] 9.2 Update README.md with fork feature documentation
- [x] 9.3 Update CHANGELOG.md with new feature entry

## Dependencies

- Tasks 1.x must complete before 3.x (tokenizer needed for counting) ✓
- Tasks 2.x must complete before 4.x and 5.x (types needed) ✓
- Tasks 3.x must complete before 4.2 and 5.2 (utilities needed) ✓
- Tasks 4.x and 5.x can proceed in parallel after dependencies met ✓
- Tasks 8.x can start as soon as relevant implementation tasks complete

## Implementation Notes

- Fork utilities in `src/fork/index.ts`: token counting, truncation, message formatting
- Default fork method is "inject" (context injection via session.create)
- Alternative "native" method available via `FORK_METHOD` constant (uses session.fork API)
- Context injection approach chosen because session.fork doesn't maintain UI parent-child relationship
- `background_list` now only shows tasks from current session (parent filtering)
- Some unit tests deferred to focus on core functionality
