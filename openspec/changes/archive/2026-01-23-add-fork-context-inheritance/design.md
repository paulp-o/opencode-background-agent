# Design: Add Fork Context Inheritance for Background Tasks

## Context

Background tasks currently run with no knowledge of the parent agent's conversation history. This is inefficient for delegation scenarios where the child would benefit from knowing what has been discovered, discussed, or decided. OpenCode provides a native `session.fork` API that can create a new session inheriting history up to a specific message point.

**Stakeholders**: Plugin users (AI agents using background_task), plugin maintainers

## Goals / Non-Goals

**Goals**:
- Enable context inheritance from parent to child agent via new `fork` parameter
- Use OpenCode's native `session.fork` API for simplicity and reliability
- Implement smart truncation to keep forked context within token limits
- Maintain backward compatibility - existing behavior unchanged when `fork` is not set
- Provide clear indication when tasks are forked (for debugging and visibility)

**Non-Goals**:
- Custom context injection (using native fork instead)
- Configurable truncation thresholds (hardcoded defaults for MVP)
- Forking from arbitrary sessions (only from calling agent's session)
- Summarization-based context compression (raw history with truncation)

## Decisions

### Decision 1: Context Injection via session.create (REVISED)

**What**: Use `session.create` with `parentID` and inject parent context as a user message, rather than `session.fork` API.

**Why** (revised after testing):
- `session.fork` creates a standalone session without UI parent-child relationship
- Even with `session.update` to set `parentID`, forked sessions don't appear in OpenCode's subagent view or toast notifications
- `session.create` with `parentID` properly establishes UI hierarchy
- Context injection gives us full control over truncation and formatting

**Implementation**:
1. Create new session with `parentID` (ensures UI visibility)
2. Fetch parent session messages via `session.messages`
3. Process messages (truncate tool results >1500 chars, enforce 100k token limit)
4. Format as `<inherited_context>...</inherited_context>` block
5. Inject preamble + context as a single user message with `noReply: true`
6. Send task prompt

**Trade-offs**:
- Pro: UI visibility works correctly (toast, subagent view)
- Pro: Full control over context formatting and truncation
- Con: Context is text-based, not native message history
- Con: Slightly more code than `session.fork`

**Alternatives considered**:
- Native session.fork API: Tested but doesn't maintain UI parent-child relationship
- session.fork + session.update: Tested but forked sessions still appear standalone

### Decision 2: Smart Tool Result Truncation

**What**: Truncate tool results exceeding 1500 characters while preserving tool call structure (name, args, id).

**Format after truncation**:
```
[Tool result truncated - original {N} chars]
{first ~1500 chars of content}...
```

**Why**:
- Tool calls like `read_file` can return thousands of lines
- Preserving tool call structure helps child understand what was attempted
- Short results remain intact (no unnecessary truncation)
- 1500 chars is roughly 375 tokens - reasonable per-result budget

**Alternatives considered**:
- Full results: Too large, context bloat
- Shape only (no results): Loses too much information
- Configurable threshold: Added complexity for MVP

### Decision 3: Token-Based Context Limit at 100k

**What**: If total forked context exceeds 100,000 tokens, remove oldest messages until under limit.

**Why**:
- Claude's context window is typically 200k tokens
- 100k leaves ample room for child's response and new content
- Conservative default prevents context overflow errors
- Token counting via `@anthropic-ai/tokenizer` for accuracy

**Implementation**:
1. Fork session (gets full history)
2. Fetch messages from forked session
3. Calculate total tokens
4. If >100k, remove oldest messages iteratively
5. Send modified messages to child

**Note**: The session.fork creates a full copy - we process/trim after forking.

### Decision 4: System Message Preamble

**What**: Inject a system message informing the child agent about truncation:

```
You are working with forked context from a parent agent session.
Note: Some older tool results may have been truncated to save tokens.
If you need complete file contents or detailed results, re-read the files directly.
```

**Why**:
- Child agent needs to understand context may be incomplete
- Encourages re-reading files rather than relying on potentially truncated results
- Clear instruction improves child agent behavior

**Implementation**: Use `session.prompt` with `noReply: true` to inject system context before the task prompt.

### Decision 5: fork + resume Mutual Exclusion

**What**: Return error immediately if both `fork: true` and `resume: 'task_id'` are provided.

**Why**:
- `fork` creates a NEW session with copied context
- `resume` continues an EXISTING session
- These are fundamentally different operations
- Fail-fast prevents confusion

**Error message**: "Cannot use fork and resume together. Use fork for new tasks with context, resume for continuing existing tasks."

### Decision 6: Fork Indicator in Listings

**What**: Show `(forked)` after task ID in `background_list` when `isForked: true`.

**Example**: `ses_abc123 (forked)    completed    Analyze codebase`

**Why**:
- Visual indicator helps debugging
- Clear lineage tracking
- Consistent with existing `(resumed)` indicator pattern

### Decision 7: UI Parent-Child Relationship (Superseded by Decision 1 revision)

**Status**: OBSOLETE - No longer using `session.fork` API.

The context injection approach (revised Decision 1) uses `session.create` with `parentID` from the start, which properly establishes the UI parent-child relationship. No post-creation update needed.

### Decision 8: Resume Status in Progress Toast

**What**: Include tasks with `status === "resumed"` in the running tasks filter for toast notifications.

**Why**:
- Resumed tasks are actively running but were being excluded from the toast display
- Users couldn't see resumed task progress in the OpenCode UI
- "resumed" is semantically equivalent to "running" for UI purposes

## Data Flow (Revised)

```
background_task(fork: true, prompt: "Analyze X", agent: "explore")
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Validate: fork && resume → Error │
│ 2. Get parent sessionID from context│
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 3. Call session.create with parentID│
│    → Returns new child session      │
│    → UI hierarchy established       │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Fetch messages from PARENT       │
│ 5. Count tokens (anthropic tokenizer)
│ 6. If >100k: remove oldest messages │
│ 7. Truncate tool results >1500 chars│
│ 8. Format as <inherited_context>    │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 9. Inject preamble+context (noReply)│
│ 10. Send task prompt (promptAsync)  │
│ 11. Track task with isForked=true   │
└─────────────────────────────────────┘
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| Token counting accuracy | Wrong cutoff point | Use official `@anthropic-ai/tokenizer` library |
| Truncation loses critical info | Child misses important context | Preamble instructs to re-read files; preserve tool structure |
| Text-based context vs native history | Child sees formatted text, not native messages | Clear formatting with `<inherited_context>` tags; sufficient for understanding |
| Large conversations slow to process | Latency on fork | 100k limit caps processing; async operation |
| New dependency (@anthropic-ai/tokenizer) | Bundle size increase | ~1.1MB (WASM), essential for accuracy |

## Open Questions

None remaining - all decisions finalized through user consultation.
