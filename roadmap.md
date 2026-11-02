# Spaces roadmap

Punchlist after the November 2026 dependency pass. Nothing here is a commitment to ship. `main` is promoted separately after QA.

## Deployment

Vercel project linked October 28, 2026 (team `ignitechannel`, project `spacesappai`, Node 24). Dev previews are at `spacesappai-git-dev-ignitechannel.vercel.app`. Collaboration and AI need the Liveblocks, Firebase client, Firebase server, and AI environment variables set in Vercel. Those are not set yet. The production build is expected to succeed without them.

## Operator steps

- Deploy `firestore.rules` and `firestore.indexes.json` to the Firebase project. The repo does not deploy them. The collection-group index on `rooms` (`roomId`, `role`) is required for ownership repair.
- CI already runs on Node 24. `@firebase/*` declares `node: >=24.12.0`. Use Node 24.12 or newer locally so install does not print `EBADENGINE`.
- Do not drop the `jwks-rsa` → `jose@5.10.0` override while `firebase-admin` 14 / `jwks-rsa` 4 remain. `jwks-rsa` 4.1.0 loads `jose` with `require()`, and jose 6 is ESM-only.
- Keep the other security overrides: `gcp-metadata@^8.0.0` → `gaxios@7.3.1` (8.1.4 pins the vulnerable `7.1.3`), `rimraf` → `glob@^14.0.3`, and `minimatch@11.0.4` for ESLint and `@typescript-eslint/typescript-estree`. `@grpc/grpc-js` stays on `^1.14.0`.

## Known bugs and risks

- **Yjs 14 entry is unused by the editor.** Liveblocks syncs a `yjs` v13 document. `@blocknote/core/y` expects an `@y/y` v14 node and throws `Expected value to be of type $Union` on `[ytype]` when the editor mounts, which the document error boundary shows as "Unable to load document". The editor imports `CollaborationExtension` from `@blocknote/core/yjs` instead. `@y/y` stays installed because BlockNote still ships that entry.
- **`@y/*` dist-tags.** npm’s `latest` tags are older than the installed prereleases: `@y/y` `14.0.0-rc.7` vs `14.0.0-rc.29`, `@y/prosemirror` `2.0.0-0` vs `2.0.0-15`, `@y/protocols` `1.0.6-0` vs `1.0.6-rc.1`. BlockNote 0.57 peers require the newer prereleases. Those packages were not downgraded.
- **Public unpublish lag.** `/doc/[id]/public` uses `revalidate = 60`. A page can stay cached for up to a minute after unpublish.
- **Comments are polled.** `useComments` calls a server action every 10 seconds. It is not a Firestore listener.
- **Search is metadata only.** The palette matches title, role, and document id. It does not search BlockNote/Yjs body text.
- **No self-serve leave.** Clients cannot delete their own membership row. Only the owner can remove a collaborator.
- **AI text is client-supplied.** The action checks that the caller is an owner or editor of the room id. It does not prove the submitted text matches the Liveblocks document.
- **Orphan document creates.** Firestore rules still allow an authenticated client to create a `documents/{id}` row that is unpublished and has no `ownerId`. The normal create path is the server action, which also writes the owner membership.

## Next product work

- Full-text search of document content, if title search is not enough.
- Realtime comments, or a shorter refresh, if 10 second polling is too slow.
- Export (Markdown or PDF), trash/restore, and page history if those are in scope.
- Cover uploads instead of pasted https URLs, which needs Storage rules and a deploy.
- Inline comments and document links are not started.

## Open maintenance

- `npm audit` after the November 2026 update reports 5 moderate findings, all from `minimatch` `<11.0.1` inside `eslint-plugin-import`, `eslint-plugin-react`, and `eslint-plugin-jsx-a11y` (and therefore `eslint-config-next`). Those plugins are already on their latest releases and call `require("minimatch")` as a function. `minimatch` 11 only exports named bindings, and there is no patched 3.x. ESLint itself and `@typescript-eslint/typescript-estree` are overridden to `minimatch` `11.0.4`. `npm audit fix --force` wants to downgrade ESLint to 4. Do not run it.
- Package majors already in the tree include Next 16, React 19, Firebase client 13, Firebase Admin 14, AI SDK 7, ESLint 10, Zod 4, Tailwind 4, and TypeScript 7. BlockNote is `0.57.0`. `tsc` is TypeScript 7.0.2 (`7.1` is still beta). ESLint still imports the TypeScript 6 API through the `@typescript/typescript6` alias, which is the side-by-side setup TypeScript 7 documents. typescript-eslint does not support the TypeScript 7 API yet.
- AI model ids were not changed: `gpt-4o`, `gemini-1.5-pro`, `mistral-large`, `claude-3-5-sonnet`, `llama-v3p1-405b`.
