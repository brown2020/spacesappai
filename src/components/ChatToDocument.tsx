"use client";

import { useState } from "react";
import * as Y from "yjs";
import { MessageCircleCode } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import type { AIModelName } from "@/types";
import { Input } from "@/components/ui/input";
import AIDialog from "./AIDialog";
import AIModelSelect from "./AIModelSelect";

// ============================================================================
// TYPES
// ============================================================================

interface ChatToDocumentProps {
  doc: Y.Doc;
  roomId: string;
  readDocument?: () => string | null;
  generateAnswer: (
    roomId: string,
    document: string,
    question: string,
    modelName: AIModelName
  ) => Promise<unknown>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ChatToDocument({
  doc,
  roomId,
  readDocument,
  generateAnswer,
}: ChatToDocumentProps) {
  const [question, setQuestion] = useState("");

  return (
    <AIDialog
      doc={doc}
      trigger={
        <Button variant="outline">
          <MessageCircleCode className="mr-2 h-4 w-4" />
          Chat
        </Button>
      }
      title="Ask a Question"
      description="Ask any question about this document and AI will answer based on its content."
      successMessage="Question answered successfully"
      errorMessage="Failed to get answer. Please try again."
      emptyDocumentMessage="Document is empty. Add some content before asking questions."
      readDocument={readDocument}
      beforeSubmit={() => {
        if (question.trim()) return true;
        toast.error("Enter a question first.");
        return false;
      }}
      onSubmit={(content, modelName) => {
        if (!question.trim()) return Promise.reject(new Error("Question is required"));
        return generateAnswer(roomId, content, question, modelName);
      }}
    >
      {({ modelName, setModelName, isPending, portalContainer }) => (
        <>
          <Input
            type="text"
            placeholder="What is this document about?"
            className="flex-1"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isPending}
          />

          <AIModelSelect
            value={modelName}
            onChange={setModelName}
            disabled={isPending}
            portalContainer={portalContainer}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Thinking..." : "Ask"}
          </Button>
        </>
      )}
    </AIDialog>
  );
}
