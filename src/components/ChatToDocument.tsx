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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELNAMES } from "@/constants/modelNames"; // Ensure this is the correct path

type Props = { doc: Y.Doc };
export default function ChatToDocument({ doc }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [modelName, setModelName] = useState<string>("gpt-4o"); // Default model
  const [summary, setSummary] = useState("");

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const documentData = doc.get("document-store").toJSON();

      const result = await generateAnswer(documentData, question, modelName);
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

      <DialogContent className="flex flex-col gap-3 w-[90vw] max-w-4xl max-h-[30rem] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a question to the document</DialogTitle>
          <DialogDescription>
            Enter the question you want to ask to the document.
          </DialogDescription>
        </DialogHeader>

        <form className="flex items-center gap-4" onSubmit={handleAskQuestion}>
          <Input
            type="text"
            placeholder="i.e. What is this about?"
            className="w-full"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />

          <Select
            value={modelName}
            onValueChange={(value) => setModelName(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              {MODELNAMES.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" disabled={!question || isPending}>
            {isPending ? "Asking..." : "Ask"}
          </Button>
        </form>

        {summary && (
          <div className="mt-4 p-5 bg-gray-100 rounded-md max-h-64 overflow-y-auto">
            <Markdown>{summary}</Markdown>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
