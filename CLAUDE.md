# CLAUDE.md - AI Assistant Guide for Spaces

## Project Overview

**Spaces** is a real-time collaborative document editor with AI capabilities. It's a Notion-inspired application enabling multiple users to edit documents simultaneously with live cursor tracking, presence awareness, and integrated AI features (translation, Q&A).

**License:** AGPL-3.0

## Tech Stack

- **Framework:** Next.js 16.0.3 with App Router, React 19, TypeScript 5.6.2 (strict mode)
- **Real-time:** Liveblocks 3.7.1 + Yjs 13.6.19 (CRDT) + BlockNote 0.46.0 (editor)
- **Database:** Firebase Firestore + Firebase Admin SDK
- **Auth:** Firebase Auth (Google Sign-In) with httpOnly session cookies
- **AI:** Vercel AI SDK 6.0.3 with OpenAI, Anthropic, Google, Mistral, Fireworks providers
- **Styling:** Tailwind CSS 4.0.9, Radix UI, Mantine, Lucide icons

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── auth-endpoint/  # Liveblocks auth
│   │   └── auth/session/   # Session cookie management
│   └── doc/[id]/           # Document pages
├── components/             # React components
│   └── ui/                 # Shadcn/Radix primitives
├── hooks/                  # Custom React hooks
├── lib/                    # Server actions & utilities
│   ├── documentActions.ts  # Document CRUD (server actions)
│   ├── generateActions.ts  # AI operations (server actions)
│   ├── firebase-session.ts # Session utilities
│   └── room-ownership.ts   # Ownership self-healing
├── firebase/               # Firebase config (client & admin)
├── constants/              # AI models, languages, prompts
└── types/                  # TypeScript definitions
```

## Key Commands

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Run production server
npm run lint     # ESLint
```

## Architecture Patterns

### Server Actions
All sensitive operations use server actions with `"use server"` directive. Response format is standardized:
```typescript
ActionResponse<T> = { success: true, data: T } | { success: false, error: string }
```
Use `requireAuthenticatedUser()` to verify authentication in server actions.

### Authentication Flow
```
Google Sign-In → Firebase ID Token → POST /api/auth/session → httpOnly Cookie
Server Actions: Cookie → Firebase Admin verify → Execute action
Liveblocks: POST /api/auth-endpoint → Verify room access → Return session token
```

### Firestore Data Model
```
documents/{documentId}      # title, createdAt, updatedAt
users/{uid}/rooms/{docId}   # userId, role ("owner"|"editor"), roomId
```

### Real-time Collaboration
- Liveblocks manages WebSocket connections and presence
- Yjs handles CRDT synchronization (conflict-free merging)
- BlockNote binds to Yjs for collaborative editing
- One Liveblocks room per document

### Access Control
- **Owners:** Can invite editors, manage users, delete documents
- **Editors:** Can read/write document content only
- `ensureRoomHasOwner()` self-heals corrupted ownership

## Important Files

| File | Purpose |
|------|---------|
| `src/lib/documentActions.ts` | Document CRUD server actions |
| `src/lib/generateActions.ts` | AI translation & Q&A server actions |
| `src/lib/firestore-helpers.ts` | Firestore path helpers & ownership verification |
| `src/lib/firebase-session.ts` | Session cookie utilities |
| `src/lib/utils.ts` | Email normalization, validation utilities |
| `src/constants/index.ts` | AI limits, Firestore constants, UI constants |
| `src/app/api/auth-endpoint/route.ts` | Liveblocks authentication |
| `src/components/Editor.tsx` | BlockNote editor integration |
| `src/components/RoomProvider.tsx` | Liveblocks room wrapper |
| `src/components/ThemeProvider.tsx` | next-themes dark mode provider |
| `liveblocks.config.ts` | Liveblocks TypeScript types |
| `firestore.rules` | Firestore security rules |

## Environment Variables

**Client-side (NEXT_PUBLIC_):**
- `NEXT_PUBLIC_FIREBASE_*` - Firebase client config
- `NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY`

**Server-side:**
- `FIREBASE_*` - Firebase Admin credentials
- `LIVEBLOCKS_PRIVATE_KEY`
- AI provider keys: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `MISTRAL_API_KEY`, `FIREWORKS_API_KEY`

## Development Notes

- **Hydration:** Wrap browser-only components in `ClientOnly`
- **Debug Mode:** Add `?debugOwner=1` to URL for ownership logging
- **Local Firestore:** Uses long-polling on localhost to avoid WebChannel issues
- **Path Aliases:** `@/*` maps to `./src/*`

## Code Conventions

- Use `useCallback` for event handlers to prevent re-renders
- Keep components under ~150 lines; split when complex
- Handle errors explicitly with try-catch + logging
- Use existing hooks (`useOwner`, `useRoomId`, etc.) instead of duplicating logic
- Update `firestore.rules` when adding new collections
- All AI streaming uses Vercel AI SDK's `streamText` for unified provider interface
- Use `normalizeEmail()` from utils.ts for email comparison/storage
- Use CSS variables (`bg-brand`, `text-muted-foreground`) instead of hardcoded colors
- Use Firestore helpers (`getUserRoomRef`, `verifyOwnership`) for consistent patterns
- Constants go in `src/constants/index.ts` - no magic numbers inline

## Security Checklist

- Always verify users with `requireAuthenticatedUser()` in server actions
- Validate room access before granting Liveblocks tokens
- Session cookies are httpOnly and secure in production
- Never expose Firebase Admin credentials client-side
