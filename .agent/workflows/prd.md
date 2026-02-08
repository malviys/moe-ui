---
description: Pick task from prd.json, implement it, commit changes & update progress
---

# PRD Workflow

## 1. Pick Task

// turbo

1. Read `docs/prd.json` to see all tasks
2. **Agent autonomously decides** the highest priority task where `passes: false`
   - Consider: dependencies, complexity, logical order, blockers
   - Once selected, **stick to this task until completion** - do not switch
3. Announce the selected task before beginning

## 2. Implement

1. Follow task requirements and acceptance criteria
2. Create/modify files as specified in the task

## 3. Verify

// turbo

1. Run typechecker:

```bash
bun run typecheck
```

1. Run tests (if applicable):

```bash
bun run test
```

1. Fix any errors before proceeding

## 4. Commit Changes

// turbo

```bash
git add .
git commit -m "<type>(<scope>): <description> [TASK-<id>]"
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `chore`

## 5. Update Progress

1. Set `passes: true` for the task in `docs/prd.json`
2. Append to `docs/progress.txt`:

```text
[COMPLETED] <timestamp> - Task: <task_name>
  - Summary: <what was done>
```

3. **Check remaining tasks:**
   - If there are more tasks with `passes: false` → Go back to **Step 1** and pick the next task
   - If ALL tasks have `passes: true` → Append to `docs/progress.txt`:

```text

****PROMISE FULFILLED****
```

---

## PRD Task Schema

```json
{
  "id": "task-001",
  "name": "Task Name",
  "description": "Description",
  "passes": false,
  "dependencies": [],
  "files": [],
  "acceptanceCriteria": []
}
```
