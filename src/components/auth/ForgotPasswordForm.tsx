"use client";

import { FormEvent, useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/providers/authContext";

export function ForgotPasswordForm() {
  const { sendPasswordReset, authError, clearAuthError } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const errorId = useId();

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    clearAuthError();
    try {
      const ok = await sendPasswordReset(email);
      if (ok) setSent(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground" role="status">
          If an account exists for{" "}
          <span className="font-medium text-foreground">
            {email.trim() || "that address"}
          </span>
          , we sent a password reset link. Check your inbox and spam folder.
        </p>
        <Link href="/login" className="block">
          <Button className="w-full bg-brand text-brand-foreground hover:bg-brand/90">
            Back to sign in
          </Button>
        </Link>
        <button
          type="button"
          className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          onClick={() => {
            clearAuthError();
            setSent(false);
          }}
        >
          Try a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <p className="text-sm text-muted-foreground">
        Enter your email and we&apos;ll send a link to choose a new password.
      </p>

      {authError ? (
        <p
          id={errorId}
          role="alert"
          className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
        >
          {authError}
        </p>
      ) : null}

      <div>
        <label
          htmlFor="forgot-email"
          className="mb-1 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          id="forgot-email"
          type="email"
          autoFocus
          name="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          aria-describedby={authError ? errorId : undefined}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-brand text-brand-foreground hover:bg-brand/90"
        disabled={submitting}
      >
        {submitting ? "Please wait…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
