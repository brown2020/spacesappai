import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { DocumentSnapshot } from "firebase-admin/firestore";
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
 * Check if user has access to the room
 */
async function hasRoomAccess(
  userEmail: string,
  roomId: string
): Promise<boolean> {
  const usersInRoom = await adminDb
    .collectionGroup("rooms")
    .where("userId", "==", userEmail)
    .get();

  return usersInRoom.docs.some(
    (doc: DocumentSnapshot) => doc.id === roomId
  );
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
    const body = (await req.json()) as AuthRequestBody;
    const { room } = body;

    if (!room) {
      return errorResponse(400, "Bad Request", "Room ID is required");
    }

    // Check room access
    const hasAccess = await hasRoomAccess(userInfo.email, room);

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
    session.allow(room, session.FULL_ACCESS);

    // Authorize and return response
    const { body: authBody, status } = await session.authorize();
    return new NextResponse(authBody, { status });
  } catch (error) {
    console.error("[auth-endpoint] Error:", error);

    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return errorResponse(500, "Internal Server Error", message);
  }
}
