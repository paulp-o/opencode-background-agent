# Tasks: Consolidate background_block into background_output

## 1. Output Tool Update
- [x] 1.1 Add `block` optional boolean parameter (default: false)
- [x] 1.2 Add `timeout` optional number parameter (seconds, default: 30, max: 600)
- [x] 1.3 Update tool description to document blocking capability
- [x] 1.4 Implement blocking logic:
  - [x] 1.4.1 If block=false, return immediately (existing behavior)
  - [x] 1.4.2 If block=true, call manager.waitForTask() until completion or timeout
  - [x] 1.4.3 Ignore timeout parameter when block=false
  - [x] 1.4.4 Convert timeout from seconds to milliseconds internally
- [x] 1.5 Return same format whether blocked or not
- [x] 1.6 Use skipNotification=true during blocking wait

## 2. Manager Update
- [x] 2.1 Add `waitForTask(taskId, timeoutMs)` method (single task variant)
- [x] 2.2 Leverage existing waitForTasks implementation internally

## 3. Remove Block Tool
- [x] 3.1 Delete `src/tools/block.ts` file
- [x] 3.2 Remove `createBackgroundBlock` from `src/tools/index.ts` exports
- [x] 3.3 Remove `background_block` from `src/index.ts` tool registration
- [x] 3.4 Remove `createBackgroundBlock` import from `src/index.ts`

## 4. Documentation
- [x] 4.1 Update CHANGELOG.md 2.0.0 entry:
  - [x] 4.1.1 Add removal of background_block to breaking changes
  - [x] 4.1.2 Add block/timeout params to background_output
  - [x] 4.1.3 Update migration section
- [x] 4.2 Update AGENTS.md if it references background_block (N/A - no references found)

## 5. Validation
- [x] 5.1 Run `npm run build` successfully
- [x] 5.2 Run `openspec validate consolidate-block-into-output --strict`
- [x] 5.3 Test non-blocking mode (block=false or omitted) - manual test after OpenCode restart
- [x] 5.4 Test blocking mode (block=true with various timeouts) - manual test after OpenCode restart
