import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Spaces account with email or Google.",
};

function FormFallback() {
  return (
    <div
      className="h-64 w-full animate-pulse rounded-xl bg-muted"
      aria-hidden="true"
    />
  );
}

export default function SignupPage() {
  return (
    <AuthCard
      title="Create your account"
      subtitle="Email and password — or continue with Google"
    >
      <Suspense fallback={<FormFallback />}>
        <SignupForm />
      </Suspense>
    </AuthCard>
  );
}
