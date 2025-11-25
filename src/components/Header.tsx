"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Breadcrumbs from "./Breadcrumbs";

// ============================================================================
// HEADER LOGO
// ============================================================================

interface HeaderLogoProps {
  userName?: string;
}

function HeaderLogo({ userName }: HeaderLogoProps) {
  const displayName = userName ? `${userName}'s Space` : "Spaces";

  return (
    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">
      {displayName}
    </h1>
  );
}

// ============================================================================
// HEADER NAVIGATION
// ============================================================================

function HeaderNav() {
  return (
    <div className="hidden sm:block mx-2 px-3 py-2 rounded-md bg-white/90 backdrop-blur-sm shadow-sm">
      <Breadcrumbs />
    </div>
  );
}

// ============================================================================
// USER ACTIONS
// ============================================================================

function UserActions() {
  return (
    <div className="flex items-center gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-9 h-9",
            },
          }}
        />
      </SignedIn>
    </div>
  );
}

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export default function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
      <HeaderLogo userName={user?.firstName || undefined} />
      <HeaderNav />
      <UserActions />
    </header>
  );
}
