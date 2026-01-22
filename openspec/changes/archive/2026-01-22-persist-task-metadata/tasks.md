# Tasks: Persist Task Metadata with Session ID as Task ID

## 1. Types & Constants
- [ ] 1.1 Add `STORAGE_DIR` and `TASKS_FILE` constants
- [ ] 1.2 Create `PersistedTask` interface for disk storage
- [ ] 1.3 Update `BackgroundTask` to use sessionID as id (remove separate id field)

## 2. Storage Module
- [ ] 2.1 Create `src/storage.ts` module
- [ ] 2.2 Implement `ensureStorageDir()` - create directory if not exists
- [ ] 2.3 Implement `loadTasks()` - read and parse tasks.json
- [ ] 2.4 Implement `saveTasks()` - atomic write (temp file + rename)
- [ ] 2.5 Implement `saveTask(task)` - save single task (read-modify-write)
- [ ] 2.6 Implement `getPersistedTask(sessionID)` - get single task from disk
- [ ] 2.7 Add error handling for corrupted/missing file

## 3. Manager Updates
- [ ] 3.1 Load persisted tasks on BackgroundManager construction
- [ ] 3.2 Update `launch()` to use sessionID as task id
- [ ] 3.3 Update `launch()` to persist task after creation
- [ ] 3.4 Update `getTask()` to check disk if not in memory
- [ ] 3.5 Update `checkAndUpdateTaskStatus()` to persist status changes
- [ ] 3.6 Update `clearAllTasks()` to only clear memory, not disk
- [ ] 3.7 Add `deleteTask(sessionID)` for permanent removal (future use)

## 4. Task Lifecycle Updates
- [ ] 4.1 Update `launchTask()` to return sessionID as id
- [ ] 4.2 Remove `bg_` prefix generation
- [ ] 4.3 Update task creation to persist immediately

## 5. Polling Updates
- [ ] 5.1 Update memory cleanup to not affect disk
- [ ] 5.2 Ensure status changes are persisted

## 6. Tool Updates
- [ ] 6.1 Update `background_task` output to show session ID format
- [ ] 6.2 Update `background_output` to load from disk if needed
- [ ] 6.3 Update `background_list` to optionally include persisted tasks
- [ ] 6.4 Update `background_clear` description (cancels, doesn't delete)
- [ ] 6.5 Update resume validation to check disk

## 7. Helper Updates
- [ ] 7.1 Update `formatTaskResult()` for new ID format
- [ ] 7.2 Update `formatTaskStatus()` for new ID format

## 8. Documentation
- [ ] 8.1 Update CHANGELOG.md with breaking change
- [ ] 8.2 Add migration guide (bg_* → ses_*)

## 9. Validation
- [ ] 9.1 Run `npm run build` successfully
- [ ] 9.2 Test task creation persists to disk
- [ ] 9.3 Test task survives memory clear
- [ ] 9.4 Test resume works after memory clear
- [ ] 9.5 Test plugin restart preserves tasks
