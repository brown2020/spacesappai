import LiveBlocksProvider from "@/components/LiveBlocksProvider";
import type { ChildrenProps } from "@/types";

// ============================================================================
// DOC LAYOUT
// ============================================================================

export default function DocLayout({ children }: ChildrenProps) {
  return <LiveBlocksProvider>{children}</LiveBlocksProvider>;
}
