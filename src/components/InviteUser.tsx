"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { inviteUserToDocument } from "@/lib/documentActions";

export default function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const [email, setEmail] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const roomId = pathname.split("/").pop();
    if (!roomId) return;
    startTransition(async () => {
      const { success } = await inviteUserToDocument(roomId, email);

      if (success) {
        setIsOpen(false);
        setEmail("");
        toast.success("User added to document successfully");
      } else {
        toast.error("Failed to add user to room!");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>Invite</DialogTrigger>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user to collaborate!</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite.
          </DialogDescription>
        </DialogHeader>

        <form className="flex gap-2" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
