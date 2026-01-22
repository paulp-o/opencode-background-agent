# background-task Specification

## Purpose
TBD - created by archiving change define-project-specs. Update Purpose after archive.
## Requirements
### Requirement: Background Task Creation
The system SHALL support launching background tasks that execute asynchronously without blocking the main conversation flow.

#### Scenario: Launch background task
- **WHEN** user requests a background task with description, prompt, and agent
- **THEN** system creates a new task with unique ID and sets status to "running"
- **AND** task includes parent session and message context for traceability

### Requirement: Task Status Management
The system SHALL maintain task status throughout the task lifecycle with five possible states: running, completed, error, cancelled, resumed.

#### Scenario: Track task completion
- **WHEN** background task finishes successfully
- **THEN** status changes to "completed" and completion timestamp is recorded
- **AND** task result is stored for later retrieval

#### Scenario: Handle task errors
- **WHEN** background task encounters an error during execution
- **THEN** status changes to "error" and error details are captured
- **AND** error information is preserved for debugging

#### Scenario: Cancel running tasks
- **WHEN** user requests to cancel a running task
- **THEN** task status changes to "cancelled"
- **AND** any ongoing execution is terminated gracefully

#### Scenario: Track resumed status
- **WHEN** user resumes a completed task
- **THEN** status changes to "resumed" while processing the follow-up prompt
- **AND** status returns to "completed" when subagent response is received

### Requirement: Task Result Retrieval
The system SHALL allow retrieval of task results after completion, with tasks persisting until explicitly cleared or parent session ends. The `background_output` tool provides non-blocking status and result retrieval only.

#### Scenario: Retrieve completed task results
- **WHEN** user requests results from a completed task via `background_output`
- **THEN** system returns the stored result data immediately (non-blocking)
- **AND** marks result as retrieved with timestamp

#### Scenario: Check running task status
- **WHEN** user calls `background_output` for a running task
- **THEN** system returns current status including progress information (non-blocking)

#### Scenario: Task persistence
- **WHEN** a task completes
- **THEN** task persists in memory until explicitly cleared via background_clear
- **OR** until the parent session ends or is deleted

### Requirement: Task Progress Tracking
The system SHALL provide progress information for running tasks including tool call counts and recent activity.

#### Scenario: Monitor task progress
- **WHEN** user checks status of running task
- **THEN** system returns current progress including tool call count and recent tools used
- **AND** last update timestamp indicates task is still active

### Requirement: Batch Task Management
The system SHALL support grouping related tasks with batch identifiers for organizational purposes.

#### Scenario: Group related tasks
- **WHEN** multiple tasks are created as part of the same logical operation
- **THEN** they share the same batchId for correlation
- **AND** batch operations can be performed on all tasks in a batch

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

#### Scenario: Wait for resume response
- **WHEN** user needs to wait for resume response
- **THEN** user calls `background_output` with task_id and block=true
- **AND** system waits until response is received

#### Scenario: Reject resume of non-completed task
- **WHEN** user attempts to resume a task with status other than "completed"
- **THEN** system returns error indicating only completed tasks can be resumed

#### Scenario: Reject concurrent resume
- **WHEN** user attempts to resume a task that is currently being resumed (status="resumed")
- **THEN** system returns error indicating task is currently being resumed

#### Scenario: Handle expired session on resume
- **WHEN** user attempts to resume a task whose session no longer exists
- **THEN** system returns error with suggestion to start a new background_task

### Requirement: Resume Count Tracking
The system SHALL track the number of times each task has been resumed for visibility and debugging purposes.

#### Scenario: Increment resume count
- **WHEN** a task is successfully resumed
- **THEN** the task's resumeCount field is incremented by one

#### Scenario: Initial resume count
- **WHEN** a new task is created
- **THEN** the task's resumeCount is initialized to zero

### Requirement: Event-Based Completion Detection
The system SHALL use `session.idle` events as the primary mechanism for detecting task completion, with polling as a fallback.

#### Scenario: Detect completion via event
- **WHEN** background session emits `session.idle` event
- **THEN** system immediately marks corresponding task as completed
- **AND** sends notification to parent session with full result

#### Scenario: Fallback to polling
- **WHEN** `session.idle` event is missed (e.g., during reconnection)
- **THEN** polling mechanism detects completion within fallback interval
- **AND** sends notification to parent session with full result

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

