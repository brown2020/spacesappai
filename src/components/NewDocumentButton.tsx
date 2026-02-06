"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { createNewDocument } from "@/lib/documentActions";
import { Button, type ButtonProps } from "./ui/button";

type NewDocumentButtonProps = Omit<ButtonProps, "onClick" | "disabled">;

export default function NewDocumentButton(props: NewDocumentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const result = await createNewDocument();

      if (result.success) {
        router.push(`/doc/${result.data.docId}`);
      } else {
        toast.error(result.error.message);
      }
    });
  };

  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending} {...props}>
      {isPending ? "Creating..." : "New Document"}
    </Button>
  );
}
