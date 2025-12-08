import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract room/document ID from a pathname
 * Handles paths like /doc/[id] reliably
 * 
 * @param pathname - The URL pathname (e.g., "/doc/abc123")
 * @returns The room ID or null if not found
 */
export function getRoomIdFromPath(pathname: string): string | null {
  const match = pathname.match(/\/doc\/([^/]+)/);
  return match?.[1] || null;
}
