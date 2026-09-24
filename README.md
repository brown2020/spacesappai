# Spaces (spacesappai)

A real-time collaborative document editor inspired by Notion. Sign in, create documents, invite collaborators (owner / editor / viewer), edit together with Liveblocks + Yjs cursors, optionally publish a read-only public link, and use AI to chat with or translate document content.

## Features

- **Realtime collaboration** — BlockNote editor synced with Liveblocks rooms and Yjs; live cursors and presence avatars
- **Auth** — Firebase Auth with Google, email/password signup/login, and forgot-password; server session cookies via `/api/auth/session`
- **Roles** — `owner`, `editor`, and `viewer` enforced in Liveblocks auth (`/api/auth-endpoint`) and Firestore rules
- **Document chrome** — sidebar list, breadcrumbs, page emoji icon, optional cover image URL, dark/light theme
- **Search** — `Cmd+K` / `Ctrl+K` command palette over documents you can access
- **Sharing** — invite/manage users; publish/unpublish to `/doc/[id]/public` for unauthenticated read-only viewing
- **Comments** — page-level comments via server actions
- **AI** — chat-with-document and translate flows streaming through the Vercel AI SDK (OpenAI, Anthropic, Google, Mistral, Fireworks)
- **Auth-gated doc routes** — `/doc/[id]` for signed-in collaborators; public route for published docs

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js `^16.3.5` (App Router) |
| UI | React `^19.2.5`, Tailwind CSS `^4.2.2`, Radix / shadcn-style primitives, Framer Motion, Lucide, `next-themes` |
| Language | TypeScript `^6` |
| Editor | BlockNote `^0.48` + TipTap extensions, Yjs `^13` |
| Realtime | Liveblocks (`@liveblocks/client|react|node|yjs` `^3.18`) |
| Auth / data | Firebase `^12` + Firebase Admin `^13`, session cookies |
| AI | Vercel AI SDK (`ai` `^6`, `@ai-sdk/*`, `@ai-sdk/rsc`) |
| Tests | Node.js test runner (`tests/*.test.ts`) |
| Lint | ESLint `^10` + `eslint-config-next` |

## Project structure

```
src/
  app/
    page.tsx                 # Marketing home
    login|signup|forgot-password/
    doc/[id]/(app)/          # Authenticated document workspace
    doc/[id]/public/         # Published read-only view
    api/auth/session/        # Create/clear Firebase session cookie
    api/auth-endpoint/       # Liveblocks room auth
  components/                # Editor, sidebar, share, AI dialogs, auth UI, ui/*
  providers/                 # AuthProvider
  firebase/                  # Client Firebase helpers
  lib/                       # env, Liveblocks, generateActions, document helpers, session
  server/                    # Server-side helpers
  hooks/ types/ constants/
firestore.rules
.env.example
tests/
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22+
- npm
- Firebase project (Auth + Firestore)
- Liveblocks account (public + secret keys)
- At least one AI provider API key for chat/translate features

### Clone and install

```bash
git clone https://github.com/brown2020/spacesappai.git
cd spacesappai
npm install
```

### Environment variables

Copy `.env.example` to `.env.local`. **Never commit real keys.**

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY` | Liveblocks client key | Liveblocks dashboard |
| `LIVEBLOCKS_PRIVATE_KEY` | Liveblocks server / auth endpoint | Liveblocks dashboard |
| `OPENAI_API_KEY` | OpenAI models | [OpenAI](https://platform.openai.com/) |
| `ANTHROPIC_API_KEY` | Anthropic models | [Anthropic Console](https://console.anthropic.com/) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Gemini models | [Google AI Studio](https://aistudio.google.com/) |
| `MISTRAL_API_KEY` | Mistral models | [Mistral](https://console.mistral.ai/) |
| `FIREWORKS_API_KEY` | Fireworks models | [Fireworks](https://fireworks.ai/) |
| `NEXT_PUBLIC_FIREBASE_APIKEY` | Firebase web config | Firebase Console → Project settings |
| `NEXT_PUBLIC_FIREBASE_AUTHDOMAIN` | Auth domain | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_PROJECTID` | Project id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_STORAGEBUCKET` | Storage bucket | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID` | Messaging sender id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APPID` | Web app id | Firebase Console |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENTID` | Optional Analytics id | Firebase Console |
| `FIREBASE_TYPE` | Service account type (`service_account`) | Service account JSON |
| `FIREBASE_PROJECT_ID` | Admin project id | Service account JSON |
| `FIREBASE_PRIVATE_KEY_ID` | Admin private key id | Service account JSON |
| `FIREBASE_PRIVATE_KEY` | Admin private key (PEM; escape newlines) | Service account JSON |
| `FIREBASE_CLIENT_EMAIL` | Admin client email | Service account JSON |
| `FIREBASE_CLIENT_ID` | Admin client id | Service account JSON |
| `FIREBASE_AUTH_URI` | Usually Google OAuth auth URI | Service account JSON |
| `FIREBASE_TOKEN_URI` | Usually Google token URI | Service account JSON |
| `FIREBASE_AUTH_PROVIDER_X509_CERT_URL` | Google certs URL | Service account JSON |
| `FIREBASE_CLIENT_CERTS_URL` | Client certs URL | Service account JSON |
| `FIREBASE_UNIVERSE_DOMAIN` | Usually `googleapis.com` | Service account JSON |
| `ROOM_OWNERSHIP_DEBUG` | Optional debug flag for room ownership | Local only |

### Firebase / Liveblocks setup

1. Enable Google and Email/Password (and any other providers you use) in Firebase Auth.
2. Deploy `firestore.rules` so document membership, covers, publish flags, and comments stay user-scoped.
3. Create a Liveblocks project and paste public/private keys into env.
4. Map a Firebase service account to the `FIREBASE_*` Admin variables for session verification and privileged writes.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner on `tests/*.test.ts` |

## Testing and CI

CI (`.github/workflows/ci.yml`) on `dev` / `main` and PRs runs lint, typecheck, tests, and build. Liveblocks and Firebase `NEXT_PUBLIC_*` values are injected from GitHub Actions secrets for the build step (placeholders are not committed).

Tests cover auth contracts/pages, Firebase auth error mapping, action utils, and selected regressions.

## Deployment

Intended for Vercel or similar Node hosts. Configure the same environment variables in the host. Deploy Firestore rules before enabling production collaboration.

No repository `homepageUrl` is set in GitHub metadata for this project.

## Contributing

1. Develop on `dev`.
2. Run `npm run lint`, `npm run typecheck`, and `npm test` before pushing.
3. Do not commit `.env.local` or secrets.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
