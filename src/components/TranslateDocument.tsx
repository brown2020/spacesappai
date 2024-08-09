"use client";

import Markdown from "react-markdown";

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

import { useState } from "react";

type Language =
  | "english"
  | "french"
  | "spanish"
  | "german"
  | "italian"
  | "portuguese"
  | "chinese"
  | "russian"
  | "hindi"
  | "japanese";

const languages: Language[] = [
  "english",
  "french",
  "spanish",
  "german",
  "italian",
  "portuguese",
  "chinese",
  "russian",
  "hindi",
  "japanese",
];

import * as Y from "yjs";
import { Button } from "./ui/button";
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@/lib/generateActions";
import { readStreamableValue } from "ai/rsc";

type Props = { doc: Y.Doc };
export default function TranslateDocument({ doc }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const documentData = doc.get("document-store").toJSON();

      const result = await generateSummary(documentData, language);
      for await (const content of readStreamableValue(result)) {
        if (content) {
          setSummary(content.trim());
        }
      }

      toast.success("Translated Summary successfully");
      setIsPending(false);
    } catch (err) {
      console.error("Purpose Error:", err);
      toast.error("Failed to Translate Summary");
      setIsPending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          <LanguagesIcon />
          Translate
        </DialogTrigger>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Translate the Document</DialogTitle>
          <DialogDescription>
            Select a Language and AI will translate a summary of the document in
            the selected language.
          </DialogDescription>
          <hr className="my-2" />
        </DialogHeader>

        <form className="flex gap-2" onSubmit={handleSummary}>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
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
