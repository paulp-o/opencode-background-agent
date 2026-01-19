## ADDED Requirements

### Requirement: Background Task Creation
The system SHALL support launching background tasks that execute asynchronously without blocking the main conversation flow.

#### Scenario: Launch background task
- **WHEN** user requests a background task with description, prompt, and agent
- **THEN** system creates a new task with unique ID and sets status to "running"
- **AND** task includes parent session and message context for traceability

### Requirement: Task Status Management
The system SHALL maintain task status throughout the task lifecycle with four possible states: running, completed, error, cancelled.

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

### Requirement: Task Result Retrieval
The system SHALL allow retrieval of task results after completion, with configurable retention periods.

#### Scenario: Retrieve completed task results
- **WHEN** user requests results from a completed task
- **THEN** system returns the stored result data
- **AND** marks result as retrieved with timestamp

#### Scenario: Handle expired results
- **WHEN** task result exceeds retention duration
- **THEN** result is automatically cleaned up
- **AND** subsequent retrieval requests return appropriate not-found response

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