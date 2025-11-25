import type { User } from "./index";

/**
 * Global type declarations
 */

declare global {
  /**
   * Clerk JWT session claims type
   */
  type CustomJwtSessionClaims = User;
}

export {};
