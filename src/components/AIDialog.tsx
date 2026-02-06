"use client";

import { useState, type ReactNode, type FormEvent } from "react";
import dynamic from "next/dynamic";
import * as Y from "yjs";
import { toast } from "sonner";
import { useStreamingRequest } from "@/hooks";
import { getDocumentContent } from "@/lib/document-utils";
import { DEFAULT_AI_MODEL } from "@/constants";
import type { AIModelName } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Dynamically import Markdown for better code splitting
const Markdown = dynamic(() => import("react-markdown"), { ssr: false });

// ============================================================================
// TYPES
// ============================================================================

interface AIDialogChildrenProps {
  modelName: AIModelName;
  setModelName: (name: AIModelName) => void;
  isPending: boolean;
}

interface AIDialogProps {
  /** The Yjs document to operate on */
  doc: Y.Doc;
  /** Trigger button/element */
  trigger: ReactNode;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description: string;
  /** Toast message on success */
  successMessage: string;
  /** Toast message on error */
  errorMessage: string;
  /** Error message when document is empty */
  emptyDocumentMessage?: string;
  /** Render prop for form content */
  children: (props: AIDialogChildrenProps) => ReactNode;
  /** Handler for form submission - receives document content */
  onSubmit: (
    documentContent: string,
    modelName: AIModelName
  ) => Promise<unknown>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Shared base component for AI-powered dialogs
 * Handles common logic like document validation, streaming, and result display
 *
 * @example
 * ```tsx
 * <AIDialog
 *   doc={doc}
 *   trigger={<Button>Translate</Button>}
 *   title="Translate Document"
 *   description="Generate a translated summary"
 *   successMessage="Translation complete"
 *   errorMessage="Failed to translate"
 *   onSubmit={(content, model) => generateSummary(content, language, model)}
 * >
 *   {({ modelName, setModelName, isPending }) => (
 *     <form>...</form>
 *   )}
 * </AIDialog>
 * ```
 */
export default function AIDialog({
  doc,
  trigger,
  title,
  description,
  successMessage,
  errorMessage,
  emptyDocumentMessage = "Document is empty. Add some content first.",
  children,
  onSubmit,
}: AIDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [modelName, setModelName] = useState<AIModelName>(DEFAULT_AI_MODEL);

  const { isPending, result, execute, reset } = useStreamingRequest({
    successMessage,
    errorMessage,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const content = getDocumentContent(doc);
    if (!content) {
      toast.error(emptyDocumentMessage);
      return;
    }

    await execute(() => onSubmit(content, modelName));
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="flex flex-col gap-4 w-[90vw] max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={handleSubmit}
        >
          {children({ modelName, setModelName, isPending })}
        </form>

        {result && (
          <div className="p-4 bg-muted rounded-lg overflow-y-auto max-h-64 prose prose-sm max-w-none dark:prose-invert">
            <Markdown>{result}</Markdown>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

