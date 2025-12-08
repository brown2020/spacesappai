"use client";

import { useState, useRef, useEffect } from "react";
import * as Y from "yjs";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { MessageCircleCode } from "lucide-react";
import { readStreamableValue } from "@ai-sdk/rsc";
import { generateAnswer } from "@/lib/generateActions";
import { AI_MODELS, DEFAULT_AI_MODEL } from "@/constants";
import type { AIModelName } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================================================
// TYPES
// ============================================================================

interface ChatToDocumentProps {
  doc: Y.Doc;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatToDocument({ doc }: ChatToDocumentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [modelName, setModelName] = useState<AIModelName>(DEFAULT_AI_MODEL);
  const [answer, setAnswer] = useState("");

  // Track if component is still mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track current request ID to allow cancellation of outdated requests
  const currentRequestIdRef = useRef(0);
  // AbortController for cancelling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Abort any in-flight request on unmount
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    // Get document data and validate it's not empty
    const documentData = doc.get("document-store").toJSON();
    if (!documentData || (typeof documentData === "string" && !documentData.trim())) {
      toast.error("Document is empty. Add some content before asking questions.");
      return;
    }

    // Abort any previous request
    abortControllerRef.current?.abort();
    
    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Increment request ID to invalidate any pending requests
    const requestId = ++currentRequestIdRef.current;

    setIsPending(true);
    setAnswer("");

    try {
      // Note: AbortSignal can't be passed to server actions, so cancellation
      // is handled client-side by checking abortController.signal.aborted
      const result = await generateAnswer(
        typeof documentData === "string" ? documentData : JSON.stringify(documentData),
        question,
        modelName
      );

      // Check if result is an error response (ActionResponse has 'success' property)
      if (result && typeof result === "object" && "success" in result) {
        const errorResponse = result as { success: boolean; error?: { message: string } };
        if (!errorResponse.success) {
          toast.error(errorResponse.error?.message || "Failed to get answer. Please try again.");
          return;
        }
      }

      // At this point, result is a StreamableValue
      for await (const content of readStreamableValue(result as Parameters<typeof readStreamableValue>[0])) {
        // Check if this request is still current, component is mounted, and not aborted
        if (
          !isMountedRef.current || 
          requestId !== currentRequestIdRef.current ||
          abortController.signal.aborted
        ) {
          break;
        }

        if (content && typeof content === "string") {
          setAnswer(content.trim());
        }
      }

      // Only show toast if still mounted, request is current, and not aborted
      if (
        isMountedRef.current && 
        requestId === currentRequestIdRef.current &&
        !abortController.signal.aborted
      ) {
        toast.success("Question answered successfully");
      }
    } catch (error) {
      // Don't log or show error for aborted requests
      if (abortController.signal.aborted) {
        return;
      }
      
      console.error("[ChatToDocument] Error:", error);
      if (isMountedRef.current && requestId === currentRequestIdRef.current) {
        toast.error("Failed to get answer. Please try again.");
      }
    } finally {
      if (
        isMountedRef.current && 
        requestId === currentRequestIdRef.current &&
        !abortController.signal.aborted
      ) {
        setIsPending(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Abort any in-flight request when closing
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      // Invalidate any pending request when closing
      currentRequestIdRef.current++;
      // Reset state when closing
      setQuestion("");
      setAnswer("");
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <MessageCircleCode className="mr-2 h-4 w-4" />
          Chat
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-4 w-[90vw] max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Ask any question about this document and AI will answer based on its
            content.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={handleAskQuestion}
        >
          <Input
            type="text"
            placeholder="What is this document about?"
            className="flex-1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isPending}
          />

          <Select
            value={modelName}
            onValueChange={(value) => setModelName(value as AIModelName)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {AI_MODELS.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" disabled={!question.trim() || isPending}>
            {isPending ? "Thinking..." : "Ask"}
          </Button>
        </form>

        {answer && (
          <div className="p-4 bg-gray-50 rounded-lg overflow-y-auto max-h-64 prose prose-sm max-w-none">
            <Markdown>{answer}</Markdown>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

