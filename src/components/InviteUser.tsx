"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRoomId } from "@/hooks";
import { inviteUserToDocument } from "@/lib/documentActions";
import { isValidEmail, normalizeEmail, cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";
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
// MAIN COMPONENT
// ============================================================================

export default function InviteUser() {
  const roomId = useRoomId();
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

    if (!roomId) {
      setError("Unable to determine document ID");
      return;
    }

    startTransition(async () => {
      const result = await inviteUserToDocument(
        roomId,
        normalizeEmail(email)
      );

      if (result.success) {
        setIsOpen(false);
        setEmail("");
        toast.success(`Invited ${email} successfully`);
      } else {
        toast.error(result.error.message);
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
              className={cn(
                error && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {error && (
              <p
                id="email-error"
                className="flex items-center gap-1.5 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4" />
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
