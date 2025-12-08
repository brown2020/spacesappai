import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validate email format
 * Basic validation that checks for presence of @ and domain
 *
 * @param email - Email string to validate
 * @returns true if email format is valid
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate that a string is a valid Firestore document ID
 * Firestore IDs must:
 * - Be between 1 and 1500 bytes (we use a simpler character limit)
 * - Not contain forward slashes
 * - Not be solely "." or ".."
 * - Not match the pattern __.*__
 * 
 * @param id - The ID to validate
 * @returns true if the ID is valid
 */
export function isValidDocumentId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  if (id.length === 0 || id.length > 500) return false;
  if (id === "." || id === "..") return false;
  if (id.includes("/")) return false;
  if (/^__.*__$/.test(id)) return false;
  return true;
}

/**
 * Extract room/document ID from a pathname
 * Handles paths like /doc/[id] reliably
 * Validates the extracted ID to ensure it's a valid Firestore document ID
 * 
 * @param pathname - The URL pathname (e.g., "/doc/abc123")
 * @returns The room ID or null if not found or invalid
 */
export function getRoomIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/doc\/([^/]+)/);
  const id = match?.[1];
  
  if (!id) return null;
  
  // Decode URI component in case of encoded characters
  try {
    const decodedId = decodeURIComponent(id);
    return isValidDocumentId(decodedId) ? decodedId : null;
  } catch {
    // decodeURIComponent can throw on malformed URIs
    return null;
  }
}
