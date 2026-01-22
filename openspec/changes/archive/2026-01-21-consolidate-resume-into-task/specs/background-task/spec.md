## MODIFIED Requirements

### Requirement: Background Task Creation
The system SHALL support launching background tasks that execute asynchronously without blocking the main conversation flow. The `background_task` tool supports two modes: launch mode for new tasks and resume mode for continuing completed tasks.

#### Scenario: Launch background task
- **WHEN** user requests a background task with description, prompt, and agent (no resume param)
- **THEN** system creates a new task with unique ID and sets status to "running"
- **AND** task includes parent session and message context for traceability

#### Scenario: Resume existing task
- **WHEN** user calls background_task with resume param (task ID) and prompt
- **THEN** system validates task exists and is in "completed" status
- **AND** system sends prompt as follow-up message to existing session
- **AND** returns confirmation with Task ID (non-blocking)

#### Scenario: Mode detection
- **WHEN** user provides truthy resume parameter
- **THEN** system uses resume mode (prompt required, description/agent ignored)
- **WHEN** user does not provide resume parameter or it is falsy
- **THEN** system uses launch mode (description, prompt, agent all required)

#### Scenario: Resume with extra parameters warning
- **WHEN** user provides resume param along with agent or description
- **THEN** system proceeds with resume mode
- **AND** warns user that agent/description are ignored in resume mode

### Requirement: Task Conversation Resumption
The system SHALL support resuming conversations with completed background tasks via the `background_task(resume: taskId, prompt: message)` interface. Resumes are notification-based (non-blocking) consistent with task creation.

#### Scenario: Resume completed task with follow-up prompt
- **WHEN** user calls background_task with resume param for a completed task
- **THEN** system validates session exists
- **AND** sends the prompt to the task's existing session
- **AND** returns immediately with confirmation (non-blocking)
- **AND** subagent receives the message with full conversation history

#### Scenario: Resume completion notification
- **WHEN** subagent finishes processing resume request
- **THEN** system sends notification to parent session with full response
- **AND** task status returns to "completed"

#### Scenario: Resume validation - task not found
- **WHEN** user provides resume param with non-existent task ID
- **THEN** system returns error: "Task not found: {id}. Use background_list to see available tasks."

#### Scenario: Resume validation - wrong status
- **WHEN** user attempts to resume a task with status other than "completed"
- **THEN** system returns detailed error: "Only completed tasks can be resumed. Current status: {status}"

#### Scenario: Resume validation - concurrent resume (first wins)
- **WHEN** user attempts to resume a task that is currently being resumed (status="resumed")
- **THEN** system returns error: "Task is currently being resumed. Wait for completion."

#### Scenario: Resume validation - expired session
- **WHEN** user attempts to resume a task whose session no longer exists
- **THEN** system returns error about expired session

#### Scenario: Resume validation - empty prompt
- **WHEN** user provides resume param but prompt is empty or whitespace-only
- **THEN** system returns error: "Prompt is required when resuming a task"

#### Scenario: Resume failure sets error status
- **WHEN** resume fails mid-execution after status was set to "resumed"
- **THEN** system sets task status to "error" with error details

#### Scenario: Resume response format
- **WHEN** resume is initiated successfully
- **THEN** response includes Task ID for reference
- **AND** shows resume count only if greater than 1

## ADDED Requirements

### Requirement: Task List Resume Indicator
The system SHALL indicate in task listings when a task has been resumed, providing visual distinction for tasks with conversation history.

#### Scenario: Show resumed indicator
- **WHEN** user calls background_list
- **AND** a task has resumeCount greater than 0
- **THEN** system appends "(resumed)" after the task ID in the listing

#### Scenario: No indicator for new tasks
- **WHEN** user calls background_list
- **AND** a task has resumeCount equal to 0
- **THEN** system shows task ID without any indicator

## MODIFIED Requirements

### Requirement: Explicit Task Blocking
The system SHALL provide an explicit blocking mechanism via `background_block` tool that waits for specified tasks to complete. This tool is intended for emergency use only when the workflow absolutely MUST wait.

#### Scenario: Block until tasks complete
- **WHEN** user calls `background_block` with array of task_ids
- **THEN** system filters out already-completed tasks
- **AND** blocks until all remaining tasks complete or timeout is reached
- **AND** returns status summary of all specified tasks

#### Scenario: All tasks already completed
- **WHEN** user calls `background_block` with task_ids where all tasks are already completed
- **THEN** system returns immediately with status summary (no blocking)

#### Scenario: Block timeout reached
- **WHEN** blocking timeout is reached before all tasks complete
- **THEN** system returns status summary showing which tasks completed vs still running

#### Scenario: Block after resume
- **WHEN** user calls `background_task(resume:...)` then `background_block` with same task_id
- **THEN** system blocks until resume response is received
- **AND** returns status summary including the resumed task


