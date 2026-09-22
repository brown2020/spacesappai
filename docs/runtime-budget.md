# Runtime budget (Spaces)

Recorded before app-eval until-100 measurements.

| Critical path | Metric | Budget | Notes |
| --- | --- | --- | --- |
| Home `/` (signed-out shell) | Load to interactive chrome | ≤ 3000 ms on local `next start` | curl TTFB + browser load |
| Create document (server action) | Action round-trip | ≤ 2000 ms | Excludes Liveblocks first connect |
| Public document HTML | TTFB | ≤ 1500 ms | `GET /doc/[id]/public` |

Budget source: maintainer-written before until-100 leanness prove (`docs/runtime-budget.md`).
