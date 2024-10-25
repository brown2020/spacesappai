import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/sonner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spaces",
  description:
    "Share and collaborate on documents with your team. Inspired by Notion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body>
          <Header />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {children}
            </div>
          </div>
          <Toaster position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
