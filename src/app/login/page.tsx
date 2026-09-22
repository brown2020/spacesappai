import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to Spaces with email or Google.",
};

function FormFallback() {
  return (
    <div
      className="h-64 w-full animate-pulse rounded-xl bg-muted"
      aria-hidden="true"
    />
  );
}

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to collaborate on documents"
    >
      <Suspense fallback={<FormFallback />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
