# Spaces roadmap

Punchlist after the October 2026 maintenance pass. Nothing here is a commitment to ship. `main` is promoted separately after QA.

## Deployment

Vercel project linked October 28, 2026 (team `ignitechannel`, project `spacesappai`, Node 24). Dev previews are at `spacesappai-git-dev-ignitechannel.vercel.app`. Collaboration and AI need the Liveblocks, Firebase client, Firebase server, and AI environment variables set in Vercel. Those are not set yet. The production build is expected to succeed without them.

## Operator steps

- Deploy `firestore.rules` and `firestore.indexes.json` to the Firebase project. The repo does not deploy them. The collection-group index on `rooms` (`roomId`, `role`) is required for ownership repair.
- Keep Node 22 for CI unless you choose to move. `@firebase/*` declares `node: >=24.12.0` and `npm install` prints `EBADENGINE` on Node 22. The SDK still loads and the test/build suite passes. Moving CI to Node 24 is a separate decision.
- Do not drop the `jwks-rsa` → `jose@5.10.0` override while `firebase-admin` 14 / `jwks-rsa` 4 remain. `jwks-rsa` 4.1.0 loads `jose` with `require()`, and jose 6 is ESM-only.

## Known bugs and risks

- **Yjs 14 entry is unused by the editor.** Liveblocks syncs a `yjs` v13 document. `@blocknote/core/y` expects an `@y/y` v14 node and throws `Expected value to be of type $Union` on `[ytype]` when the editor mounts, which the document error boundary shows as "Unable to load document". The editor imports `CollaborationExtension` from `@blocknote/core/yjs` instead. `@y/y` stays installed because BlockNote still ships that entry.
- **`@y/*` dist-tags.** npm’s `latest` tag for `@y/protocols` points at an older prerelease than the version installed (`1.0.6-rc.1`). Those packages were not downgraded.
- **Public unpublish lag.** `/doc/[id]/public` uses `revalidate = 60`. A page can stay cached for up to a minute after unpublish.
- **Comments are polled.** `useComments` calls a server action every 10 seconds. It is not a Firestore listener.
- **Search is metadata only.** The palette matches title, role, and document id. It does not search BlockNote/Yjs body text.
- **No self-serve leave.** Clients cannot delete their own membership row. Only the owner can remove a collaborator.
- **AI text is client-supplied.** The action checks that the caller is an owner or editor of the room id. It does not prove the submitted text matches the Liveblocks document.
- **Orphan document creates.** Firestore rules still allow an authenticated client to create a `documents/{id}` row that is unpublished and has no `ownerId`. The normal create path is the server action, which also writes the owner membership.

## Next product work

- Decide whether CI should run on Node 24 to match the Firebase engine field.
- Full-text search of document content, if title search is not enough.
- Realtime comments, or a shorter refresh, if 10 second polling is too slow.
- Export (Markdown or PDF), trash/restore, and page history if those are in scope.
- Cover uploads instead of pasted https URLs, which needs Storage rules and a deploy.
- Inline comments and document links are not started.

## Open maintenance

- `npm audit` reports 0 vulnerabilities after the October 2026 update.
- Package majors already in the tree include Next 16, React 19, Firebase client 13, Firebase Admin 14, AI SDK 7, ESLint 10, Zod 4, Tailwind 4, and TypeScript 7. `tsc` is TypeScript 7.0.2. ESLint still imports the TypeScript 6 API through the `@typescript/typescript6` alias, which is the side-by-side setup TypeScript 7 documents. typescript-eslint does not support the TypeScript 7 API yet.
- AI model ids were not changed: `gpt-4o`, `gemini-1.5-pro`, `mistral-large`, `claude-3-5-sonnet`, `llama-v3p1-405b`.
