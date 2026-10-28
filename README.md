# Spaces (spacesappai)

A real-time collaborative document editor. Sign in with Firebase, create documents, invite collaborators as owner, editor, or viewer, and edit together with BlockNote, Liveblocks, and Yjs. Owners can publish a read-only public page. Editors and owners can ask AI about a document or translate a summary.

## Features

- **Realtime editing** — BlockNote synced through a Liveblocks room and a Yjs document, with live cursors and presence avatars
- **Auth** — Google sign-in, email/password signup and login, and password reset. The browser Firebase SDK starts only when the public config is present. The server stores an httpOnly session cookie
- **Roles** — `owner`, `editor`, and `viewer`. Liveblocks grants full access to owners and editors and read access to viewers
- **Document chrome** — sidebar grouped by role, breadcrumbs, emoji page icon, optional https cover image, light and dark theme
- **Search** — `Cmd+K` / `Ctrl+K` palette over documents you can access, including viewer documents. It matches title, role, and document id
- **Sharing** — invite by email, change role, remove a collaborator, and publish or unpublish `/doc/[id]/public`
- **Comments** — page-level comments written by server actions. The list refreshes on a timer
- **AI** — dialogs to translate a short summary or answer a question. Calls are limited to owners and editors, allowlisted models, and 20 requests per user per hour

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js `^16.4.3` (App Router) |
| UI | React `^19.3.1`, Tailwind CSS `^4.3.3`, Radix primitives, Framer Motion `^14.7.1`, Lucide `1.63.0`, `next-themes` |
| Language | TypeScript 7.0 (`tsc` via `@typescript/native`). `typescript` is aliased to `@typescript/typescript6` so ESLint can load the TypeScript 6 API |
| Editor | BlockNote `^0.56.0`, TipTap `^3.32.1`, Yjs `^13.6.33` |
| Realtime | Liveblocks `^3.24.5` (`client`, `react`, `node`, `yjs`) |
| Auth / data | Firebase `^13.1.0`, Firebase Admin `^14.5.0` |
| AI | Vercel AI SDK `ai` `^7.0.156`, `@ai-sdk/rsc` `^3.0.156`, plus OpenAI, Anthropic, Google, and Mistral provider packages |
| Tests | Node.js test runner (`tests/*.test.ts`) |
| Lint | ESLint `^10.13.0` with `eslint-config-next` |

`firebase-admin` 14 depends on `jwks-rsa` 4. The lockfile keeps that package on `jose` `5.10.0` through the `overrides` field so the CommonJS `require("jose")` path keeps working.

Firebase’s own packages declare Node `>=24.12.0`. This repo’s CI and local checks run on Node 22. Install prints `EBADENGINE` and the SDK still loads. Do not treat that warning as a failed install.

## Project structure

```
src/
  app/
    page.tsx                     # Home
    login|signup|forgot-password/
    doc/[id]/(app)/              # Signed-in document
    doc/[id]/public/             # Published read-only page
    api/auth/session/            # Create or clear the session cookie
    api/auth-endpoint/           # Liveblocks room auth
  components/                    # Editor, sidebar, share, comments, AI, auth UI
  providers/                     # AuthProvider
  firebase/                      # Client SDK (browser-only init) and Admin SDK
  lib/                           # Session, AI, redirects, Firestore helpers
  server/documentActions.ts      # Document, share, and comment server actions
  hooks/ types/ constants/
firestore.rules
firestore.indexes.json
.env.example
tests/
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (CI uses 22)
- npm
- A Firebase project with Auth and Firestore, when you want sign-in and documents
- A Liveblocks project, when you want collaboration
- One AI provider key, when you want chat or translation

`npm run build` completes when those are unset. The home page still renders. Sign-in, collaboration, and AI stay disabled until the matching variables are set.

### Install

```bash
git clone https://github.com/brown2020/spacesappai.git
cd spacesappai
npm install
```

Copy `.env.example` to `.env.local`. Put real values only in `.env.local`. Do not commit that file.

### Environment variable names

The app reads these names. `.env.example` lists the same names with placeholders.

**Browser (required for Firebase Auth in the browser)**

- `NEXT_PUBLIC_FIREBASE_APIKEY`
- `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECTID`
- `NEXT_PUBLIC_FIREBASE_APPID`

**Browser (optional)**

- `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENTID`
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` — the document UI authenticates Liveblocks through `/api/auth-endpoint`, which uses the server secret

**Server — Firebase Admin**

- `FIREBASE_TYPE`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_CLIENT_ID`
- `FIREBASE_AUTH_URI`
- `FIREBASE_TOKEN_URI`
- `FIREBASE_AUTH_PROVIDER_X509_CERT_URL`
- `FIREBASE_CLIENT_CERTS_URL`

Admin initialization requires `FIREBASE_PROJECT_ID` and `FIREBASE_PRIVATE_KEY`. The other Admin names are sent with the service-account credential.

**Server — Liveblocks and AI**

- `LIVEBLOCKS_PRIVATE_KEY`
- `OPENAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `MISTRAL_API_KEY`
- `FIREWORKS_API_KEY`

**Optional**

- `ROOM_OWNERSHIP_DEBUG` — set to `1` outside production to log ownership repair

`.env.example` also lists `FIREBASE_UNIVERSE_DOMAIN`. The application code does not read it.

### Firebase and Liveblocks

1. Enable Google and Email/Password in Firebase Auth.
2. Deploy `firestore.rules` and `firestore.indexes.json` from this repo. Rules are the client ACL. The composite index is the collection-group query on `rooms` for `roomId` and `role`.
3. Create a Liveblocks project and set `LIVEBLOCKS_PRIVATE_KEY`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner on `tests/*.test.ts` |

## CI

`.github/workflows/ci.yml` runs on pushes to `dev` and `main`, and on pull requests. The job is `npm ci`, lint, typecheck, test, and build on Node 22. It does not inject secrets. A build with no Firebase or Liveblocks configuration is expected to pass.

## Deployment

Host on Vercel or another Node host. Set the environment variable names above in the host. Deploy the Firestore rules and indexes before relying on collaboration. This repository does not deploy either of those for you.

## Contributing

1. Work on `dev`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before pushing.
3. Do not commit `.env.local` or secret values.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
