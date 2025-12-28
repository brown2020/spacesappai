/**
 * Shared utilities for server actions
 * Provides consistent error and success response formatting
 */

import type { ActionResponse, ActionErrorCode } from "@/types";

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Create a standardized error response for server actions
 *
 * @param code - Error code for categorization
 * @param message - Human-readable error message
 * @returns ActionResponse with success: false and error details
 *
 * @example
 * ```ts
 * return errorResponse("VALIDATION_ERROR", "Email is required");
 * ```
 */
export function errorResponse<T = undefined>(
  code: ActionErrorCode,
  message: string
): ActionResponse<T> {
  return {
    success: false,
    error: { code, message },
  };
}

/**
 * Create a standardized success response for server actions
 *
 * @param data - Optional data to include in response
 * @returns ActionResponse with success: true and optional data
 *
 * @example
 * ```ts
 * return successResponse({ docId: "abc123" });
 * // or
 * return successResponse();
 * ```
 */
export function successResponse<T>(data?: T): ActionResponse<T> {
  return {
    success: true,
    data,
  };
}
