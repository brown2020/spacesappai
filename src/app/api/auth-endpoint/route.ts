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
 */
function getUserInfo(sessionClaims: Record<string, unknown> | null) {
  return {
    email:
      typeof sessionClaims?.email === "string"
        ? sessionClaims.email
        : "anonymous",
    name:
      typeof sessionClaims?.fullName === "string"
        ? sessionClaims.fullName
        : "Anonymous",
    avatar:
      typeof sessionClaims?.image === "string" ? sessionClaims.image : "",
  };
}

/**
 * Check if user has access to a specific room
 * More efficient: queries only the specific room document instead of all rooms
 */
async function hasRoomAccess(
  userEmail: string,
  roomId: string
): Promise<boolean> {
  const roomDoc = await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("rooms")
    .doc(roomId)
    .get();

  return roomDoc.exists;
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
