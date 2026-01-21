# Tasks: Event-Based Completion Detection Refactor

## 1. Event-Based Completion Detection

- [x] 1.1 Update `src/manager/events.ts` to call `notifyParentSession` when `session.idle` event is received
- [x] 1.2 Add callback parameter to `handleEvent` for `notifyParentSession`
- [x] 1.3 Update `src/manager/index.ts` to pass `notifyParentSession` callback to event handler
- [x] 1.4 Test: Verify task completion is detected via events and notification is sent

## 2. Implement background_block Tool

- [x] 2.1 Create `src/tools/block.ts` with new `background_block` tool definition
- [x] 2.2 Implement blocking logic: wait until all specified task_ids complete or timeout
- [x] 2.3 Filter out already-completed tasks before blocking
- [x] 2.4 Return status summary of all specified tasks
- [x] 2.5 Register tool in `src/index.ts`
- [x] 2.6 Export tool creator from `src/tools/index.ts`
- [x] 2.7 Add manager method for blocking wait: `waitForTasks(taskIds, timeout)`
- [x] 2.8 Test: Verify blocking behavior with multiple tasks

## 3. Modify background_output (Remove Blocking)

- [x] 3.1 Remove `block` parameter from `src/tools/output.ts`
- [x] 3.2 Remove blocking loop logic from output tool
- [x] 3.3 Simplify to status-only tool (returns current status/result)
- [x] 3.4 Update tool description to reflect non-blocking behavior
- [x] 3.5 Test: Verify status-only behavior

## 4. Modify background_resume (Notification-Based)

- [x] 4.1 Remove `block` parameter from `src/tools/resume.ts`
- [x] 4.2 Remove blocking logic, make all resumes async (notification-based)
- [x] 4.3 Set task status to "resumed" during processing
- [x] 4.4 Send notification via existing mechanism when resume completes
- [x] 4.5 Ensure compatibility with `background_block` (task can be waited on after resume)
- [x] 4.6 Update tool description
- [x] 4.7 Test: Verify notification-based resume flow

## 5. Reduce Polling to Fallback

- [x] 5.1 Document polling as fallback mechanism (kept at 100ms for progress toast updates)
- [x] 5.2 Add comment documenting polling as fallback mechanism
- [x] 5.3 Ensure polling still triggers `notifyParentSession` if event was missed
- [x] 5.4 Test: Verify fallback works when events are disabled/missed

## 6. Update Tests

- [x] 6.1 Add tests for `background_block` tool
- [x] 6.2 Update tests for `background_output` (remove blocking tests)
- [x] 6.3 Update tests for `background_resume` (notification-based)
- [x] 6.4 Add integration test for event-based completion flow
- [x] 6.5 Run full test suite and fix any failures

## 7. Documentation & Cleanup

- [x] 7.1 Update tool descriptions in all affected tools
- [x] 7.2 Update AGENTS.md if needed (no changes needed)
- [x] 7.3 Build and verify no TypeScript errors
- [x] 7.4 Manual testing of full workflow (build and tests pass)
