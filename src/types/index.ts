import { DocumentData } from "firebase/firestore";

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * User information from Clerk JWT session claims
 */
export interface User {
  email: string;
  image: string;
  fullName: string;
  firstName: string;
  lastName: string;
}

/**
 * Liveblocks user info for real-time presence
 */
export interface LiveblocksUserInfo {
  name: string;
  email: string;
  avatar: string;
}

// ============================================================================
// DOCUMENT & ROOM TYPES
// ============================================================================

/**
 * Room roles for document access control
 */
export type RoomRole = "owner" | "editor";

/**
 * Room document stored in Firestore
 */
export interface RoomDocument extends DocumentData {
  id?: string;
  createdAt: Date | string;
  role: RoomRole;
  roomId: string;
  userId: string;
  userEmail?: string;
}

/**
 * Document stored in Firestore
 */
export interface SpaceDocument {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Grouped room documents by role
 */
export interface GroupedRoomDocuments {
  owner: RoomDocument[];
  editor: RoomDocument[];
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
export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: {
    code: ActionErrorCode;
    message: string;
  };
}

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
 * Props for room-aware components
 */
export interface RoomProps {
  roomId: string;
}

/**
 * Props for document-aware components
 */
export interface DocumentProps {
  id: string;
}

// ============================================================================
// PRESENCE TYPES (Liveblocks)
// ============================================================================

/**
 * Cursor position for real-time collaboration
 */
export interface CursorPosition {
  x: number;
  y: number;
}

/**
 * User presence state
 */
export interface UserPresence {
  cursor: CursorPosition | null;
}

