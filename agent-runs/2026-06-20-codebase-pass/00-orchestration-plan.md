# Orchestration Plan

## Mode Selection

- Repo: /Users/stephenbrown/Code/OPENSOURCE/spacesappai
- Branch: dev
- Work mode: full
- Run folder: /Users/stephenbrown/Code/OPENSOURCE/spacesappai/agent-runs/2026-06-20-codebase-pass
- Verifiable gates: git remote read, fast-forward sync, dry-run push, `npm run lint`, `npm run build`, source search evidence, targeted TypeScript/ESLint checks where available.
- Human-decision blockers: broad product prioritization, risky major dependency migrations, external Firebase/Liveblocks production credential decisions.
- Resume policy: resume from `run-state.md`, `task-queue.md`, latest pushed commit, and Git state; never guess from memory after interruption.

## Loop Plan

| Phase | Loop | Verify Gate | Stop Condition |
| --- | --- | --- | --- |
| Preflight and Repo Docs | Orchestration Planning Loop, Docs Sweep Loop | Docs match current repo and checks pass | Plan, state, queue, docs, and report pushed |
| Baseline Validation | Baseline Validation Loop, Quality Gate Selection Loop | Lint/build and dependency state are recorded | Baseline is clean or failures are classified |
| Findings Backlog | Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop | Evidence-backed backlog and scorecard | Backlog, scorecard, and queue are pushed |
| Execute Fixes and Improvements | Task Queue Loop, Fix Validation Loop | Highest-priority bug or cleanup task passes targeted gate and lint | Task is done, deferred, or blocked with evidence |
| Package and Dead-Code Cleanup | Package Cleanup Loop, Dead Code Loop | Safe package/dead-code actions pass lint/build or are deferred | Cleanup batch pushed or deferred |
| Review | Judge Loop | No P0/P1 findings, no unowned changes, branch synced | Review report pushed |
| Stabilization Loop | Stabilization Loop, Judge Loop | Completion criteria pass or real blocker recorded | Final stabilization report pushed |
| Integrator | Quality Gate Selection Loop, Commit-Push Checkpoint Loop | Final report pushed, clean tree, synced dev | Workflow complete or blocked |

## File Ownership

| Task | Owned Files | Notes |
| --- | --- | --- |
| T-001 | `AGENTS.md`, `spec.md`, `agent-runs/2026-06-20-codebase-pass/*` | Startup planning, current-state docs, and resume state |
| T-002 | `agent-runs/2026-06-20-codebase-pass/02-baseline-validation.md` | Baseline command results and classifications |
| T-003 | `agent-runs/2026-06-20-codebase-pass/03-findings-backlog.md`, `agent-runs/2026-06-20-codebase-pass/task-queue.md` | Evidence-backed backlog and scorecard |
| T-004 | `src/components/SearchDialog.tsx`, related tests/docs if needed | Fix confirmed search behavior bug |
| T-005 | package manifests, clearly unused source files only if proven | Safe package/dead-code cleanup |
