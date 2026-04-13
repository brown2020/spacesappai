// ============================================================================
// DOCUMENT & ROOM TYPES
// ============================================================================

/**
 * Room roles for document access control
 */
export type RoomRole = "owner" | "editor" | "viewer";

/**
 * Room document stored in Firestore.
 * Index signature allows spreading Firestore DocumentData without importing the client SDK.
 */
export interface RoomDocument {
  [key: string]: unknown;
  id?: string;
  createdAt: Date | string;
  role: RoomRole;
  roomId: string;
  userId: string;
  userEmail?: string;
}

/**
 * Grouped room documents by role
 */
export interface GroupedRoomDocuments {
  owner: RoomDocument[];
  editor: RoomDocument[];
  viewer: RoomDocument[];
}

/**
 * Comment on a document
 */
export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date | string;
}

// ============================================================================
// AI MODEL TYPES
// ============================================================================

/**
 * Supported AI model names
 */
export type AIModelName =
  | "gpt-4o"
  | "gemini-1.5-pro"
  | "mistral-large"
  | "claude-3-5-sonnet"
  | "llama-v3p1-405b";

/**
 * AI model option for select dropdowns
 */
export interface AIModelOption {
  label: string;
  value: AIModelName;
}

/**
 * Supported languages for translation
 */
export type SupportedLanguage =
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

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Base response type for server actions
 */
export type ActionResponse<T = void> =
  | { success: true; data: T }
  | { success: false; error: { code: ActionErrorCode; message: string } };

/**
 * Error codes for server actions
 */
export type ActionErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED";

/**
 * Document creation response
 */
export interface CreateDocumentResponse {
  docId: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Common props for components with children
 */
export interface ChildrenProps {
  children: React.ReactNode;
}

/**
 * Props for document-aware components
 */
export interface DocumentProps {
  id: string;
}


