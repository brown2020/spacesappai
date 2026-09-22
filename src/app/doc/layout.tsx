import type { ChildrenProps } from "@/types";

// ============================================================================
// DOC LAYOUT
// ============================================================================

/** Shared shell for /doc/* routes (auth lives under (app); public stays open). */
export default function DocLayout({ children }: ChildrenProps) {
  return children;
}
