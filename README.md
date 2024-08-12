Here's a README.md for your project, incorporating the details you've provided:

---

# SpacesApp

**SpacesApp** is a collaborative document editing application inspired by Sonny Sangha's tutorials, reimagined with the Vercel AI SDK and React Server Actions for server-side processing. The app enables real-time collaboration with features similar to Notion, powered by LiveBlocks for seamless, live editing experiences. Additionally, it integrates multiple AI models to assist users in interacting with their documents, including summarization, translation, and question answering.

## Features

- **Collaborative Document Editing**: Real-time collaboration using LiveBlocks, with a full-featured editor powered by BlockNote, similar to Notion.
- **AI-Powered Interactions**: Utilize various AI models (OpenAI, Anthropic, Google, Mistral, Fireworks) to chat with documents, generate summaries, or translate text.
- **React Server Actions**: Leverages Vercel AI SDK for server-side processing of AI model interactions, providing efficient and scalable solutions.
- **Authentication**: Secure user authentication using Clerk, integrated with Firebase for backend services.
- **Dark Mode**: Toggle between light and dark modes for a personalized user experience.

## Technologies Used

- **Next.js 14**: Built on the latest version of Next.js with the App Router.
- **Vercel AI SDK**: Integrates multiple AI models for intelligent document processing and interactions.
- **Firebase**: Backend services for storing document data, user authentication, and file management.
- **LiveBlocks**: Real-time collaboration framework that enables live editing of documents by multiple users simultaneously.
- **Clerk**: Provides secure user authentication and session management.
- **Tailwind CSS**: For utility-first styling and responsive design.
- **Shadcn UI Components**: Enhances the user interface with modern and consistent UI elements.
- **BlockNote**: A powerful editor similar to Notion, with real-time collaboration features.
- **React Server Actions**: Efficient server-side processing for AI model interactions.

## Getting Started

### Prerequisites

- **Node.js**: Ensure you have Node.js installed.
- **Firebase Project**: Set up a Firebase project and enable Firestore and Firebase Storage.
- **Clerk Account**: Set up a Clerk account for user authentication.
- **API Keys**: Obtain necessary API keys for OpenAI, Anthropic, Google, Mistral, Fireworks, LiveBlocks, and Clerk.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/spacesapp.git
   cd spacesapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy the `.env.example` file to `.env.local`.
   - Replace placeholder values with your actual API keys and configuration details:

     ```env
     # API Keys
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_public_clerk_publishable_key
     CLERK_SECRET_KEY=your_clerk_secret_key
     NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_public_liveblocks_public_key
     LIVEBLOCKS_PRIVATE_KEY=your_liveblocks_private_key

     OPENAI_API_KEY=your_openai_api_key
     ANTHROPIC_API_KEY=your_anthropic_api_key
     GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key
     MISTRAL_API_KEY=your_mistral_api_key
     FIREWORKS_API_KEY=your_fireworks_api_key

     # Firebase Client Config
     NEXT_PUBLIC_FIREBASE_APIKEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTHDOMAIN=your_firebase_auth_domain
     NEXT_PUBLIC_FIREBASE_PROJECTID=your_firebase_project_id
     NEXT_PUBLIC_FIREBASE_STORAGEBUCKET=your_firebase_storage_bucket
     NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID=your_firebase_messaging_sender_id
     NEXT_PUBLIC_FIREBASE_APPID=your_firebase_app_id
     NEXT_PUBLIC_FIREBASE_MEASUREMENTID=your_firebase_measurement_id

     # Firebase Server Config
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

### Running the Development Server

Start the development server with the following command:

```bash
npm run dev
```

Then, open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

### Usage

1. **Authentication**: Sign up or log in through Clerk to access your documents.
2. **Collaborative Editing**: Use the BlockNote editor to create and edit documents in real-time with others.
3. **AI Interactions**: Ask questions, generate summaries, or translate document text using integrated AI models.
4. **Dark Mode**: Toggle between light and dark modes for a personalized experience.

## Environment Variables

Ensure your `.env.local` file includes all necessary API keys and configuration settings:

- **Clerk API Keys**: For handling user authentication.
- **LiveBlocks Keys**: For enabling real-time collaboration.
- **Firebase Configuration**: For connecting to Firebase Firestore and Firebase Storage.
- **AI Model API Keys**: For interacting with various AI models via the Vercel AI SDK.

### Example `.env.local` Configuration

```env
# Example configuration
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

To dive deeper into the technologies used in this project, check out the following resources:

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK Documentation](https://vercel.com/docs/ai)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Clerk Documentation](https://clerk.dev/docs)
- [LiveBlocks Documentation](https://liveblocks.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn UI Documentation](https://shadcn.dev)
- [BlockNote Documentation](https://blocknote.dev)

## Contributing

Contributions are welcome! If you have suggestions or improvements, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

---

This README provides a comprehensive overview of your `SpacesApp` project, guiding users through setup, usage, and further exploration.
