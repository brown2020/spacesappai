# Agent Guidance

## Project Shape

Spaces is a Next.js 16 App Router application for real-time collaborative documents. It uses React 19, TypeScript, Firebase Auth and Firestore, Firebase Admin server actions, Liveblocks/Yjs collaboration, BlockNote editing, Tailwind CSS 4, Radix/Shadcn primitives, and the Vercel AI SDK.

Core directories:

- `src/app`: App Router pages, layouts, and API routes.
- `src/components`: Client UI, document chrome, editor, sharing, comments, and primitives.
- `src/hooks`: Firestore, auth, room, editor, and async UI hooks.
- `src/lib`: server actions, auth/session helpers, Liveblocks, Firestore helpers, AI actions, and utilities.
- `src/firebase`: client and admin Firebase initialization.
- `src/types`: shared TypeScript types.

## Commands

- `npm run dev`: start the local Next.js development server.
- `npm run build`: build the production app.
- `npm run start`: start the production server after a build.
- `npm run lint`: run ESLint over the repository.

Use `npm` because the repo has `package-lock.json`.

## Architecture Notes

- Document metadata lives in Firestore under `documents/{documentId}`.
- Per-user access entries live under `users/{uid}/rooms/{documentId}` with `owner`, `editor`, and `viewer` roles.
- Document content lives in Liveblocks/Yjs, not in Firestore.
- Server actions in `src/lib/documentActions.ts` are the preferred write path for document metadata, sharing, roles, comments, covers, and deletion.
- The Liveblocks auth endpoint grants full access for owners/editors and read-only access for viewers.
- Client hooks may subscribe to Firestore for metadata and access entries, but privileged decisions should be verified server-side.
- Public document pages read published metadata through the Admin SDK and render Liveblocks/Yjs content as sanitized HTML.

## Current Product Evidence

The code currently includes document search UI, viewer roles, public publishing, a unified share menu, cover images, page-level comments, and server-action title updates. Treat older roadmap text in `spec.md`, `plan.md`, `README.md`, or `CLAUDE.md` as potentially stale unless it matches current source evidence.

Known codebase-health watch items from the 2026-06-20 pass:

- `SearchDialog` opens a command palette but does not currently filter by the typed query.
- `SearchDialog` combines owner and editor documents, omitting viewer documents from search results.
- `useComments` polls a server action every 10 seconds; it is not a Firestore real-time subscription despite older docs describing real-time comments.

## Working Rules

- Preserve product behavior unless a task explicitly records an intentional behavior change.
- Keep bug fixes separate from package updates and broad cleanup.
- Prefer small server-side validation improvements over client-only authorization assumptions.
- Do not put secrets in docs, tests, screenshots, or run reports.
- Do not edit generated or cache output such as `.next`, `node_modules`, or `tsconfig.tsbuildinfo`.
- Before pushing, run `npm run lint` when practical and record any baseline failure clearly.
