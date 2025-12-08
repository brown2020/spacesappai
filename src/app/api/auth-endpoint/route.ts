import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminDb } from "@/firebase/firebaseAdmin";
import { liveblocks } from "@/lib/liveblocks";

// ============================================================================
// TYPES
// ============================================================================

interface AuthRequestBody {
  room: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Extract user info from session claims
 * Supports both Clerk's default claim names and custom claim names
 */
function getUserInfo(sessionClaims: Record<string, unknown> | null) {
  // Try multiple possible claim names for email
  const email = 
    (typeof sessionClaims?.email === "string" && sessionClaims.email) ||
    (typeof sessionClaims?.emailAddress === "string" && sessionClaims.emailAddress) ||
    (typeof sessionClaims?.primaryEmailAddress === "string" && sessionClaims.primaryEmailAddress) ||
    "anonymous";

  // Try multiple possible claim names for name
  const name = 
    (typeof sessionClaims?.fullName === "string" && sessionClaims.fullName) ||
    (typeof sessionClaims?.name === "string" && sessionClaims.name) ||
    (sessionClaims?.firstName && sessionClaims?.lastName 
      ? `${sessionClaims.firstName} ${sessionClaims.lastName}`.trim()
      : null) ||
    (typeof sessionClaims?.firstName === "string" && sessionClaims.firstName) ||
    "Anonymous";

  // Try multiple possible claim names for avatar
  const avatar = 
    (typeof sessionClaims?.image === "string" && sessionClaims.image) ||
    (typeof sessionClaims?.imageUrl === "string" && sessionClaims.imageUrl) ||
    (typeof sessionClaims?.avatar === "string" && sessionClaims.avatar) ||
    (typeof sessionClaims?.profileImageUrl === "string" && sessionClaims.profileImageUrl) ||
    "";

  return { email, name, avatar };
}

/**
 * Check if user has access to a specific room and the document exists
 * Validates both the user's room entry and the actual document existence
 * to prevent access to stale/deleted documents
 */
async function hasRoomAccess(
  userEmail: string,
  roomId: string
): Promise<boolean> {
  // Check both room access and document existence in parallel
  const [roomDoc, documentDoc] = await Promise.all([
    adminDb
      .collection("users")
      .doc(userEmail)
      .collection("rooms")
      .doc(roomId)
      .get(),
    adminDb
      .collection("documents")
      .doc(roomId)
      .get(),
  ]);

  // User must have a room entry AND the document must exist
  return roomDoc.exists && documentDoc.exists;
}

/**
 * Create an error response
 */
function errorResponse(
  status: number,
  error: string,
  message: string
): NextResponse<ErrorResponse> {
  return NextResponse.json({ error, message }, { status });
}

// ============================================================================
// ROUTE HANDLER
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    // Authenticate the user
    const { sessionClaims } = await auth.protect();
    const userInfo = getUserInfo(sessionClaims);

    // Parse request body
    let body: AuthRequestBody;
    try {
      body = await req.json();
    } catch {
      return errorResponse(400, "Bad Request", "Invalid JSON body");
    }

    const { room } = body;

    if (!room || typeof room !== "string") {
      return errorResponse(400, "Bad Request", "Room ID is required");
    }

    // Sanitize room ID
    const roomId = room.trim();
    if (!roomId) {
      return errorResponse(400, "Bad Request", "Room ID cannot be empty");
    }

    // Check room access (efficient single document lookup)
    const hasAccess = await hasRoomAccess(userInfo.email, roomId);

    if (!hasAccess) {
      return errorResponse(
        403,
        "Forbidden",
        "You do not have access to this room"
      );
    }

    // Prepare Liveblocks session
    const session = liveblocks.prepareSession(userInfo.email, {
      userInfo: {
        name: userInfo.name,
        email: userInfo.email,
        avatar: userInfo.avatar,
      },
    });

    // Grant full access to the room
    session.allow(roomId, session.FULL_ACCESS);

    // Authorize and return response
    const { body: authBody, status } = await session.authorize();
    return new NextResponse(authBody, { status });
  } catch (error) {
    console.error("[auth-endpoint] Error:", error);

    // Don't expose internal error details
    return errorResponse(
      500,
      "Internal Server Error",
      "An unexpected error occurred. Please try again."
    );
  }
}
