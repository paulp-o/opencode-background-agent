# Change: Consolidate background_block into background_output Tool

## Why

The current plugin has separate `background_output` (non-blocking) and `background_block` (blocking) tools. This was a refactor from the original design where `background_output` supported both modes via an optional `block` parameter. Consolidating back to a single tool simplifies the API surface from 6 tools to 5 and provides a more intuitive interface where users can optionally wait for results.

## What Changes

- **BREAKING** Remove standalone `background_block` tool entirely
- Add optional `block` parameter to `background_output` (default: false for backward compatibility)
- Add optional `timeout` parameter in seconds (default: 30, max: 600) for blocking mode
- When `block=true`, wait for task completion before returning
- When `block=false` (default), return immediately with current status (existing behavior)
- Update tool count from 6 to 5

## Impact

- Affected specs: `background-task`
- Affected code:
  - `src/tools/output.ts` - Add block and timeout parameters, implement blocking logic
  - `src/tools/block.ts` - Delete file
  - `src/tools/index.ts` - Remove `createBackgroundBlock` export
  - `src/index.ts` - Remove `background_block` from tool registration
  - `CHANGELOG.md` - Add to 2.0.0 breaking changes
