## MODIFIED Requirements

### Requirement: Fork Context Inheritance

The system SHALL support forking parent agent context to child background tasks via an optional `fork` parameter, enabling context-aware delegation without losing conversation history.

#### Scenario: Launch forked background task

- **WHEN** user calls superagents_task with `fork: true` and valid prompt/agent
- **THEN** system calls OpenCode's session.fork API to create new session with inherited history
- **AND** system processes forked context (truncates tool results, enforces token limit)
- **AND** system injects preamble informing child about potential truncation
- **AND** task is created with `isForked: true` flag
- **AND** system returns task ID immediately (non-blocking)

#### Scenario: Fork with context truncation

- **WHEN** forked context contains tool results exceeding 1500 characters
- **THEN** system truncates those results while preserving tool call structure (name, args, id)
- **AND** truncated results include original length indicator

#### Scenario: Fork with token limit enforcement

- **WHEN** forked context total exceeds 100,000 tokens
- **THEN** system removes oldest messages until context is under limit
- **AND** most recent messages are preserved

#### Scenario: Reject fork with resume

- **WHEN** user calls superagents_task with both `fork: true` AND `resume: taskId`
- **THEN** system returns error immediately
- **AND** error message explains fork and resume are mutually exclusive

#### Scenario: Fork indicator in task list

- **WHEN** user calls superagents_list
- **AND** a task has `isForked: true`
- **THEN** system shows `(forked)` indicator after the task ID

#### Scenario: Fork context role label format

- **WHEN** forked context is formatted for child agent
- **THEN** user messages are labeled with `User:` prefix
- **AND** assistant messages are labeled with `Agent:` prefix

#### Scenario: Fork context tool call display

- **WHEN** forked context contains tool_use parts
- **THEN** system displays tool calls with name and parameter preview
- **AND** parameter preview is truncated to 200 characters with ellipsis if exceeded
- **AND** format is `[Tool: {name}] {params_preview}`
