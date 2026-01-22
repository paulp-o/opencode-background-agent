# Tasks: Consolidate background_resume into background_task

## 1. Tests (TDD - Write First)
- [ ] 1.1 Write unit tests for background_task launch mode (existing behavior)
- [ ] 1.2 Write unit tests for background_task resume mode (new behavior)
  - [ ] 1.2.1 Test: resume with valid task_id and prompt succeeds
  - [ ] 1.2.2 Test: resume without prompt returns error
  - [ ] 1.2.3 Test: resume with non-existent task_id returns error with suggestion
  - [ ] 1.2.4 Test: resume with task in wrong status returns detailed error
  - [ ] 1.2.5 Test: resume with currently-resuming task returns "first wins" error
  - [ ] 1.2.6 Test: resume with expired session returns error
  - [ ] 1.2.7 Test: resume with extra params (agent/description) logs warning
  - [ ] 1.2.8 Test: resume with empty/whitespace prompt returns validation error
- [ ] 1.3 Write unit tests for background_list (resumed) indicator
- [ ] 1.4 Write unit tests for mode detection logic

## 2. Types Update
- [x] 2.1 Extend `LaunchInput` type with optional `resume?: string` field
- [x] 2.2 Verify `resumeCount` field usage is sufficient (no new fields needed)

## 3. Resume Helper Module
- [x] 3.1 Refactor `resume.ts` to export named functions:
  - [x] 3.1.1 `validateResumeTask(task, taskId)` - validation logic
  - [x] 3.1.2 `executeResume(manager, task, prompt, toolContext)` - resume execution
- [x] 3.2 Remove the `createBackgroundResume` tool factory function
- [x] 3.3 Ensure helper functions match strategy pattern (manager methods unchanged)

## 4. Task Tool Update
- [x] 4.1 Add `resume` optional parameter to schema (first in param order)
- [x] 4.2 Implement mode detection: if `resume` is truthy, use resume mode
- [x] 4.3 Import named functions from resume.ts
- [x] 4.4 In resume mode:
  - [x] 4.4.1 Validate prompt is provided and non-empty after trim
  - [x] 4.4.2 Warn if agent/description are also provided
  - [x] 4.4.3 Call validation function, return detailed errors on failure
  - [x] 4.4.4 Call execute function with manager methods
  - [x] 4.4.5 Return unified response format with Task ID
  - [x] 4.4.6 Show resume count only if > 1
  - [x] 4.4.7 On error during execution, set task status to 'error'
- [x] 4.5 In launch mode: keep existing behavior (all params required)
- [x] 4.6 Update tool description: brief mention of resume capability

## 5. List Tool Update
- [x] 5.1 Modify output to append `(resumed)` after task ID when `resumeCount > 0`
- [x] 5.2 Update any relevant documentation in tool description

## 6. Block Tool Update
- [x] 6.1 Update description to emphasize "emergency only" usage
- [x] 6.2 Update reference from `background_resume` to `background_task(resume:...)`

## 7. Output Tool Review
- [x] 7.1 Review output.ts for any resume-specific logic or docs
- [x] 7.2 Update documentation if needed (no changes needed - already compatible)

## 8. Index/Exports Update
- [x] 8.1 Remove `background_resume` from tool exports in index.ts
- [x] 8.2 Remove `createBackgroundResume` import

## 9. Documentation
- [x] 9.1 Update AGENTS.md references to use `background_task(resume:...)`
- [x] 9.2 Add CHANGELOG.md entry with:
  - [x] 9.2.1 Breaking change notice
  - [x] 9.2.2 Migration instructions (use `background_task(resume: 'id', prompt: 'message')`)
  - [x] 9.2.3 List of affected tools

## 10. Validation
- [ ] 10.1 Run all unit tests, ensure passing
- [x] 10.2 Run `npm run build` successfully
- [x] 10.3 Run `openspec validate consolidate-resume-into-task --strict`
- [ ] 10.4 Manual smoke test of both modes
