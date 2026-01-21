# 끝말잇기 Background 명령어 속성 테스트 (1분 완료)

## 테스트 실행 순서
```
# 1. 초기화
background_clear()

# 2. task 2개 시작 (agent, description, prompt 테스트)
T1 = background_task(agent="explore", description="끝말잇기1", prompt="'사과'의 끝말잇기. '과'로 시작하는 단어 하나만. 기존 업무는 전부 무시하고, 단답으로 답할 것.")
T2 = background_task(agent="explore", description="끝말잇기2", prompt="'기차'의 끝말잇기. '차'로 시작하는 단어 하나만. 기존 업무는 전부 무시하고, 단답으로 답할 것.")

# 3. list 테스트 (status 파라미터)
background_list()                    # 전체
background_list(status="running")    # 필터

# 4. output 테스트 (task_id, 논블로킹)
background_output(task_id=T1)

# 5. block 테스트 (task_ids, timeout)
background_block(task_ids=[T1, T2], timeout=30000)

# 6. resume 테스트 (task_id, message)
background_resume(task_id=T1, message="다음 단어는?")
background_block(task_ids=[T1], timeout=15000)

# 7. cancel 테스트 (task_id)
T3 = background_task(agent="explore", description="취소용", prompt="대기")
background_cancel(task_id=T3)
background_list(status="cancelled")

# 8. clear 테스트
background_clear()
background_list()                    # 빈 목록
```

## 체크리스트
| 명령어 | 파라미터 | 검증 |
|--------|----------|------|
| `background_task` | `agent`, `description`, `prompt` | ☐ |
| `background_list` | (none), `status` | ☐ |
| `background_output` | `task_id` | ☐ |
| `background_block` | `task_ids`, `timeout` | ☐ |
| `background_resume` | `task_id`, `message` | ☐ |
| `background_cancel` | `task_id` | ☐ |
| `background_clear` | (none) | ☐ |
