# Tasks: Modularize Codebase

## 1. Setup New File Structure
- [ ] 1.1 Create `src/types.ts` with all type definitions
- [ ] 1.2 Create `src/constants.ts` with constants
- [ ] 1.3 Create `src/helpers.ts` with formatting utilities
- [ ] 1.4 Create `src/manager/` directory
- [ ] 1.5 Create `src/tools/` directory

## 2. Split BackgroundManager Class
- [ ] 2.1 Create `src/manager/index.ts` with class shell and constructor
- [ ] 2.2 Extract task lifecycle methods to `src/manager/task-lifecycle.ts`
- [ ] 2.3 Extract polling logic to `src/manager/polling.ts`
- [ ] 2.4 Extract notification methods to `src/manager/notifications.ts`
- [ ] 2.5 Extract event handling to `src/manager/events.ts`
- [ ] 2.6 Wire up imports in manager/index.ts

## 3. Split Tool Factories
- [ ] 3.1 Create `src/tools/task.ts` with createBackgroundTask
- [ ] 3.2 Create `src/tools/output.ts` with createBackgroundOutput
- [ ] 3.3 Create `src/tools/cancel.ts` with createBackgroundCancel
- [ ] 3.4 Create `src/tools/resume.ts` with createBackgroundResume
- [ ] 3.5 Create `src/tools/list.ts` with createBackgroundList
- [ ] 3.6 Create `src/tools/clear.ts` with createBackgroundClear
- [ ] 3.7 Create `src/tools/index.ts` barrel export

## 4. Update Plugin Entry Point
- [ ] 4.1 Refactor `src/index.ts` to import from new modules
- [ ] 4.2 Re-export types for consumers
- [ ] 4.3 Verify plugin function signature unchanged

## 5. Update Build Configuration
- [ ] 5.1 Update build script to add `--minify` flag
- [ ] 5.2 Update build script to add `--sourcemap linked` flag
- [ ] 5.3 Update `tsconfig.json` for multi-file declaration output
- [ ] 5.4 Verify single-file bundle output still works

## 6. Migrate Tests
- [ ] 6.1 Create `src/manager/__tests__/` directory
- [ ] 6.2 Create `src/tools/__tests__/` directory
- [ ] 6.3 Split existing tests by module
- [ ] 6.4 Add unit tests for individual modules
- [ ] 6.5 Keep integration test in `src/__tests__/index.test.ts`

## 7. Validation
- [ ] 7.1 Run `bun run typecheck` - no errors
- [ ] 7.2 Run `bun run lint` - no new errors
- [ ] 7.3 Run `bun test` - all tests pass
- [ ] 7.4 Run `bun run build` - single file output
- [ ] 7.5 Verify bundle size reduced with minification
- [ ] 7.6 Test plugin works in OpenCode

## 8. Cleanup
- [ ] 8.1 Remove any dead code from original index.ts
- [ ] 8.2 Update imports in any remaining files
- [ ] 8.3 Final review of file sizes (all < 200 lines)

## Dependencies

- Task 1 must complete before Tasks 2-4
- Tasks 2, 3 can run in parallel after Task 1
- Task 4 depends on Tasks 2, 3
- Task 5 can run in parallel with Tasks 2-4
- Task 6 depends on Tasks 2-4
- Task 7 depends on all previous tasks
- Task 8 runs after Task 7 passes
