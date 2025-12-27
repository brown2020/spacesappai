import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import FirebaseAuthBridge from "@/components/FirebaseAuthBridge";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// ============================================================================
// METADATA
// ============================================================================

export const metadata: Metadata = {
  title: {
    default: "Spaces",
    template: "%s | Spaces",
  },
  description:
    "Share and collaborate on documents with your team in real-time. A modern, AI-powered document editor inspired by Notion.",
  keywords: ["collaboration", "documents", "real-time", "AI", "notion"],
  authors: [{ name: "Spaces Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#7c3aed",
};

// ============================================================================
// ROOT LAYOUT
// ============================================================================

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <ClerkProvider dynamic>
      {/* 
        suppressHydrationWarning is required because:
        1. Clerk injects authentication state that may differ between server and client
        2. Some UI libraries (Radix, Framer Motion) generate different IDs server vs client
        This prevents React hydration mismatch warnings without masking actual bugs
        since we only apply it to the html element, not descendants.
      */}
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          <FirebaseAuthBridge />
          <div className="flex flex-col min-h-screen">
            <Header />

            <div className="flex flex-1">
              <Sidebar />

              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>

          <Toaster position="top-center" richColors closeButton />
        </body>
      </html>
    </ClerkProvider>
  );
}
