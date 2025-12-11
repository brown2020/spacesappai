"use client";

import { AI_MODELS } from "@/constants";
import type { AIModelName } from "@/types";
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

interface AIModelSelectProps {
  value: AIModelName;
  onChange: (value: AIModelName) => void;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Reusable AI model selection dropdown
 * Used in TranslateDocument, ChatToDocument, and other AI features
 */
export default function AIModelSelect({
  value,
  onChange,
  disabled,
  className = "w-full sm:w-44",
}: AIModelSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as AIModelName)}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
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
  );
}
