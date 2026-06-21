# Agent Report

## Agent

Name: Codex

## Scope

Built an evidence-backed findings backlog from baseline validation, source search, Firestore rules review, dependency diagnostics, and architecture/lean-code scoring. No source files were changed in this phase.

## Inputs

Baseline report, `firestore.rules`, `src/components/SearchDialog.tsx`, `src/components/InviteUser.tsx`, `src/components/ManageUsers.tsx`, `src/components/ShareMenu.tsx`, `src/hooks/use-comments.ts`, `src/lib/documentActions.ts`, `package.json`, `package-lock.json`, `npm audit`, `npm outdated`, and source search output.

## Branch and Push

- Branch: dev
- Upstream: origin/dev
- Commit: 0ba9a52bcb8ca57a8ffe512db20c197ee82d741e before phase edits
- Pushed to: pending phase checkpoint
- Sync status: local dev matched origin/dev before phase edits

## Loop

- Name: Findings Queue Loop, Architecture Fitness Loop, Lean Code Loop
- Goal: produce a prioritized backlog with evidence, ownership, and verification
- Verify gate: each finding has severity, evidence, proposed fix, and local verification
- Stop condition: highest-priority executable task is clear
- Attempt: 1/1
- Result: Backlog created; highest-priority executable task is comment rules hardening

## Run State

- Current phase: Findings Backlog
- Current task: T-003
- Last pushed commit: 0ba9a52bcb8ca57a8ffe512db20c197ee82d741e
- Next action: commit/push backlog, then fix comment Firestore rules
- Blockers: None

## Commands Run

```text
rg -n "allow (read|create|update|delete): if isAuthenticated\\(\\);|comments|canReadDocument|canWriteDocument" firestore.rules
rg -n "InviteUser|ManageUsers|SearchDialog|query|filteredDocs|documents\\.viewer|useComments|getComments|setInterval|dangerouslySetInnerHTML|TODO|FIXME|eslint-disable|@ts-expect-error|any" src firestore.rules
rg -n "from \\\"\\.\\/InviteUser\\\"|from \\\"\\.\\/ManageUsers\\\"|from '@/components/InviteUser'|from '@/components/ManageUsers'|<InviteUser|<ManageUsers" src
find src -type f -name '*.ts' -o -name '*.tsx' ... wc -l
npm outdated
npm ls @blocknote/react @blocknote/shadcn @liveblocks/react firebase firebase-admin next react eslint --depth=0
rg -n "InviteUser|ManageUsers" src README.md CLAUDE.md spec.md plan.md
rg -n "deleteCookie|cookies-next|__session|authToken" src package.json package-lock.json
rg -n "allow create: if isAuthenticated\\(\\)|allow delete: if isAuthenticated\\(\\)|authorId|comments" firestore.rules src/lib/documentActions.ts src/hooks/use-comments.ts src/components/Comments.tsx
rg -n "role === \\\"viewer\\\"|canEdit|READ_ACCESS|FULL_ACCESS|viewer" src firestore.rules
cat src/components/InviteUser.tsx
cat src/components/ManageUsers.tsx
```

## Findings

| ID | Severity | Type | Status | Area | Summary | Evidence | Risk | Effort | Verification | Next Step |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | P1 | Bug/Security | Open | Firestore rules | Comment subcollection rules allow any authenticated user to read, create, or delete comments without proving access to the parent document. | `firestore.rules:116-125` allows read/create/delete under `documents/{documentId}/comments` with only authentication/authorId checks; `canReadDocument(documentId)` exists at `firestore.rules:57`. | Private document comments can be exposed or spammed if a document ID is known. | Small | Update rules to require `canReadDocument(documentId)` for read/create/delete and owner-or-author delete; run lint/build. | Fix first. |
| F-002 | P2 | Bug | Open | Search | Search dialog ignores the typed query and omits viewer documents. | `src/components/SearchDialog.tsx:68` tracks `query`, but `filteredDocs = allDocs`; `allDocs` combines only owner/editor docs. | Search does not fulfill user expectation and viewers cannot search documents shared read-only. | Medium | Include viewer docs and implement title-aware filtering or defer title filtering if data shape blocks local verification. | Fix after F-001 if scope remains clean. |
| F-003 | P2 | Package update | Open | Dependencies | `npm audit` reports 22 advisories, including critical transitive `protobufjs` and high Next.js/gRPC/form-data issues. | Baseline `npm audit --audit-level=moderate`; `npm outdated` shows patch/minor updates for Next 16.2.9, Firebase 12.15.0, firebase-admin 13.10.0, AI SDKs, Radix, Liveblocks, and others. | Security exposure and maintenance drift; forced BlockNote update may be breaking. | Medium | Try safe patch/minor updates first; run lint/build/audit; defer breaking majors. | Own in package cleanup. |
| F-004 | P3 | Dead code | Open | Components | Legacy `InviteUser.tsx` and `ManageUsers.tsx` are no longer imported by app source after `ShareMenu` consolidation. | Source import search finds definitions only in `src/components/InviteUser.tsx` and `src/components/ManageUsers.tsx`; docs still mention them. | Extra maintenance surface and stale docs. | Small | Delete unused files after confirming no imports; run lint/build. | Own in cleanup batch. |
| F-005 | P3 | Test gap | Deferred | Validation | No test or typecheck scripts exist; build is the only TypeScript gate. | `package.json` scripts only include dev/build/start/lint. | Behavior regressions can slip through lint/build, especially collaboration/auth flows. | Medium | Add targeted tests only when local test framework is introduced by a future task. | Defer; product/test strategy decision. |
| F-006 | P3 | Documentation | Deferred | Docs | README/CLAUDE/spec/plan contain stale feature and version details. | Docs mention older versions and pre-ShareMenu component state. | Contributors may follow stale guidance. | Small | Update docs in a documentation cleanup pass. | Defer unless needed for code fixes. |

## Changes Made

- Updated findings report.
- Updated task queue and run state to reflect prioritized execution order.

## Verification

- Source search provided evidence for each finding.
- `npm outdated` completed with patch/minor update candidates and expected nonzero exit because updates exist.
- No source behavior changed in this phase.

## Architecture and Lean Code Scorecard

| Area | Status | Evidence | Action |
| --- | --- | --- | --- |
| Dependency direction | Pass | Server actions own privileged writes; Liveblocks auth endpoint verifies room access | No action |
| Module cohesion | Watch | `documentActions.ts` is large at 806 lines and owns CRUD, sharing, comments, covers, and role actions | Defer split unless changing adjacent code |
| Public surface area | Watch | `InviteUser` and `ManageUsers` remain as public component files despite ShareMenu replacement | Remove if proven unused |
| Data and side-effect flow | Fail | Comment Firestore rules bypass parent document access checks | Fix F-001 |
| Async/cache/resource lifecycle | Watch | `useComments` polls every 10 seconds and cleans interval on unmount | Defer real-time behavior as product/implementation choice |
| Duplication and dead code | Fail | `InviteUser.tsx` and `ManageUsers.tsx` have no source imports after ShareMenu consolidation | Remove in cleanup if no hidden use |
| Dependency lean-ness | Fail | `npm audit` and `npm outdated` show security and version drift | Package cleanup diagnostics/fixes |
| Testability | Watch | No test script; lint/build pass | Record gap, defer test framework decision |

## Quality Gate

- Command: `npm run lint`
- Result: Passed
- Notes: Report-only phase; build passed in baseline and no source files changed.

## Commit-Push Checkpoint

- Status inspected:
- Diff checked:
- Files staged:
- Dry-run push:
- Push:
- Post-push sync:

## Stabilization

- Cycle: Not started
- Completion criteria status: Findings phase only
- Remaining blockers: None

## Risks

- Firestore rules are not covered by a local rules test suite in this repo; verification will be lint/build plus targeted rule review unless a rules test harness is added.
- Some package fixes may require broad lockfile churn or breaking upgrades; those should be deferred if not locally verifiable.

## Open Questions

- None.

## Recommended Next Step

Commit/push the backlog report, then fix F-001 by tightening comment rules.
