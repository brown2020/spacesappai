"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createNewDocument } from "@/lib/documentActions";
import { Button } from "./ui/button";

export default function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const { success, data, error } = await createNewDocument();

      if (success && data?.docId) {
        router.push(`/doc/${data.docId}`);
      } else {
        toast.error(error?.message || "Failed to create document");
      }
    });
  };

  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}>
      {isPending ? "Creating..." : "New Document"}
    </Button>
  );
}
