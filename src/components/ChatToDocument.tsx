"use client";

import * as Y from "yjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { MessageCircleCode } from "lucide-react";
import Markdown from "react-markdown";
import { generateAnswer } from "@/lib/generateActions";
import { readStreamableValue } from "ai/rsc";

type Props = { doc: Y.Doc };
export default function ChatToDocument({ doc }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const documentData = doc.get("document-store").toJSON();

      const result = await generateAnswer(documentData, question);
      for await (const content of readStreamableValue(result)) {
        if (content) {
          setSummary(content.trim());
        }
      }

      toast.success("Answered question successfully");
      setIsPending(false);
    } catch (err) {
      console.error("Purpose Error:", err);
      toast.error("Failed to answer question");
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          <MessageCircleCode className="mr-2" /> Chat to document
        </DialogTrigger>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ask a question to the document</DialogTitle>
          <DialogDescription>
            Enter the question you want to ask to the document.
          </DialogDescription>
        </DialogHeader>

        <form className="flex gap-2" onSubmit={handleAskQuestion}>
          <Input
            type="text"
            placeholder="i.e. What is this about?"
            className="w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="submit" disabled={!question || isPending}>
            {isPending ? "Asking..." : "Ask"}
          </Button>
        </form>

        {summary && (
          <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100">
            <Markdown>{summary}</Markdown>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
