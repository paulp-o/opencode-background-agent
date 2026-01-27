# Tasks: Update Fork Context Display Format

## 1. Implementation

- [x] 1.1 Update role labels in `formatMessagesAsContext()`:
  - Change `[USER]` → `User:`
  - Change `[ASSISTANT]` → `Agent:`
- [x] 1.2 Add tool parameter display in tool_use formatting:
  - Extract and stringify parameters from tool_use parts
  - Truncate parameter string to 200 chars with ellipsis if exceeded
  - Format as `[Tool: {name}] {params_preview}`
- [x] 1.3 Add constant `FORK_TOOL_PARAMS_LIMIT = 200` to `src/constants.ts`

## 2. Testing

- [x] 2.1 Run existing tests: `npm test`
- [x] 2.2 Build project: `npm run build`
- [x] 2.3 Manual verification: test fork feature with Claude Code

## 3. Cleanup

- [x] 3.1 Update CHANGELOG.md with changes
