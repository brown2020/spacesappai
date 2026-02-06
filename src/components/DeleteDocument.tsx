"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useRoomId } from "@/hooks";
import { deleteDocument } from "@/lib/documentActions";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function DeleteDocument() {
  const roomId = useRoomId();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!roomId) {
      toast.error("Unable to determine document ID");
      return;
    }

    startTransition(async () => {
      const result = await deleteDocument(roomId);

      if (result.success) {
        setIsOpen(false);
        router.replace("/");
        toast.success("Document deleted successfully");
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Document?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the
            document and remove access for all collaborators.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
