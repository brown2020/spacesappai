# SpacesApp

A real-time collaborative document editor with AI capabilities, built with Next.js 15 and LiveBlocks.

## Core Features

### Real-time Collaboration

- Multi-user document editing with cursor tracking
- Presence awareness and user avatars
- Role-based access control (owner/editor)
- Document sharing and permissions management

### Rich Text Editor

- BlockNote-based WYSIWYG editor (v0.21.0)
- Real-time synchronization via YJS
- Dark/Light mode support
- Markdown support

### AI Integration

- Multiple AI model support:
  - OpenAI
  - Anthropic
  - Google AI
  - Mistral
  - Fireworks
- Document translation
- AI-powered chat interface
- Content generation and analysis

## Tech Stack

### Frontend

- Next.js 15.1.3
- React 19.0.0
- TypeScript 5.6.2
- TailwindCSS 3.4.16
- Framer Motion 11.13.3

### Authentication & Backend

- Clerk 6.0.2
- Firebase 11.0.0
- Firebase Admin 13.0.1

### Real-time Features

- LiveBlocks Suite 2.7.2
- YJS 13.6.19

### UI Components

- Radix UI
- Lucide React 0.469.0
- Sonner 1.7.1
- BlockNote Editor

## Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

1. Clone and install dependencies:

```bash
git clone https://github.com/yourusername/spacesapp.git
cd spacesapp
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# LiveBlocks
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
LIVEBLOCKS_SECRET_KEY=

# AI Models
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=
MISTRAL_API_KEY=
FIREWORKS_API_KEY=

# Firebase
NEXT_PUBLIC_FIREBASE_APIKEY=
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECTID=
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=
NEXT_PUBLIC_FIREBASE_APPID=
```

### Development

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Project Structure

```
src/
├── app/                 # Next.js app router
├── components/          # React components
├── lib/                # Utility functions
├── firebase/           # Firebase configuration
└── types/             # TypeScript definitions
```

## Key Components

- **Document Editor**: Real-time collaborative editor with cursor tracking
- **User Management**: Role-based access control and user permissions
- **AI Integration**: Multiple AI model support for document processing
- **Authentication**: Secure user authentication with Clerk
- **Real-time Sync**: LiveBlocks integration for collaboration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
