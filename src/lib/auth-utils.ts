/**
 * Authentication utilities for extracting user information from session claims
 * Supports both Clerk's default claim names and custom claim names
 */

// ============================================================================
// EMAIL EXTRACTION
// ============================================================================

/**
 * Extract user email from session claims with fallback
 * Supports both Clerk's default claim names and custom claim names
 *
 * @param sessionClaims - JWT session claims from Clerk
 * @returns User email or "anonymous" if not found
 */
export function getUserEmail(
  sessionClaims: Record<string, unknown> | null
): string {
  if (typeof sessionClaims?.email === "string" && sessionClaims.email) {
    return sessionClaims.email;
  }
  if (
    typeof sessionClaims?.emailAddress === "string" &&
    sessionClaims.emailAddress
  ) {
    return sessionClaims.emailAddress;
  }
  if (
    typeof sessionClaims?.primaryEmailAddress === "string" &&
    sessionClaims.primaryEmailAddress
  ) {
    return sessionClaims.primaryEmailAddress;
  }
  return "anonymous";
}

// ============================================================================
// NAME EXTRACTION
// ============================================================================

/**
 * Extract user name from session claims with fallback
 * Supports both Clerk's default claim names and custom claim names
 *
 * @param sessionClaims - JWT session claims from Clerk
 * @returns User name or "Anonymous" if not found
 */
export function getUserName(
  sessionClaims: Record<string, unknown> | null
): string {
  if (typeof sessionClaims?.fullName === "string" && sessionClaims.fullName) {
    return sessionClaims.fullName;
  }
  if (typeof sessionClaims?.name === "string" && sessionClaims.name) {
    return sessionClaims.name;
  }
  if (sessionClaims?.firstName && sessionClaims?.lastName) {
    return `${sessionClaims.firstName} ${sessionClaims.lastName}`.trim();
  }
  if (typeof sessionClaims?.firstName === "string" && sessionClaims.firstName) {
    return sessionClaims.firstName;
  }
  return "Anonymous";
}

// ============================================================================
// AVATAR EXTRACTION
// ============================================================================

/**
 * Extract user avatar URL from session claims with fallback
 * Supports both Clerk's default claim names and custom claim names
 *
 * @param sessionClaims - JWT session claims from Clerk
 * @returns User avatar URL or empty string if not found
 */
export function getUserAvatar(
  sessionClaims: Record<string, unknown> | null
): string {
  if (typeof sessionClaims?.image === "string" && sessionClaims.image) {
    return sessionClaims.image;
  }
  if (typeof sessionClaims?.imageUrl === "string" && sessionClaims.imageUrl) {
    return sessionClaims.imageUrl;
  }
  if (typeof sessionClaims?.avatar === "string" && sessionClaims.avatar) {
    return sessionClaims.avatar;
  }
  if (
    typeof sessionClaims?.profileImageUrl === "string" &&
    sessionClaims.profileImageUrl
  ) {
    return sessionClaims.profileImageUrl;
  }
  return "";
}

// ============================================================================
// COMBINED USER INFO
// ============================================================================

/**
 * User info extracted from session claims
 */
export interface UserInfo {
  email: string;
  name: string;
  avatar: string;
}

/**
 * Extract all user info from session claims
 *
 * @param sessionClaims - JWT session claims from Clerk
 * @returns Object containing email, name, and avatar
 */
export function getUserInfo(
  sessionClaims: Record<string, unknown> | null
): UserInfo {
  return {
    email: getUserEmail(sessionClaims),
    name: getUserName(sessionClaims),
    avatar: getUserAvatar(sessionClaims),
  };
}




