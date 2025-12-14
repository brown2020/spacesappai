/**
 * Component barrel exports for cleaner imports
 *
 * Usage:
 * import { Header, Sidebar, Document } from "@/components";
 */

// ============================================================================
// LAYOUT COMPONENTS
// ============================================================================

export { default as Header } from "./Header";
export { default as Sidebar } from "./Sidebar";
export { default as Breadcrumbs } from "./Breadcrumbs";

// ============================================================================
// DOCUMENT COMPONENTS
// ============================================================================

export { default as Document } from "./Document";
export { default as Editor } from "./Editor";
export { default as DeleteDocument } from "./DeleteDocument";
export { default as InviteUser } from "./InviteUser";
export { default as ManageUsers } from "./ManageUsers";
export { default as NewDocumentButton } from "./NewDocumentButton";
export { default as SidebarOption } from "./SidebarOption";

// ============================================================================
// AI COMPONENTS
// ============================================================================

export { default as AIDialog } from "./AIDialog";
export { default as AIModelSelect } from "./AIModelSelect";
export { default as ChatToDocument } from "./ChatToDocument";
export { default as TranslateDocument } from "./TranslateDocument";

// ============================================================================
// COLLABORATION COMPONENTS
// ============================================================================

export { default as Avatars } from "./Avatars";
export { default as FollowPointer } from "./FollowPointer";
export { default as LiveCursorProvider } from "./LiveCursorProvider";

// ============================================================================
// PROVIDER COMPONENTS
// ============================================================================

export { default as LiveBlocksProvider } from "./LiveBlocksProvider";
export { default as RoomProvider } from "./RoomProvider";

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================

export { default as ClientOnly } from "./ClientOnly";
export { ErrorBoundary, DocumentErrorBoundary } from "./ErrorBoundary";

// ============================================================================
// UI COMPONENTS (re-export for convenience)
// ============================================================================

export { Button } from "./ui/button";
export { Input } from "./ui/input";
export { Spinner, SpinnerWithText } from "./ui/spinner";

