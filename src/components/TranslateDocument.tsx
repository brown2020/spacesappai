"use client";

import { useState, useRef, useEffect } from "react";
import * as Y from "yjs";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { LanguagesIcon } from "lucide-react";
import { readStreamableValue } from "@ai-sdk/rsc";
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
  const [isPending, setIsPending] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage | "">("");
  const [modelName, setModelName] = useState<AIModelName>(DEFAULT_AI_MODEL);
  const [summary, setSummary] = useState("");

  // Track if component is still mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  // Track current request ID to allow cancellation of outdated requests
  const currentRequestIdRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleTranslate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!language) return;

    // Increment request ID to invalidate any pending requests
    const requestId = ++currentRequestIdRef.current;

    setIsPending(true);
    setSummary("");

    try {
      const documentData = doc.get("document-store").toJSON();
      const result = await generateSummary(documentData, language, modelName);

      for await (const content of readStreamableValue(result)) {
        // Check if this request is still current and component is mounted
        if (!isMountedRef.current || requestId !== currentRequestIdRef.current) {
          break;
        }

        if (content) {
          setSummary(content.trim());
        }
      }

      // Only show toast if still mounted and request is current
      if (isMountedRef.current && requestId === currentRequestIdRef.current) {
        toast.success(`Summary translated to ${LANGUAGE_LABELS[language]}`);
      }
    } catch (error) {
      console.error("[TranslateDocument] Error:", error);
      if (isMountedRef.current && requestId === currentRequestIdRef.current) {
        toast.error("Failed to translate. Please try again.");
      }
    } finally {
      if (isMountedRef.current && requestId === currentRequestIdRef.current) {
        setIsPending(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Invalidate any pending request when closing
      currentRequestIdRef.current++;
      // Reset state when closing
      setLanguage("");
      setSummary("");
      setIsPending(false);
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
