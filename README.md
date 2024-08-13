# SpacesApp

SpacesApp is a collaborative document editing application inspired by Sonny Sangha's tutorials, enhanced with AI-driven features for real-time collaboration and document interaction. It utilizes cutting-edge technologies like Vercel AI SDK, React Server Actions, and LiveBlocks to offer a seamless, live-editing experience similar to Notion, with integrated AI models for advanced document processing.

## Features

- **Collaborative Editing:** Real-time document editing with LiveBlocks, using a BlockNote-based editor.
- **AI-Powered Tools:** Summarization, translation, and Q&A using multiple AI models (OpenAI, Anthropic, Google, Mistral, Fireworks).
- **Server-Side Processing:** Efficient handling of AI model interactions with Vercel AI SDK and React Server Actions.
- **Authentication:** Secure login with Clerk, integrated with Firebase.
- **Customizable UI:** Light and dark mode options for personalized user experience.

## Technologies Used

- **Next.js 14:** Latest version with App Router support.
- **Vercel AI SDK:** Integration with various AI models for document processing.
- **Firebase:** Backend services for data storage and authentication.
- **LiveBlocks:** Framework for real-time collaboration.
- **Clerk:** User authentication and session management.
- **Tailwind CSS:** Utility-first styling for responsive design.
- **Shadcn UI Components:** Modern UI elements.
- **BlockNote:** Powerful editor with real-time collaboration.

## Getting Started

### Prerequisites

- **Node.js:** Required to run the application.
- **Firebase:** Set up a Firebase project.
- **Clerk Account:** Needed for user authentication.
- **API Keys:** Obtain keys for AI models, LiveBlocks, and Clerk.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/spacesapp.git
   cd spacesapp
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   - Copy `.env.example` to `.env.local`.
   - Replace placeholders with your API keys and configuration details.

### Running the Development Server

Start the development server:

```bash
npm run dev
```

Access the application at `http://localhost:3000`.

### Usage

1. **Authentication:** Sign up or log in with Clerk.
2. **Document Editing:** Create and edit documents collaboratively.
3. **AI Tools:** Use AI models for document interaction.
4. **UI Customization:** Switch between light and dark modes.

## Environment Variables

Ensure `.env.local` includes all necessary API keys and configuration settings:

- **Clerk API Keys:** For authentication.
- **LiveBlocks Keys:** For collaboration.
- **Firebase Config:** For backend services.
- **AI Model Keys:** For AI interactions.

### Example Configuration

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_public_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_public_liveblocks_public_key
LIVEBLOCKS_PRIVATE_KEY=your_liveblocks_private_key

OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
MISTRAL_API_KEY=your_mistral_api_key
FIREWORKS_API_KEY=your_fireworks_api_key

NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_firebase_measurement_id

FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY=your_firebase_private_key
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_CERTS_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_firebase_client_email
FIREBASE_UNIVERSE_DOMAIN=googleapis.com
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [LiveBlocks Documentation](https://liveblocks.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://shadcn.dev/docs)
- [BlockNote Documentation](https://blocknote.dev/docs)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with your suggestions or improvements.

## License

This project is licensed under the MIT License.
