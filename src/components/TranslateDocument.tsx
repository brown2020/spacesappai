"use client";

import { useState } from "react";
import * as Y from "yjs";
import { LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import { SUPPORTED_LANGUAGES, LANGUAGE_LABELS } from "@/constants";
import type { AIModelName, SupportedLanguage } from "@/types";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AIDialog from "./AIDialog";
import AIModelSelect from "./AIModelSelect";

// ============================================================================
// TYPES
// ============================================================================

interface TranslateDocumentProps {
  doc: Y.Doc;
  roomId: string;
  readDocument?: () => string | null;
  generateSummary: (
    roomId: string,
    document: string,
    language: string,
    modelName: AIModelName
  ) => Promise<unknown>;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TranslateDocument({
  doc,
  roomId,
  readDocument,
  generateSummary,
}: TranslateDocumentProps) {
  const [language, setLanguage] = useState<SupportedLanguage | "">("");

  return (
    <AIDialog
      doc={doc}
      trigger={
        <Button variant="outline">
          <LanguagesIcon className="mr-2 h-4 w-4" />
          Translate
        </Button>
      }
      title="Translate Document"
      description="Generate a translated summary of this document in your preferred language."
      successMessage={
        language ? `Summary translated to ${LANGUAGE_LABELS[language]}` : ""
      }
      errorMessage="Failed to translate. Please try again."
      emptyDocumentMessage="Document is empty. Add some content before translating."
      readDocument={readDocument}
      beforeSubmit={() => {
        if (language) return true;
        toast.error("Select a language first.");
        return false;
      }}
      onSubmit={(content, modelName) => {
        if (!language) return Promise.reject(new Error("Language is required"));
        return generateSummary(roomId, content, language, modelName);
      }}
    >
      {({ modelName, setModelName, isPending, portalContainer }) => (
        <>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as SupportedLanguage)}
            disabled={isPending}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent container={portalContainer}>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AIModelSelect
            value={modelName}
            onChange={setModelName}
            disabled={isPending}
            portalContainer={portalContainer}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </>
      )}
    </AIDialog>
  );
}
