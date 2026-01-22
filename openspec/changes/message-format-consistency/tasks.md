# Tasks: Message Format Consistency

## 1. Short ID Infrastructure
- [ ] 1.1 Add `shortId(sessionId)` helper function in `src/helpers.ts`
  - Extract first 8 chars after `ses_` prefix
  - Return `ses_{8chars}` format
- [ ] 1.2 Add `resolveTaskId(idOrPrefix)` function in `src/manager/index.ts`
  - Accept full ID, short ID, or any unique prefix
  - Return full session ID or null if not found
  - On ambiguous prefix, return most recently created task
- [ ] 1.3 Add `findTasksByPrefix(prefix)` helper for resolution
- [ ] 1.4 Write unit tests for short ID resolution

## 2. Notification Format Updates
- [ ] 2.1 Update `notifyParentSession()` in `src/manager/notifications.ts`
  - Change prefix from `[BACKGROUND TASK COMPLETED]` to `✓ **Background task completed**`
  - Change error prefix to `✗ **Background task failed**`
  - Change cancelled prefix to `⊘ **Background task cancelled**`
  - Use short ID in message
- [ ] 2.2 Update `notifyResumeComplete()` in `src/manager/notifications.ts`
  - Change prefix to `✓ **Resume completed**`
  - Remove preview section entirely
  - Show resume count only if > 1: `✓ **Resume #N completed**`
  - Use short ID in message
- [ ] 2.3 Update `notifyResumeError()` in `src/manager/notifications.ts`
  - Change prefix to `✗ **Resume failed**`
  - Use short ID in message

## 3. Toast Notification Updates
- [ ] 3.1 Update `notifyParentSession()` toast title
  - Change from `Background Task ${statusText}` to `✓ Task completed` / `✗ Task failed` / `⊘ Task cancelled`
- [ ] 3.2 Update `showProgressToast()` title format for consistency

## 4. Launch Message Updates
- [ ] 4.1 Update launch message in `src/tools/task.ts`
  - Remove "Session ID" line
  - Remove "Use `background_output` with task_id=..." instruction
  - Use short ID format
- [ ] 4.2 Update resume initiation message format
  - Use short ID format

## 5. Tool Updates for Short ID Support
- [ ] 5.1 Update `createBackgroundOutput` in `src/tools/output.ts`
  - Accept short ID or prefix in task_id parameter
  - Use `resolveTaskId()` for lookup
- [ ] 5.2 Update `createBackgroundCancel` in `src/tools/cancel.ts`
  - Accept short ID or prefix
- [ ] 5.3 Update `createBackgroundTask` resume mode
  - Accept short ID or prefix in resume parameter
- [ ] 5.4 Update `createBackgroundList` in `src/tools/list.ts`
  - Display short IDs instead of full IDs

## 6. Helper Updates
- [ ] 6.1 Update `formatTaskResult()` to use short ID
- [ ] 6.2 Update `formatTaskStatus()` to use short ID

## 7. Documentation
- [ ] 7.1 Update CHANGELOG.md
  - Add message format changes to 2.0.0
  - Add short ID support
  - Note breaking change in message format
- [ ] 7.2 Update tool descriptions if needed

## 8. Validation
- [ ] 8.1 Run `npm run build` successfully
- [ ] 8.2 Test short ID resolution (exact, prefix, ambiguous)
- [ ] 8.3 Test notification format changes
- [ ] 8.4 Test toast title changes
- [ ] 8.5 Test launch message simplification
- [ ] 8.6 Test resume notification without preview
