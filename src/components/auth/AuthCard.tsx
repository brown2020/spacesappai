import type { ReactNode } from "react";
import Link from "next/link";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 animate-fade-in">
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight text-brand"
          >
            Spaces
          </Link>
          {subtitle ? (
            <p className="mt-2 text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-semibold text-foreground">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </main>
  );
}
