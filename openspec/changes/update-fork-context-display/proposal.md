# Change: Update Fork Context Display Format

## Why

Forked context의 대화 내역 표시 형식이 읽기 어렵고 정보가 부족함:
1. `[USER]`, `[ASSISTANT]` 라벨이 불필요하게 verbose하고 대괄호가 가독성을 해침
2. Tool call이 이름만 표시되고 파라미터가 전혀 보이지 않아, child agent가 context를 이해하기 어려움

## What Changes

- **UPDATE**: Role label 형식 변경: `[USER]` → `User:`, `[ASSISTANT]` → `Agent:`
- **UPDATE**: Tool call 표시에 파라미터 정보 추가 (최대 200자, truncation 시 ellipsis)

### 변경 전 (현재)
```
<inherited_context>
[USER]
도구 2-3개 써봐
[ASSISTANT]
[Tool call: mcp_bash]
[Tool result]
...
</inherited_context>
```

### 변경 후
```
<inherited_context>
User:
도구 2-3개 써봐
Agent:
[Tool: mcp_bash] {"command": "pwd", "description": "현재 작업 디렉토리 확인"}
[Tool result]
...
</inherited_context>
```

## Impact

- Affected specs: `superagents-task` (Fork Context Inheritance requirement)
- Affected code: `src/fork/index.ts` - `formatMessagesAsContext()` function
