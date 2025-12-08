"use client";

import { useState } from "react";
import * as Y from "yjs";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { LanguagesIcon } from "lucide-react";
import { useStreamingRequest } from "@/hooks";
import { generateSummary } from "@/lib/generateActions";
import {
  AI_MODELS,
  DEFAULT_AI_MODEL,
  SUPPORTED_LANGUAGES,
  LANGUAGE_LABELS,
} from "@/constants";
import type { AIModelName, SupportedLanguage } from "@/types";
import { Button } from "./ui/button";
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

interface TranslateDocumentProps {
  doc: Y.Doc;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TranslateDocument({ doc }: TranslateDocumentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage | "">("");
  const [modelName, setModelName] = useState<AIModelName>(DEFAULT_AI_MODEL);

  const {
    isPending,
    result: summary,
    execute,
    reset,
  } = useStreamingRequest({
    successMessage: language
      ? `Summary translated to ${LANGUAGE_LABELS[language]}`
      : undefined,
    errorMessage: "Failed to translate. Please try again.",
  });

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!language) return;

    // Get document data and validate it's not empty
    const documentData = doc.get("document-store").toJSON();
    if (
      !documentData ||
      (typeof documentData === "string" && !documentData.trim())
    ) {
      toast.error("Document is empty. Add some content before translating.");
      return;
    }

    await execute(() =>
      generateSummary(
        typeof documentData === "string"
          ? documentData
          : JSON.stringify(documentData),
        language,
        modelName
      )
    );
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset state when closing
      setLanguage("");
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LanguagesIcon className="mr-2 h-4 w-4" />
          Translate
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-4 w-[90vw] max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Translate Document</DialogTitle>
          <DialogDescription>
            Generate a translated summary of this document in your preferred
            language.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col sm:flex-row gap-3"
          onSubmit={handleTranslate}
        >
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </form>

        {summary && (
          <div className="p-4 bg-gray-50 rounded-lg overflow-y-auto max-h-64 prose prose-sm max-w-none">
            <Markdown>{summary}</Markdown>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
