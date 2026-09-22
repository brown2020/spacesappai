"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import NewDocumentButton from "@/components/NewDocumentButton";
import { useAuth } from "@/providers/authContext";

export default function HomeAuthCta() {
  const {
    user,
    isLoading,
    signInWithGoogle,
    authError,
    clearAuthError,
  } = useAuth();
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto h-12 w-48 bg-muted rounded-xl animate-pulse" />
    );
  }

  if (user) {
    return (
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <NewDocumentButton
          variant="default"
          size="lg"
          className="text-base px-8"
        />
      </div>
    );
  }

  const onGoogle = async () => {
    clearAuthError();
    setGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/signup">
          <Button
            size="lg"
            className="w-full sm:w-auto text-base px-8 bg-brand text-brand-foreground hover:bg-brand/90 group"
          >
            Create account
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </Link>
        <Link href="/login">
          <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
            Sign in
          </Button>
        </Link>
      </div>
      <p className="text-sm text-muted-foreground">
        Use email and password on the sign-in pages, or continue with Google
        below.
      </p>
      <Button
        onClick={onGoogle}
        size="default"
        variant="secondary"
        disabled={googleSubmitting}
        className="w-full sm:w-auto"
      >
        {googleSubmitting ? "Please wait…" : "Continue with Google"}
      </Button>
      {authError ? (
        <p role="alert" className="text-sm text-destructive">
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
    </div>
  );
}
