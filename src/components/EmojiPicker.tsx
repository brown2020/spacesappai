"use client";

import { useState, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// EMOJI DATA - Curated set of common emojis for document icons
// ============================================================================

const EMOJI_CATEGORIES = {
  recent: {
    label: "Recent",
    emojis: [] as string[], // Will be populated from localStorage
  },
  documents: {
    label: "Documents",
    emojis: ["📄", "📝", "📋", "📑", "📃", "📜", "📰", "🗒️", "📓", "📔", "📕", "📗", "📘", "📙"],
  },
  objects: {
    label: "Objects",
    emojis: ["💡", "🔧", "🔨", "⚙️", "🔩", "🔗", "📎", "✂️", "🖊️", "✏️", "📌", "📍", "🏷️", "🔖"],
  },
  symbols: {
    label: "Symbols",
    emojis: ["⭐", "✨", "💫", "🌟", "⚡", "🔥", "💥", "❤️", "💜", "💙", "💚", "💛", "🧡", "🤍"],
  },
  nature: {
    label: "Nature",
    emojis: ["🌱", "🌿", "🍀", "🌸", "🌺", "🌻", "🌼", "🌷", "🌹", "🍁", "🍂", "🌲", "🌳", "🌴"],
  },
  animals: {
    label: "Animals",
    emojis: ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐨", "🦁", "🐯", "🐮", "🐷", "🐸", "🐵", "🦄"],
  },
  food: {
    label: "Food",
    emojis: ["🍎", "🍊", "🍋", "🍇", "🍓", "🍒", "🍑", "🥑", "🍕", "🍔", "🍰", "🍩", "☕", "🍵"],
  },
  activities: {
    label: "Activities",
    emojis: ["🎯", "🎮", "🎲", "🎨", "🎭", "🎪", "🎢", "🎡", "🏆", "🥇", "🏅", "⚽", "🏀", "🎾"],
  },
  travel: {
    label: "Travel",
    emojis: ["🚀", "✈️", "🚁", "🚂", "🚗", "🚌", "🏠", "🏢", "🏰", "🗼", "🗽", "🌍", "🌎", "🌏"],
  },
  faces: {
    label: "Faces",
    emojis: ["😀", "😊", "🥰", "😎", "🤓", "🧐", "🤔", "😏", "🙃", "😴", "🥳", "🤩", "😇", "🤖"],
  },
} as const;

type CategoryKey = keyof typeof EMOJI_CATEGORIES;

// ============================================================================
// LOCAL STORAGE FOR RECENT EMOJIS
// ============================================================================

const RECENT_EMOJIS_KEY = "spaces-recent-emojis";
const MAX_RECENT_EMOJIS = 14;

function getRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_EMOJIS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentEmoji(emoji: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentEmojis().filter((e) => e !== emoji);
    recent.unshift(emoji);
    localStorage.setItem(
      RECENT_EMOJIS_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT_EMOJIS))
    );
  } catch {
    // Ignore storage errors
  }
}

// ============================================================================
// EMOJI PICKER COMPONENT
// ============================================================================

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onRemove?: () => void;
  children: React.ReactNode;
  currentEmoji?: string | null;
}

export default function EmojiPicker({
  onSelect,
  onRemove,
  children,
  currentEmoji,
}: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("documents");

  const handleSelect = useCallback(
    (emoji: string) => {
      addRecentEmoji(emoji);
      onSelect(emoji);
      setOpen(false);
    },
    [onSelect]
  );

  const handleRemove = useCallback(() => {
    onRemove?.();
    setOpen(false);
  }, [onRemove]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recentEmojis = useMemo(() => getRecentEmojis(), [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        {/* Category tabs */}
        <div className="flex gap-1 p-2 border-b overflow-x-auto">
          {recentEmojis.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveCategory("recent" as CategoryKey)}
              className={cn(
                "px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap",
                activeCategory === "recent"
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted"
              )}
            >
              Recent
            </button>
          )}
          {(Object.keys(EMOJI_CATEGORIES) as CategoryKey[])
            .filter((key) => key !== "recent")
            .map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={cn(
                  "px-2 py-1 text-xs rounded-md transition-colors whitespace-nowrap",
                  activeCategory === key
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                {EMOJI_CATEGORIES[key].label}
              </button>
            ))}
        </div>

        {/* Emoji grid */}
        <div className="p-2 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-7 gap-1">
            {(activeCategory === "recent"
              ? recentEmojis
              : EMOJI_CATEGORIES[activeCategory].emojis
            ).map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className={cn(
                  "w-8 h-8 flex items-center justify-center text-lg rounded-md hover:bg-muted transition-colors",
                  currentEmoji === emoji && "bg-accent"
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Remove icon button */}
        {currentEmoji && onRemove && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={handleRemove}
            >
              Remove icon
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
