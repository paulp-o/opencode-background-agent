## MODIFIED Requirements

### Requirement: Task Result Retrieval
The system SHALL allow retrieval of task results after completion, with tasks persisting until explicitly cleared or parent session ends. The `background_output` tool provides status and result retrieval with optional blocking capability.

#### Scenario: Retrieve completed task results (non-blocking)
- **WHEN** user calls `background_output` with task_id and block=false (or omitted)
- **THEN** system returns the stored result data immediately (non-blocking)
- **AND** marks result as retrieved with timestamp

#### Scenario: Check running task status (non-blocking)
- **WHEN** user calls `background_output` for a running task with block=false (or omitted)
- **THEN** system returns current status including progress information immediately

#### Scenario: Wait for task completion (blocking)
- **WHEN** user calls `background_output` with task_id and block=true
- **THEN** system waits until task completes, errors, or cancels
- **AND** returns the result in same format as non-blocking mode
- **AND** respects timeout parameter if provided

#### Scenario: Blocking with timeout
- **WHEN** user calls `background_output` with block=true and timeout=N seconds
- **THEN** system waits up to N seconds for task completion
- **AND** returns current status if timeout reached before completion

#### Scenario: Blocking with default timeout
- **WHEN** user calls `background_output` with block=true but no timeout
- **THEN** system uses default timeout of 30 seconds
- **AND** maximum allowed timeout is 600 seconds (10 minutes)

#### Scenario: Timeout ignored when not blocking
- **WHEN** user calls `background_output` with block=false and timeout provided
- **THEN** system ignores the timeout parameter
- **AND** returns immediately with current status

#### Scenario: Task persistence
- **WHEN** a task completes
- **THEN** task persists in memory until explicitly cleared via background_clear
- **OR** until the parent session ends or is deleted

## REMOVED Requirements

### Requirement: Explicit Task Blocking
**Reason**: The `background_block` tool is being removed. Blocking functionality is now integrated into `background_output` with the optional `block` and `timeout` parameters.
**Migration**: Use `background_output(task_id: 'id', block: true, timeout: 30)` instead of `background_block(task_ids: ['id'], timeout: 30000)`.

## MODIFIED Requirements

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
