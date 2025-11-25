"use client";

import { useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { inviteUserToDocument } from "@/lib/documentActions";
import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract room ID from pathname
 */
function getRoomIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/");
  return segments[segments.length - 1] || null;
}

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function InviteUser() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    const roomId = getRoomIdFromPath(pathname);
    if (!roomId) {
      setError("Unable to determine document ID");
      return;
    }

    startTransition(async () => {
      const { success, error: actionError } = await inviteUserToDocument(
        roomId,
        email.toLowerCase().trim()
      );

      if (success) {
        setIsOpen(false);
        setEmail("");
        toast.success(`Invited ${email} successfully`);
      } else {
        toast.error(actionError?.message || "Failed to invite user");
      }
    });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEmail("");
      setError("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Invite</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Collaborator</DialogTitle>
          <DialogDescription>
            Enter the email address of the person you want to invite to
            collaborate on this document.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleInvite}>
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              disabled={isPending}
              aria-invalid={!!error}
              aria-describedby={error ? "email-error" : undefined}
            />
            {error && (
              <p id="email-error" className="text-sm text-red-500">
                {error}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!email || isPending}>
              {isPending ? "Inviting..." : "Send Invite"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
