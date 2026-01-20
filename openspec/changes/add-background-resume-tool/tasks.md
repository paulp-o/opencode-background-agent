# Tasks: Add background_resume Tool

## 1. Type System Updates
- [ ] 1.1 Add "resumed" to BackgroundTaskStatus type union
- [ ] 1.2 Add `resumeCount: number` field to BackgroundTask interface
- [ ] 1.3 Initialize `resumeCount: 0` in task creation (launch method)

## 2. Remove Session Expiration
- [ ] 2.1 Remove `RESULT_RETENTION_DURATION` constant (30 min timer)
- [ ] 2.2 Remove expiration logic from `pollRunningTasks` method
- [ ] 2.3 Update cleanup to only remove tasks on explicit clear or session end

## 3. Implement background_resume Tool
- [ ] 3.1 Create `createBackgroundResume(manager)` factory function
- [ ] 3.2 Define tool schema: task_id (required), message (required), block (optional), timeout (optional)
- [ ] 3.3 Implement validation: task exists, status is "completed"
- [ ] 3.4 Implement concurrent resume check (reject if status is "resumed")
- [ ] 3.5 Implement session validation (check session still exists)
- [ ] 3.6 Update task status to "resumed" before sending prompt
- [ ] 3.7 Increment `resumeCount` on resume
- [ ] 3.8 Send follow-up prompt via `client.session.prompt` or `promptAsync`
- [ ] 3.9 Implement blocking mode with configurable timeout
- [ ] 3.10 Implement async mode (return immediately, notify on completion)
- [ ] 3.11 Format and return only the new response (not full history)
- [ ] 3.12 Restore status to "completed" after response received

## 4. Notification Behavior Fix
- [ ] 4.1 Add `blockMode` tracking to identify blocking vs async calls
- [ ] 4.2 Modify `notifyParentSession` to skip notification when blocking
- [ ] 4.3 Apply fix to background_resume notifications
- [ ] 4.4 Apply same fix to background_output (if applicable)

## 5. Register New Tool
- [ ] 5.1 Add `background_resume: createBackgroundResume(manager)` to plugin exports
- [ ] 5.2 Update README.md with new tool documentation

## 6. Testing
- [ ] 6.1 Add unit test: background_resume tool exists in plugin exports
- [ ] 6.2 Add test: resume completed task succeeds
- [ ] 6.3 Add test: resume non-completed task returns error
- [ ] 6.4 Add test: concurrent resume returns error
- [ ] 6.5 Add test: resume with expired session returns error with hint
- [ ] 6.6 Add test: resumeCount increments correctly

## 7. Validation
- [ ] 7.1 Run `bun run typecheck` - no new type errors
- [ ] 7.2 Run `bun run lint` - no new lint errors
- [ ] 7.3 Run `bun test` - all tests pass
- [ ] 7.4 Run `bun run build` - build succeeds

## Dependencies

- Task 1 must complete before Task 3
- Task 2 can run in parallel with Task 1
- Task 3 must complete before Task 4
- Task 5 depends on Task 3
- Task 6 depends on Tasks 3-5
- Task 7 runs after all other tasks
