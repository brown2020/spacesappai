# Spaces specification

As built on `dev`, October 2026. This describes the product the code implements. Planned work is in `roadmap.md`.

## Product

Spaces is a collaborative document app.

- A signed-in user can create a document, edit its title and emoji icon, and delete it.
- The owner can invite another Firebase user by email as an editor or a viewer, change that role, or remove them.
- Owners and editors edit the BlockNote document. Viewers can open it read-only.
- The owner can publish a public read-only page that does not require sign-in.
- Owners and editors can open an AI dialog to summarize/translate the document or ask a question about the text they send.
- Anyone with access can add and read page-level comments. The author name is taken from the server session.

There is no viewer-only public link besides the publish flag, no file upload, no trash, no export, and no document-to-document links.

## Routes

| Path | Behavior |
| --- | --- |
| `/` | Home. Static. Renders without Firebase config. |
| `/login`, `/signup`, `/forgot-password` | Email/password and Google auth screens. |
| `/doc/[id]` | Signed-in document. Requires a session and a membership row. |
| `/doc/[id]/public` | Published document as sanitized React, revalidated every 60 seconds. |
| `POST /api/auth/session` | Exchange a fresh Firebase ID token for an httpOnly session cookie. |
| `DELETE /api/auth/session` | Clear the cookie and revoke that user’s Firebase refresh tokens. |
| `POST /api/auth-endpoint` | Liveblocks auth for one room. |

## Access model

Membership is `users/{uid}/rooms/{documentId}` with `role` of `owner`, `editor`, or `viewer`. Clients cannot create, update, or delete those rows. Server actions write them with the Admin SDK.

Firestore document rules:

- Reads require membership.
- Creates cannot set `isPublished` or `ownerId`.
- Updates cannot change `ownerId` or `createdAt`.
- Only an owner can change `isPublished`.
- Cover values, when present, must be `https` URLs.
- Comment documents are readable by members. Client writes are denied.

Liveblocks:

- `owner` and `editor`: full access
- `viewer`: read access
- Any other role: rejected

Document content lives in the Liveblocks Yjs room, not in Firestore. Firestore stores title, icon, cover, publish flag, `ownerId`, and timestamps.

## Auth

1. The browser signs in with Firebase Auth.
2. `POST /api/auth/session` accepts the ID token only when the body is JSON, the `Origin` host matches the `Host` header, and `auth_time` is within five minutes (one minute of future clock skew is allowed).
3. The session cookie lasts five days. Later ID-token refreshes that fall outside the five-minute window do not clear a still-valid cookie.
4. Logout revokes refresh tokens. Session verification checks revocation.
5. If the public Firebase config is missing, the client module logs a warning and does not call `getAuth()` during `next build` or server render.

## Editor and collaboration

- BlockNote `^0.56` with the shadcn UI, Liveblocks Yjs provider, and live cursors.
- Page icon via an emoji picker. Cover images are https URLs only, checked in the client and in `updateDocumentCover`.
- Viewers get a non-editable editor.
- Ownership repair (`ensureRoomHasOwner`) promotes an editor only when no owner remains, and promotes a viewer only when that user’s verified email matches a legacy owner record. It will not create a second owner when one already exists.

## Sharing and the public page

- Invite, role change, remove, and publish/unpublish are owner actions in `src/server/documentActions.ts`.
- The public page returns not found unless `isPublished` is true.
- Metadata for an unpublished document, and for a private document the viewer cannot access, uses a generic title.
- Public Yjs payloads larger than 2 MB are not applied.
- Images on the public page render through a client `RemoteImage` component so the server page does not pass a function into `next/image`.

## Comments

- `addComment`, `deleteComment`, and `getComments` are server actions.
- `useComments` polls `getComments` every 10 seconds.
- Author display fields are set on the server. Client writes cannot spoof them.

## Search

`SearchDialog` loads the signed-in user’s owner, editor, and viewer documents and filters by the typed query against title, role, and id. It does not search document body text.

## AI

Models, unchanged:

- `gpt-4o`
- `gemini-1.5-pro`
- `mistral-large`
- `claude-3-5-sonnet`
- `llama-v3p1-405b` (Fireworks)

Languages: english, french, spanish, german, italian, portuguese, chinese, russian, hindi, japanese.

Limits:

- Document input over 1,000,000 characters is rejected. Shorter text is truncated to 400,000 characters before the model call.
- Questions must be 1–2,000 characters.
- 20 requests per user per hour, stored at `users/{uid}/private/aiRateLimit`. Client rules do not allow that path. If the counter write fails, the request does not run.

The caller must be an owner or editor of the given room. Viewers are rejected.

## Build and tests

- `npm run build` succeeds with `NEXT_PUBLIC_FIREBASE_*` and server secrets unset.
- Tests are Node’s built-in runner over `tests/*.test.ts` (auth contracts, Firestore rule source, redirects, session guards, AI guards, ownership policy, and related units).
- CI on Node 22 runs lint, typecheck, tests, and build without injecting secrets.
- `tsc` is TypeScript 7.0. ESLint imports the TypeScript 6 API through the `@typescript/typescript6` package aliased as `typescript`, because typescript-eslint does not support the TypeScript 7 API yet.

## Indexes to deploy

`firestore.indexes.json` defines one collection-group index on `rooms`: `roomId` ascending, `role` ascending. The ownership repair query needs it. Deploying it is an operator step; the app does not deploy Firebase.
