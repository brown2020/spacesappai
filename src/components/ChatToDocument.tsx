"use client";

import { useState } from "react";
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

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) return;

    setIsPending(true);
    setAnswer("");

    try {
      const documentData = doc.get("document-store").toJSON();
      const result = await generateAnswer(documentData, question, modelName);

      for await (const content of readStreamableValue(result)) {
        if (content) {
          setAnswer(content.trim());
        }
      }

      toast.success("Question answered successfully");
    } catch (error) {
      console.error("[ChatToDocument] Error:", error);
      toast.error("Failed to get answer. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setQuestion("");
      setAnswer("");
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
