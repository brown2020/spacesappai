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
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## ✨ Features

### 🔄 Real-time Collaboration

- **Live cursors** — See where others are editing in real-time
- **Presence awareness** — Know who's currently viewing the document
- **Instant sync** — Changes appear immediately for all collaborators
- **Conflict-free** — Powered by Yjs CRDT for seamless merging

### 📝 Rich Text Editor

- **Block-based editing** — Notion-style blocks with BlockNote
- **Slash commands** — Quick formatting with `/` menu
- **Markdown support** — Write in markdown, see it rendered
- **Dark/Light mode** — Easy on the eyes, any time of day

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

- 🌐 **Document Translation** — Translate to 10 languages
- 💬 **Chat with Document** — Ask questions about your content
- ⚡ **Streaming responses** — See AI responses in real-time

### 👥 User Management

- **Role-based access** — Owner and Editor roles
- **Easy sharing** — Invite collaborators via email
- **User management** — View and remove document access

### 🌍 Supported Languages

English, French, Spanish, German, Italian, Portuguese, Chinese, Russian, Hindi, Japanese

---

## 🎬 Demo

> Add screenshots or GIFs of your application here

```
┌─────────────────────────────────────────────────────────────┐
│  🟣 Spaces                              [Avatar] [Avatar]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📄 My Documents          │  Document Title        [Update] │
│  ├── Project Notes        │  ─────────────────────────────  │
│  ├── Meeting Summary      │                                 │
│  └── Ideas                │  Start typing here...           │
│                           │                                 │
│  📤 Shared with me        │  👆 Cursor (You)                │
│  └── Team Roadmap         │        👆 Cursor (Jane)         │
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
| [BlockNote](https://blocknotejs.org/) | 0.44.1  | Rich text editor            |

### AI & Backend

| Technology                               | Version | Purpose                  |
| ---------------------------------------- | ------- | ------------------------ |
| [Vercel AI SDK](https://sdk.vercel.ai/)  | 5.0.44  | AI streaming & providers |
| [Firebase](https://firebase.google.com/) | 12.2.1  | Database & storage       |
| [Clerk](https://clerk.com/)              | 6.0.2   | Authentication           |

### UI & Styling

| Technology                                  | Version | Purpose               |
| ------------------------------------------- | ------- | --------------------- |
| [Tailwind CSS](https://tailwindcss.com/)    | 4.0.9   | Utility-first CSS     |
| [Radix UI](https://radix-ui.com/)           | Latest  | Accessible primitives |
| [Framer Motion](https://framer.com/motion/) | 12.4.7  | Animations            |
| [Lucide](https://lucide.dev/)               | 0.559.0 | Icons                 |
| [Sonner](https://sonner.emilkowal.ski/)     | 2.0.1   | Toast notifications   |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm** 9.0 or later (or pnpm/yarn)
- A [Clerk](https://clerk.com/) account (authentication)
- A [Liveblocks](https://liveblocks.io/) account (real-time)
- A [Firebase](https://firebase.google.com/) project (database)
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

5. **Run the development server**

```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**

---

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

### Authentication (Required)

```bash
# Clerk - https://clerk.com/docs/quickstarts/nextjs
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

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

---

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── auth-endpoint/    # Liveblocks authentication
│   ├── doc/[id]/             # Document pages
│   │   ├── page.tsx          # Document view
│   │   ├── layout.tsx        # Room provider wrapper
│   │   ├── loading.tsx       # Loading state
│   │   └── error.tsx         # Error boundary
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
│
├── components/               # React components
│   ├── ui/                   # Shadcn UI primitives
│   ├── AIDialog.tsx          # Shared AI dialog base
│   ├── AIModelSelect.tsx     # AI model dropdown
│   ├── Avatars.tsx           # User presence avatars
│   ├── ChatToDocument.tsx    # AI Q&A feature
│   ├── Document.tsx          # Main document component
│   ├── Editor.tsx            # BlockNote editor wrapper
│   ├── LiveCursorProvider.tsx # Cursor tracking
│   ├── TranslateDocument.tsx # AI translation feature
│   └── ...
│
├── hooks/                    # Custom React hooks
│   ├── use-document-title.ts # Document title management
│   ├── use-owner.ts          # Ownership check
│   ├── use-room-id.ts        # URL room ID extraction
│   ├── use-room-users.ts     # Room users query
│   ├── use-streaming-request.ts # AI streaming handler
│   └── ...
│
├── lib/                      # Utilities & server actions
│   ├── documentActions.ts    # Document CRUD operations
│   ├── generateActions.ts    # AI generation actions
│   ├── auth-utils.ts         # Auth helpers
│   ├── document-utils.ts     # Document helpers
│   └── ...
│
├── firebase/                 # Firebase configuration
│   ├── firebaseConfig.ts     # Client SDK setup
│   └── firebaseAdmin.ts      # Admin SDK setup
│
├── constants/                # App constants
│   └── index.ts              # AI models, languages, prompts
│
└── types/                    # TypeScript definitions
    └── index.ts              # Shared types
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
User ──▶ Clerk Auth ──▶ Session Claims ──▶ Liveblocks Auth Endpoint
                                                    │
                                                    ▼
                                          Firebase Room Access Check
                                                    │
                                                    ▼
                                          Liveblocks Session Token
```

### Firestore Data Model

```
documents/
└── {documentId}/
    ├── title: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp

users/
└── {userEmail}/
    └── rooms/
        └── {documentId}/
            ├── roomId: string
            ├── userId: string
            ├── role: "owner" | "editor"
            └── createdAt: timestamp
```

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
2. Verify Clerk session claims include email
3. Check the auth endpoint logs at `/api/auth-endpoint`

</details>

<details>
<summary><strong>Firebase permission denied</strong></summary>

Ensure your Firestore security rules allow authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /documents/{docId} {
      allow read, write: if request.auth != null;
    }
    match /users/{userId}/rooms/{roomId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

</details>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [BlockNote](https://blocknotejs.org/) — Amazing open-source editor
- [Liveblocks](https://liveblocks.io/) — Real-time infrastructure
- [Clerk](https://clerk.com/) — Authentication made simple
- [Vercel AI SDK](https://sdk.vercel.ai/) — Unified AI interface
- [Shadcn UI](https://ui.shadcn.com/) — Beautiful UI components

---

<p align="center">
  Made with ❤️ by the Spaces team
</p>

<p align="center">
  <a href="https://github.com/yourusername/spacesapp/stargazers">⭐ Star us on GitHub</a>
</p>
