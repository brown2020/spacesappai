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
import { LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import { generateSummary } from "@/lib/generateActions";
import { readStreamableValue } from "ai/rsc";
import { MODELNAMES } from "@/constants/modelNames"; // Ensure this is the correct path

type Props = { doc: Y.Doc };
export default function TranslateDocument({ doc }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>("");
  const [modelName, setModelName] = useState<string>("gpt-4o"); // Default model
  const [summary, setSummary] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    try {
      const documentData = doc.get("document-store").toJSON();

      const result = await generateSummary(documentData, language, modelName);
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

      <DialogContent className="flex flex-col gap-3 w-[90vw] max-w-4xl max-h-[30rem] h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Translate the Document</DialogTitle>
          <DialogDescription>
            Select a Language and Model, and AI will translate a summary of the
            document in the selected language.
          </DialogDescription>
          <hr className="my-2" />
        </DialogHeader>

        <form className="flex items-center gap-4" onSubmit={handleSummary}>
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

          <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
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
