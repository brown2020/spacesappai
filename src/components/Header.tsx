"use client";

import Breadcrumbs from "./Breadcrumbs";
import { toast } from "sonner";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth as firebaseAuth } from "@/firebase/firebaseConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [user, isLoading] = useAuthState(firebaseAuth);

  const handleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);

      const redirectTo =
        new URLSearchParams(window.location.search).get("redirect") ?? "";
      if (redirectTo) window.location.assign(redirectTo);
    } catch (err) {
      console.error("[Header] signIn error:", err);
      toast.error("Sign in failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(firebaseAuth);
    } catch (err) {
      console.error("[Header] signOut error:", err);
      toast.error("Sign out failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {!user ? (
        <button
          type="button"
          disabled={isLoading}
          onClick={handleSignIn}
          className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Sign In
        </button>
      ) : (
        <>
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
            <AvatarFallback className="text-xs">
              {(user.displayName ?? user.email ?? "U").slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={handleSignOut}
            className="px-3 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export default function Header() {
  const [user] = useAuthState(firebaseAuth);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg">
      <HeaderLogo userName={user?.displayName || undefined} />
      <HeaderNav />
      <UserActions />
    </header>
  );
}
