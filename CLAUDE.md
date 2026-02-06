# CLAUDE.md — Current State of Spaces

> Last updated: Feb 2026. This document describes what the codebase **actually is** right now, not what it should be.

## What Spaces Is

A real-time collaborative document editor with AI features. Users sign in with Google, create documents, invite collaborators, and edit together with live cursor tracking. AI features include document translation and Q&A.

**License:** AGPL-3.0

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.0.3, App Router, React 19, TypeScript 5.6.2 (strict) |
| Editor | BlockNote 0.46.0 (block-based), Yjs 13.6.19 (CRDT), Liveblocks 3.7.1 (sync) |
| Database | Firebase Firestore (Client SDK + Admin SDK) |
| Auth | Firebase Auth (Google Sign-In) → httpOnly session cookies |
| AI | Vercel AI SDK 6.0.3 — OpenAI, Anthropic, Google, Mistral, Fireworks providers |
| Styling | Tailwind CSS 4.0.9, Radix UI primitives, Shadcn UI components, Lucide icons |
| Real-time | Liveblocks WebSocket rooms, Yjs CRDT documents, live cursor presence |
| Deployment | Vercel (assumed) |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: Header, Sidebar, ThemeProvider, Toaster
│   ├── page.tsx                # Home page: hero, features grid, CTA
│   ├── not-found.tsx           # 404 page
│   ├── globals.css             # Tailwind v4 theme, CSS variables, animations
│   ├── doc/
│   │   ├── layout.tsx          # LiveBlocksProvider wrapper for all /doc routes
│   │   └── [id]/
│   │       ├── layout.tsx      # Auth gate + RoomProvider + ownership self-heal
│   │       ├── page.tsx        # Renders Document component with ID validation
│   │       ├── loading.tsx     # Spinner while document loads
│   │       └── error.tsx       # Error boundary with retry
│   └── api/
│       ├── auth/session/
│       │   └── route.ts        # POST: create session cookie, DELETE: clear it
│       └── auth-endpoint/
│           └── route.ts        # POST: Liveblocks room auth (verifies Firestore access)
├── components/
│   ├── Header.tsx              # App header: logo, breadcrumbs, theme toggle, auth
│   ├── Sidebar.tsx             # Document list sidebar (mobile sheet + desktop)
│   ├── Breadcrumbs.tsx         # Path-based breadcrumb navigation
│   ├── Document.tsx            # Document page: header + toolbar + editor
│   ├── Editor.tsx              # BlockNote editor with Yjs collaboration
│   ├── LiveCursorProvider.tsx  # Tracks and renders other users' cursors
│   ├── LiveBlocksProvider.tsx  # Liveblocks context wrapper
│   ├── RoomProvider.tsx        # Liveblocks room + suspense fallback
│   ├── FirebaseAuthBridge.tsx  # Syncs Firebase auth tokens → server session cookies
│   ├── ThemeProvider.tsx       # next-themes dark mode
│   ├── NewDocumentButton.tsx   # Create document + navigate
│   ├── DeleteDocument.tsx      # Owner-only document deletion dialog
│   ├── InviteUser.tsx          # Owner-only invite-by-email dialog
│   ├── ManageUsers.tsx         # Owner-only user list + remove dialog
│   ├── Avatars.tsx             # Active user avatars with tooltips
│   ├── FollowPointer.tsx       # Animated cursor for other users
│   ├── AIDialog.tsx            # Base dialog for AI features (streaming + results)
│   ├── ChatToDocument.tsx      # AI Q&A about document content
│   ├── TranslateDocument.tsx   # AI translation to selected language
│   ├── AIModelSelect.tsx       # AI model dropdown selector
│   ├── EmojiPicker.tsx         # Emoji picker popover with categories + recents
│   ├── PageIcon.tsx            # Document icon display (emoji or default)
│   ├── ErrorBoundary.tsx       # Class-based error boundary with retry
│   ├── ClientOnly.tsx          # Client-only render wrapper
│   ├── index.ts                # Barrel exports
│   └── ui/                     # Shadcn/Radix primitives
│       ├── avatar.tsx
│       ├── breadcrumb.tsx
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── popover.tsx
│       ├── select.tsx
│       ├── sheet.tsx
│       ├── sonner.tsx
│       ├── spinner.tsx
│       └── tooltip.tsx
├── hooks/
│   ├── use-document-title.ts   # Title with optimistic updates + race condition handling
│   ├── use-document-icon.ts    # Icon with optimistic updates
│   ├── use-owner.ts            # Check if current user owns the room
│   ├── use-room-users.ts       # Fetch all users in a room
│   ├── use-user-documents.ts   # Fetch user's documents grouped by role
│   ├── use-room-id.ts          # Extract room ID from URL
│   ├── use-streaming-request.ts # Streaming AI request with cancellation
│   ├── use-is-mounted.ts       # Mount state tracking
│   ├── use-latest.ts           # Latest-value ref to avoid stale closures
│   └── index.ts                # Barrel exports
├── lib/
│   ├── documentActions.ts      # Server actions: create, delete, invite, remove, update icon
│   ├── generateActions.ts      # Server actions: AI summary + Q&A (streaming)
│   ├── firebase-session.ts     # Session cookie helpers: get/require authenticated user
│   ├── room-ownership.ts       # Self-healing ownership promotion
│   ├── firestore-helpers.ts    # Firestore path helpers + ownership verification
│   ├── action-utils.ts         # successResponse() / errorResponse() builders
│   ├── liveblocks.ts           # Liveblocks server client
│   ├── env.ts                  # Environment variable validation + access
│   ├── utils.ts                # cn(), normalizeEmail(), isValidEmail(), etc.
│   ├── document-utils.ts       # Extract content from Yjs documents
│   └── stringToColor.ts        # Deterministic color from string (for cursors)
├── firebase/
│   ├── firebaseConfig.ts       # Client SDK: app, db, auth, COLLECTIONS
│   └── firebaseAdmin.ts        # Admin SDK: adminDb, adminAuth
├── constants/
│   └── index.ts                # AI models, languages, prompts, limits, Firestore config
└── types/
    └── index.ts                # All TypeScript types and interfaces
```

---

## Features (What Actually Exists)

### Document Creation & Editing
- **BlockNote editor** with real-time collaboration via Yjs + Liveblocks
- Block types: whatever BlockNote 0.46.0 supports out of the box (text, headings, lists, code blocks, images, tables, etc.)
- **No custom slash commands** — uses BlockNote's built-in `/` menu
- **No page cover images** — only page icons (emoji)
- **Page icons** via emoji picker with categories and localStorage-persisted recents
- **Page titles** with optimistic updates and race-condition protection
- **Dark mode** synced between editor and app via next-themes

### Collaboration
- **Real-time co-editing** via Liveblocks + Yjs CRDT sync
- **Live cursors** showing other users' positions with name tags and colors
- **Presence indicators** — avatar list of users currently on the page
- **Invite by email** — owner can invite users as editors
- **User management** — owner can view and remove collaborators

### AI Features
- **Translate document** — summarize + translate to 10 languages via streaming
- **Chat with document** — ask questions about document content
- **Model selection** — GPT-4o, Gemini 1.5 Pro, Mistral Large, Claude 3.5 Sonnet, LLaMA 3.1 405B
- AI features are dialog-based (modal popup, not inline)

### Navigation & Organization
- **Sidebar** with document list grouped by role (My Documents / Shared With Me)
- **Breadcrumbs** in header based on URL path
- **Home page** with feature cards and "New Document" CTA
- **No search** — there is no search functionality
- **No favorites/pins** — no way to bookmark documents
- **No trash/archive** — delete is permanent

### Auth & Sharing
- **Google Sign-In** via Firebase Auth
- **Session cookies** — httpOnly cookie for server-side auth
- **Two roles:** owner and editor
- **No viewer role** — you either can edit or you can't
- **No public sharing** — no way to share a document via public URL
- **No link sharing** — must invite by email

### Pages & Routing
- `/` — Home page
- `/doc/[id]` — Document page (auth-gated)
- `/api/auth/session` — Session cookie management
- `/api/auth-endpoint` — Liveblocks room authentication

---

## Firestore Data Model

```
documents/{documentId}
  ├── title: string
  ├── icon?: string | null          (emoji)
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp

users/{uid}/rooms/{documentId}
  ├── userId: string
  ├── userEmail?: string
  ├── role: "owner" | "editor"
  ├── roomId: string                (same as documentId)
  └── createdAt: Timestamp
```

**Key patterns:**
- One Liveblocks room per document (roomId = documentId)
- Room entries track who has access to what document and with what role
- Document content lives in Yjs via Liveblocks, NOT in Firestore
- Only metadata (title, icon, timestamps) is in Firestore

---

## Auth Flow

```
1. User clicks "Sign In" → Google popup → Firebase ID token
2. FirebaseAuthBridge detects token change → POST /api/auth/session
3. Server verifies ID token (checks auth_time < 5min) → mints httpOnly session cookie
4. Server Components read cookie → adminAuth.verifySessionCookie() → AuthenticatedUser
5. Liveblocks auth: POST /api/auth-endpoint → verify session + Firestore room access → Liveblocks token
6. Sign out: Firebase signOut + DELETE /api/auth/session → clear cookie
```

---

## Server Actions

All in `src/lib/`, all use `"use server"` directive, all verify auth via `requireAuthenticatedUser()`.

| Action | File | What It Does |
|--------|------|-------------|
| `createNewDocument()` | documentActions.ts | Creates document + owner room entry in a transaction |
| `deleteDocument(roomId)` | documentActions.ts | Transaction: verify ownership → delete doc → delete all room entries → delete Liveblocks room |
| `inviteUserToDocument(roomId, email)` | documentActions.ts | Transaction: verify ownership → check user exists in Firebase Auth → create editor room entry |
| `removeUserFromDocument(roomId, userId)` | documentActions.ts | Transaction: verify ownership → delete user's room entry |
| `updateDocumentIcon(roomId, icon)` | documentActions.ts | Transaction: verify access → update icon field |
| `generateSummary(doc, language, model)` | generateActions.ts | Validate + truncate doc → stream AI translation |
| `generateAnswer(doc, question, model)` | generateActions.ts | Validate + truncate doc → stream AI Q&A response |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/session` | POST | Verify Firebase ID token → create httpOnly session cookie |
| `/api/auth/session` | DELETE | Clear session cookie |
| `/api/auth-endpoint` | POST | Verify session + room access → return Liveblocks auth token |

---

## Environment Variables

**Client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_FIREBASE_*` (7 vars) — Firebase client config
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`

**Server-side:**
- `FIREBASE_*` (10 vars) — Firebase Admin credentials
- `LIVEBLOCKS_PRIVATE_KEY`
- AI provider keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `MISTRAL_API_KEY`, `FIREWORKS_API_KEY`

---

## Known Limitations & Gaps

1. **No search** — Can't find documents by title or content
2. **No public sharing** — Documents can only be accessed by invited users
3. **No viewer role** — Only owner and editor; no read-only access
4. **No page covers** — Only emoji icons, no banner images
5. **No comments** — No inline or page-level comments
6. **No document linking** — No way to link/reference other documents within the editor
7. **No backlinks** — No "referenced by" feature
8. **No slash commands customization** — Uses BlockNote defaults only
9. **No favorites/pins** — No way to bookmark frequently used documents
10. **No trash/soft delete** — Documents are permanently deleted
11. **AI is dialog-only** — Translation and Q&A are modal dialogs, not inline in the editor
12. **No notifications** — No in-app notification system for mentions, comments, or updates
13. **No page history/versioning** — No way to see or restore previous versions
14. **No export** — No way to export documents to Markdown, PDF, or other formats
15. **Title updates bypass server validation** — `use-document-title` writes directly to Firestore from the client SDK
16. **No middleware** — No Next.js middleware for auth route protection at the edge

---

## Key Commands

```bash
npm run dev     # Development server (http://localhost:3000)
npm run build   # Production build
npm run start   # Run production server
npm run lint    # ESLint
```

---

## Code Conventions

- `"use server"` for all server actions; `"use client"` only when hooks/browser APIs needed
- `ActionResponse<T>` discriminated union for all server action returns
- `requireAuthenticatedUser()` for auth checks in server actions
- `useCallback` for event handlers; `useMemo` for expensive computations
- CSS variables (`bg-brand`, `text-muted-foreground`) not hardcoded colors
- Firestore helpers (`getUserRoomRef`, `verifyOwnership`) for consistent patterns
- Constants in `src/constants/index.ts` — no magic numbers
- `normalizeEmail()` for all email comparison/storage
