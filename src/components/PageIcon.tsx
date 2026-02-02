"use client";

import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// PAGE ICON COMPONENT
// ============================================================================

interface PageIconProps {
  icon?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: "w-4 h-4 text-sm",
  md: "w-6 h-6 text-xl",
  lg: "w-10 h-10 text-3xl",
} as const;

const ICON_SIZES = {
  sm: 14,
  md: 20,
  lg: 32,
} as const;

/**
 * Displays a page icon (emoji) or a default FileText icon
 * Used in sidebar, document header, and breadcrumbs
 */
export default function PageIcon({
  icon,
  size = "md",
  className,
}: PageIconProps) {
  const sizeClass = SIZE_CLASSES[size];

  if (icon) {
    return (
      <span
        className={cn(
          "flex items-center justify-center shrink-0",
          sizeClass,
          className
        )}
        role="img"
        aria-label="Page icon"
      >
        {icon}
      </span>
    );
  }

  return (
    <FileText
      className={cn("shrink-0 text-muted-foreground", className)}
      size={ICON_SIZES[size]}
    />
  );
}
