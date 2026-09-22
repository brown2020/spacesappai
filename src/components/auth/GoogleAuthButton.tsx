"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/authContext";

export function GoogleAuthButton({
  label = "Continue with Google",
}: {
  label?: string;
}) {
  const { signInWithGoogle, clearAuthError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const onClick = async () => {
    clearAuthError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={onClick}
      disabled={submitting}
    >
      {submitting ? "Please wait…" : label}
    </Button>
  );
}
