<p align="center">
  <img src="public/spaces-logo.svg" alt="Spaces Logo" width="80" height="80" />
</p>

<h1 align="center">Spaces</h1>

<p align="center">
  A modern, real-time collaborative document editor with AI superpowers.
  <br />
  Built with Next.js 16, React 19, and Liveblocks.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.3-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-AGPL--3.0-blue?style=flat-square" alt="AGPL-3.0 License" />
</p>

---

## ✨ Features

### 🔄 Real-time Collaboration

- **Live cursors** — See where others are editing in real-time with colored name tags
- **Presence awareness** — Know who's currently viewing the document with avatars
- **Instant sync** — Changes appear immediately for all collaborators
- **Conflict-free** — Powered by Yjs CRDT for seamless merging

### 📝 Rich Text Editor

- **Block-based editing** — Notion-style blocks with BlockNote 0.46
- **Slash commands** — Quick formatting with `/` menu
- **Markdown support** — Write in markdown, see it rendered
- **Dark/Light mode** — Easy on the eyes, any time of day
- **Document icons** — Customize documents with emoji icons

### 🤖 AI Integration

Choose from 5 powerful AI models:

| Model                 | Provider  | Best For                   |
| --------------------- | --------- | -------------------------- |
| **GPT-4o**            | OpenAI    | General tasks, reasoning   |
| **Claude 3.5 Sonnet** | Anthropic | Long documents, analysis   |
| **Gemini 1.5 Pro**    | Google    | Multi-modal, large context |
| **Mistral Large**     | Mistral   | European data compliance   |
| **LLaMA 3.1 405B**    | Fireworks | Open-source, self-hostable |

**AI Features:**

- 🌐 **Document Translation** — Translate to 10 languages with streaming responses
- 💬 **Chat with Document** — Ask questions about your content
- ⚡ **Streaming responses** — See AI responses in real-time
- 📄 **Smart truncation** — Handles large documents intelligently (up to 400K chars)

### 👥 User Management

- **Role-based access** — Owner and Editor roles with different permissions
- **Easy sharing** — Invite collaborators via email with validation
- **User management** — View and remove document access
- **Ownership self-healing** — Automatic recovery of corrupted ownership data

### 🔐 Security

- **Firebase Auth** — Secure Google Sign-In authentication
- **httpOnly cookies** — Session tokens are not accessible via JavaScript
- **Server-side validation** — All sensitive operations verified on the server
- **Firestore security rules** — Granular access control at the database level

### 🌍 Supported Languages

English, French, Spanish, German, Italian, Portuguese, Chinese, Russian, Hindi, Japanese

---

## 🎬 Demo

```
┌─────────────────────────────────────────────────────────────┐
│  🟣 Spaces                              [Avatar] [Avatar]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📄 My Documents          │  📝 Document Title     [Update] │
│  ├── 📋 Project Notes     │  ─────────────────────────────  │
│  ├── 📝 Meeting Summary   │                                 │
│  └── 💡 Ideas             │  Start typing here...           │
│                           │                                 │
│  📤 Shared with me        │  👆 Cursor (You)                │
│  └── 🗺️ Team Roadmap      │        👆 Cursor (Jane)         │
│                           │                                 │
│  [+ New Document]         │  [Translate] [Chat] [🌙]       │
│                           │                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

### Core Framework

| Technology                                | Version | Purpose                         |
| ----------------------------------------- | ------- | ------------------------------- |
| [Next.js](https://nextjs.org/)            | 16.0.3  | React framework with App Router |
| [React](https://react.dev/)               | 19.0.0  | UI library                      |
| [TypeScript](https://typescriptlang.org/) | 5.6.2   | Type safety                     |

### Real-time Collaboration

| Technology                            | Version | Purpose                     |
| ------------------------------------- | ------- | --------------------------- |
| [Liveblocks](https://liveblocks.io/)  | 3.7.1   | Real-time infrastructure    |
| [Yjs](https://yjs.dev/)               | 13.6.19 | CRDT for conflict-free sync |
| [BlockNote](https://blocknotejs.org/) | 0.46.0  | Rich text editor            |

### AI & Backend

| Technology                                                   | Version | Purpose                  |
| ------------------------------------------------------------ | ------- | ------------------------ |
| [Vercel AI SDK](https://sdk.vercel.ai/)                      | 6.0.3   | AI streaming & providers |
| [Firebase](https://firebase.google.com/)                     | 12.7.0  | Auth & Firestore DB      |
| [Firebase Admin](https://firebase.google.com/docs/admin/setup) | 13.0.1  | Server auth & Firestore  |

### AI Provider SDKs

| Package            | Version | Provider  |
| ------------------ | ------- | --------- |
| @ai-sdk/openai     | 3.0.1   | OpenAI    |
| @ai-sdk/anthropic  | 3.0.1   | Anthropic |
| @ai-sdk/google     | 3.0.1   | Google    |
| @ai-sdk/mistral    | 3.0.1   | Mistral   |

### UI & Styling

| Technology                                  | Version | Purpose               |
| ------------------------------------------- | ------- | --------------------- |
| [Tailwind CSS](https://tailwindcss.com/)    | 4.0.9   | Utility-first CSS     |
| [Radix UI](https://radix-ui.com/)           | Latest  | Accessible primitives |
| [Mantine](https://mantine.dev/)             | 8.3.8   | UI components         |
| [Framer Motion](https://framer.com/motion/) | 12.4.7  | Animations            |
| [Lucide](https://lucide.dev/)               | 0.563.0 | Icons                 |
| [Sonner](https://sonner.emilkowal.ski/)     | 2.0.1   | Toast notifications   |
| [next-themes](https://github.com/pacocoursey/next-themes) | 0.4.4 | Theme management |
| [vaul](https://vaul.emilkowal.ski/)         | 1.0.0   | Drawer component      |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20.9 or later (required by Next.js 16)
- **npm** 9.0 or later (or pnpm/yarn)
- A [Liveblocks](https://liveblocks.io/) account (real-time)
- A [Firebase](https://firebase.google.com/) project (auth & database)
- At least one AI provider API key

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/spacesapp.git
cd spacesapp
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

4. **Configure your environment** (see [Environment Variables](#environment-variables))

5. **Deploy Firestore security rules**

Copy `firestore.rules` to Firebase Console → Firestore → Rules, or use Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

6. **Run the development server**

```bash
npm run dev
```

7. **Open [http://localhost:3000](http://localhost:3000)**

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

### Real-time Collaboration (Required)

```bash
# Liveblocks - https://liveblocks.io/docs/get-started
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...
LIVEBLOCKS_PRIVATE_KEY=sk_...
```

### Firebase (Required)

```bash
# Client-side (from Firebase Console > Project Settings)
NEXT_PUBLIC_FIREBASE_APIKEY=...
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECTID=...
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=...
NEXT_PUBLIC_FIREBASE_APPID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=...  # Optional

# Server-side (from Firebase Console > Service Accounts > Generate Key)
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=...
FIREBASE_PRIVATE_KEY_ID=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=...
FIREBASE_CLIENT_ID=...
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=...
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

### AI Providers (At least one required)

```bash
# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...

# Anthropic - https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-...

# Google AI - https://makersuite.google.com/app/apikey
GOOGLE_GENERATIVE_AI_API_KEY=...

# Mistral - https://console.mistral.ai/
MISTRAL_API_KEY=...

# Fireworks (for LLaMA) - https://fireworks.ai/
FIREWORKS_API_KEY=...
```

### Optional (Debug)

```bash
# Logs room ownership self-heal decisions on the server (dev only)
ROOM_OWNERSHIP_DEBUG=1
```

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/session/         # Session cookie management (POST/DELETE)
│   │   ├── auth-endpoint/        # Liveblocks authentication
│   │   └── firebase-diagnostics/ # Firebase config debugging
│   ├── doc/[id]/                 # Document pages
│   │   ├── page.tsx              # Document view
│   │   ├── layout.tsx            # Room provider + auth wrapper
│   │   ├── loading.tsx           # Loading state
│   │   └── error.tsx             # Error boundary
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── components/                   # React components
│   ├── ui/                       # Shadcn UI primitives
│   │   ├── avatar.tsx            # User avatar with fallback
│   │   ├── button.tsx            # Button variants
│   │   ├── dialog.tsx            # Modal dialogs
│   │   ├── drawer.tsx            # Mobile drawer
│   │   ├── input.tsx             # Form inputs
│   │   ├── popover.tsx           # Popovers
│   │   ├── select.tsx            # Dropdowns
│   │   ├── sheet.tsx             # Sheet/drawer
│   │   ├── sonner.tsx            # Toast notifications
│   │   ├── spinner.tsx           # Loading spinner
│   │   └── tooltip.tsx           # Tooltips
│   ├── AIDialog.tsx              # Shared AI dialog base
│   ├── AIModelSelect.tsx         # AI model dropdown
│   ├── Avatars.tsx               # User presence avatars
│   ├── Breadcrumbs.tsx           # Navigation breadcrumbs
│   ├── ChatToDocument.tsx        # AI Q&A feature
│   ├── ClientOnly.tsx            # SSR-safe wrapper
│   ├── DeleteDocument.tsx        # Document deletion dialog
│   ├── Document.tsx              # Main document component
│   ├── Editor.tsx                # BlockNote editor wrapper
│   ├── EmojiPicker.tsx           # Document icon picker
│   ├── ErrorBoundary.tsx         # Error boundary components
│   ├── FirebaseAuthBridge.tsx    # Auth state → session sync
│   ├── FollowPointer.tsx         # Live cursor display
│   ├── Header.tsx                # Top navigation bar
│   ├── InviteUser.tsx            # User invitation dialog
│   ├── LiveBlocksProvider.tsx    # Liveblocks context provider
│   ├── LiveCursorProvider.tsx    # Cursor tracking provider
│   ├── ManageUsers.tsx           # User management dialog
│   ├── NewDocumentButton.tsx     # Create document button
│   ├── PageIcon.tsx              # Document icon display
│   ├── RoomProvider.tsx          # Document room wrapper
│   ├── Sidebar.tsx               # Document navigation
│   ├── SidebarOption.tsx         # Sidebar document item
│   ├── ThemeProvider.tsx         # Dark mode provider
│   └── TranslateDocument.tsx     # AI translation feature
│
├── hooks/                        # Custom React hooks
│   ├── use-document-icon.ts      # Document icon with optimistic updates
│   ├── use-document-title.ts     # Document title management
│   ├── use-is-mounted.ts         # Component mount tracking
│   ├── use-latest.ts             # Latest value ref
│   ├── use-owner.ts              # Ownership check
│   ├── use-room-id.ts            # URL room ID extraction
│   ├── use-room-users.ts         # Room users query
│   ├── use-streaming-request.ts  # AI streaming handler
│   ├── use-user-documents.ts     # User's documents query
│   └── index.ts                  # Central exports
│
├── lib/                          # Utilities & server actions
│   ├── action-utils.ts           # Server action response helpers
│   ├── document-utils.ts         # Yjs document helpers
│   ├── documentActions.ts        # Document CRUD (server actions)
│   ├── env.ts                    # Environment variable validation
│   ├── firebase-session.ts       # Session cookie utilities
│   ├── firestore-helpers.ts      # Firestore path helpers
│   ├── generateActions.ts        # AI operations (server actions)
│   ├── liveblocks.ts             # Liveblocks server client
│   ├── room-ownership.ts         # Ownership self-healing
│   ├── stringToColor.ts          # Color generation for users
│   └── utils.ts                  # General utilities
│
├── firebase/                     # Firebase configuration
│   ├── firebaseConfig.ts         # Client SDK setup
│   └── firebaseAdmin.ts          # Admin SDK setup
│
├── constants/                    # App constants
│   └── index.ts                  # AI models, languages, prompts, limits
│
└── types/                        # TypeScript definitions
    └── index.ts                  # Shared types
```

---

## 🏗 Architecture

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  Liveblocks │────▶│   Client    │
│  (Editor)   │◀────│   (Yjs)     │◀────│  (Editor)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                                       │
       ▼                                       ▼
┌─────────────────────────────────────────────────────┐
│                    Firebase                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │Documents │  │  Users   │  │ Rooms (per user) │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Authentication Flow

```
User ──▶ Firebase Auth (Google) ──▶ ID Token
                                      │
                                      ▼
                         POST /api/auth/session
                                      │
                                      ▼
                         httpOnly Session Cookie (5 days)
                                      │
                                      ▼
                         POST /api/auth-endpoint (per room)
                                      │
                                      ▼
                         Room Access Check (Firestore)
                                      │
                                      ▼
                         Liveblocks Session Token
```

### Firestore Data Model

```
documents/
└── {documentId}/
    ├── title: string
    ├── icon: string | null      # Emoji icon
    ├── createdAt: timestamp
    └── updatedAt: timestamp

users/
└── {uid}/
    └── rooms/
        └── {documentId}/
            ├── roomId: string
            ├── userId: string
            ├── role: "owner" | "editor"
            ├── userEmail?: string   # For lookup
            └── createdAt: timestamp
```

### Server Actions

All server actions use a standardized response format:

```typescript
type ActionResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: ActionErrorCode; message: string } };
```

| Action                   | Purpose                          | Auth Required |
| ------------------------ | -------------------------------- | ------------- |
| `createNewDocument`      | Create document + owner role     | ✅            |
| `deleteDocument`         | Delete document + all room entries | ✅ (owner)   |
| `inviteUserToDocument`   | Add editor by email              | ✅ (owner)   |
| `removeUserFromDocument` | Remove user access               | ✅ (owner)   |
| `updateDocumentIcon`     | Update document emoji icon       | ✅            |
| `generateSummary`        | AI translation/summary           | ✅            |
| `generateAnswer`         | AI Q&A on document               | ✅            |

---

## 📜 Available Scripts

| Command         | Description                              |
| --------------- | ---------------------------------------- |
| `npm run dev`   | Start development server with hot reload |
| `npm run build` | Build for production                     |
| `npm run start` | Start production server                  |
| `npm run lint`  | Run ESLint for code quality              |

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes
5. **Test** thoroughly
6. **Commit** with a descriptive message: `git commit -m 'Add amazing feature'`
7. **Push** to your branch: `git push origin feature/amazing-feature`
8. **Open** a Pull Request

### Code Style

- We use **TypeScript** strict mode
- Follow the existing code patterns
- Use **functional components** with hooks
- Prefer **Server Components** where possible
- Write **descriptive variable names** (e.g., `isLoading`, `hasError`)
- Use CSS variables for theming (`bg-brand`, `text-muted-foreground`)
- Constants go in `src/constants/index.ts` — no magic numbers inline

### Commit Messages

Follow conventional commits:

```
feat: add document export feature
fix: resolve cursor sync delay
docs: update README with new env vars
refactor: simplify auth flow
```

---

## 🐛 Troubleshooting

### Common Issues

<details>
<summary><strong>Hydration mismatch errors</strong></summary>

This can happen with components using browser APIs. Wrap them in `ClientOnly`:

```tsx
import ClientOnly from "@/components/ClientOnly";

<ClientOnly fallback={<Skeleton />}>
  <BrowserOnlyComponent />
</ClientOnly>;
```

</details>

<details>
<summary><strong>Liveblocks authentication fails</strong></summary>

1. Check that `LIVEBLOCKS_PRIVATE_KEY` is set correctly
2. Verify you are signed in (Header should show your avatar + "Sign Out")
3. Check the auth endpoint logs at `/api/auth-endpoint`
4. Ensure the user has a room entry in Firestore (`users/{uid}/rooms/{docId}`)

</details>

<details>
<summary><strong>Firebase permission denied</strong></summary>

Deploy the security rules from the project root:

1. Copy `firestore.rules` to Firebase Console → Firestore → Rules
2. Copy `storage.rules` to Firebase Console → Storage → Rules

Or use Firebase CLI:

```bash
firebase deploy --only firestore:rules,storage
```

See [firestore.rules](./firestore.rules) and [storage.rules](./storage.rules) for the full rule definitions.

</details>

<details>
<summary><strong>AI features not working</strong></summary>

1. Ensure at least one AI provider API key is set in `.env.local`
2. Check the browser console for errors
3. Verify the selected model has a corresponding API key configured
4. For large documents, AI processing may take longer — streaming will show partial results

</details>

<details>
<summary><strong>Debug ownership issues</strong></summary>

Add `?debugOwner=1` to any document URL to enable detailed ownership logging in the browser console.

Server-side logging can be enabled with `ROOM_OWNERSHIP_DEBUG=1` in `.env.local`.

</details>

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)** — see [LICENSE.md](./LICENSE.md) for the full license text.

> Note: AGPL includes network-use/source-availability requirements when you run modified versions as a service. If you're unsure how this impacts your use case, please review the license terms.

---

## 🙏 Acknowledgments

- [BlockNote](https://blocknotejs.org/) — Amazing open-source editor
- [Liveblocks](https://liveblocks.io/) — Real-time infrastructure
- [Vercel AI SDK](https://sdk.vercel.ai/) — Unified AI interface
- [Shadcn UI](https://ui.shadcn.com/) — Beautiful UI components
- [Firebase](https://firebase.google.com/) — Authentication and database

---

<p align="center">
  Made with ❤️ by the Spaces team
</p>

<p align="center">
  <a href="https://github.com/yourusername/spacesapp/stargazers">⭐ Star us on GitHub</a>
</p>
