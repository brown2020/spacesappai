"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NewDocumentButton from "@/components/NewDocumentButton";
import { useAuth } from "@/providers/authContext";

type AuthMode = "signin" | "signup" | "forgot" | "forgot-sent";

const MODE_HEADINGS: Record<AuthMode, string> = {
  signin: "Sign in with email",
  signup: "Create an account",
  forgot: "Reset your password",
  "forgot-sent": "Check your email",
};

export default function HomeAuthCta() {
  const {
    user,
    isLoading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    sendPasswordReset,
    authError,
    clearAuthError,
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const emailInputRef = useRef<HTMLInputElement>(null);
  const formHeadingId = useId();
  const errorId = useId();

  useEffect(() => {
    if (!showEmail) return;
    emailInputRef.current?.focus();
  }, [mode, showEmail]);

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

  const switchMode = (next: AuthMode) => {
    clearAuthError();
    setPassword("");
    setMode(next);
  };

  const toggleEmailPanel = () => {
    clearAuthError();
    setShowEmail((value) => {
      const next = !value;
      if (next) setMode("signin");
      return next;
    });
  };

  const onEmailSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    clearAuthError();
    try {
      if (mode === "forgot") {
        const ok = await sendPasswordReset(email);
        if (ok) setMode("forgot-sent");
        return;
      }
      if (mode === "signup") {
        await signUpWithEmail(email, password);
        return;
      }
      await signInWithEmail(email, password);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel =
    mode === "signup"
      ? "Create account"
      : mode === "forgot"
        ? "Send reset link"
        : "Sign in with email";

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <Button
        onClick={signInWithGoogle}
        size="lg"
        className="w-full text-base px-8"
      >
        Continue with Google
      </Button>

      <button
        type="button"
        className="text-sm font-medium text-brand underline-offset-2 hover:underline"
        onClick={toggleEmailPanel}
        aria-expanded={showEmail}
      >
        {showEmail ? "Hide email options" : "Use email instead"}
      </button>

      {showEmail ? (
        <div
          className="space-y-3 text-left rounded-2xl border border-border bg-card/80 p-4 shadow-sm"
          role="region"
          aria-labelledby={formHeadingId}
        >
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Email auth mode"
          >
            {(
              [
                ["signin", "Sign in"],
                ["signup", "Create account"],
                ["forgot", "Forgot password"],
              ] as const
            ).map(([value, label]) => {
              const selected =
                mode === value || (value === "forgot" && mode === "forgot-sent");
              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={
                    selected
                      ? "rounded-lg px-3 py-1.5 text-sm font-semibold bg-brand text-brand-foreground"
                      : "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                  }
                  onClick={() => switchMode(value)}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <h3
            id={formHeadingId}
            className="text-base font-semibold text-foreground"
          >
            {MODE_HEADINGS[mode]}
          </h3>

          {mode === "forgot-sent" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground" role="status">
                If an account exists for{" "}
                <span className="font-medium text-foreground">
                  {email.trim() || "that address"}
                </span>
                , we sent a password reset link. Check your inbox and spam
                folder.
              </p>
              <button
                type="button"
                className="text-sm font-medium text-brand underline-offset-2 hover:underline"
                onClick={() => switchMode("signin")}
              >
                Back to sign in
              </button>
            </div>
          ) : (
            <form onSubmit={onEmailSubmit} className="space-y-3" noValidate>
              <div>
                <label
                  htmlFor="home-auth-email"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Email
                </label>
                <Input
                  ref={emailInputRef}
                  id="home-auth-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  aria-describedby={authError ? errorId : undefined}
                />
              </div>
              {mode !== "forgot" ? (
                <div>
                  <label
                    htmlFor="home-auth-password"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="home-auth-password"
                    type="password"
                    name="password"
                    autoComplete={
                      mode === "signup" ? "new-password" : "current-password"
                    }
                    required
                    minLength={mode === "signup" ? 6 : undefined}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={
                      mode === "signup"
                        ? "At least 6 characters"
                        : "Your password"
                    }
                    aria-describedby={authError ? errorId : undefined}
                  />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  We&apos;ll email you a link to choose a new password.
                </p>
              )}
              {authError ? (
                <p
                  id={errorId}
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {authError}
                </p>
              ) : null}
              <Button
                type="submit"
                size="default"
                disabled={submitting}
                className="w-full"
              >
                {submitting ? "Please wait…" : submitLabel}
              </Button>
              {mode === "signin" ? (
                <p className="text-xs text-muted-foreground">
                  New here?{" "}
                  <button
                    type="button"
                    className="font-medium text-brand underline-offset-2 hover:underline"
                    onClick={() => switchMode("signup")}
                  >
                    Create an account
                  </button>
                  {" · "}
                  <button
                    type="button"
                    className="font-medium text-brand underline-offset-2 hover:underline"
                    onClick={() => switchMode("forgot")}
                  >
                    Forgot password?
                  </button>
                </p>
              ) : null}
              {mode === "signup" ? (
                <p className="text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-brand underline-offset-2 hover:underline"
                    onClick={() => switchMode("signin")}
                  >
                    Sign in
                  </button>
                </p>
              ) : null}
            </form>
          )}
        </div>
      ) : null}

      {authError && !showEmail ? (
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
