"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs";
import SearchDialog from "./SearchDialog";
import { useAuth } from "@/providers/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// ============================================================================
// HEADER LOGO
// ============================================================================

interface HeaderLogoProps {
  userName?: string;
}

function HeaderLogo({ userName }: HeaderLogoProps) {
  const displayName = userName ? `${userName}'s Space` : "Spaces";

  return (
    <Link href="/" className="hover:opacity-90 transition-opacity">
      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight">
        {displayName}
      </h1>
    </Link>
  );
}

// ============================================================================
// HEADER NAVIGATION
// ============================================================================

function HeaderNav() {
  return (
    <div className="hidden sm:block mx-2 px-3 py-2 rounded-md bg-white/90 dark:bg-white/10 backdrop-blur-sm shadow-sm">
      <Breadcrumbs />
    </div>
  );
}

// ============================================================================
// THEME TOGGLE
// ============================================================================

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-brand-foreground hover:bg-white/10"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

// ============================================================================
// USER ACTIONS
// ============================================================================

function UserActions() {
  const { user, isLoading, logout, authError, clearAuthError } = useAuth();

  const handleSignOut = useCallback(async () => {
    clearAuthError();
    await logout();
  }, [clearAuthError, logout]);

  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {!user ? (
        <>
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-lg transition-colors aria-disabled:opacity-60"
            aria-disabled={isLoading || undefined}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 text-sm font-medium bg-white text-brand hover:bg-white/90 rounded-lg transition-colors"
          >
            Create account
          </Link>
          {authError ? (
            <p
              role="alert"
              className="hidden sm:block text-xs text-rose-200 max-w-[200px] text-right"
            >
              {authError}{" "}
              <button
                type="button"
                className="underline underline-offset-2"
                onClick={clearAuthError}
              >
                Dismiss
              </button>
            </p>
          ) : null}
        </>
      ) : (
        <>
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.photoURL ?? ""}
              alt={user.displayName ?? ""}
            />
            <AvatarFallback className="text-xs">
              {(user.displayName ?? user.email ?? "U")
                .slice(0, 1)
                .toUpperCase()}
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
  const { user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut to open search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-brand to-brand/80 text-brand-foreground shadow-lg">
        <HeaderLogo userName={user?.displayName || undefined} />
        <HeaderNav />
        <UserActions />
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
