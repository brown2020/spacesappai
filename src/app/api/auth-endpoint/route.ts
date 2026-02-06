import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/firebase/firebaseAdmin";
import { COLLECTIONS } from "@/firebase/firebaseConfig";
import { liveblocks } from "@/lib/liveblocks";
import { isUnauthorizedError, requireAuthenticatedUser } from "@/lib/firebase-session";

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
 * Check if user has access to a specific room and the document exists
 * Validates both the user's room entry and the actual document existence
 * to prevent access to stale/deleted documents
 */
interface RoomAccessResult {
  hasAccess: boolean;
  role?: string;
}

async function checkRoomAccess(userId: string, roomId: string): Promise<RoomAccessResult> {
  // Check both room access and document existence in parallel
  const [roomDoc, documentDoc] = await Promise.all([
    adminDb
      .collection(COLLECTIONS.USERS)
      .doc(userId)
      .collection(COLLECTIONS.ROOMS)
      .doc(roomId)
      .get(),
    adminDb.collection(COLLECTIONS.DOCUMENTS).doc(roomId).get(),
  ]);

  if (!roomDoc.exists || !documentDoc.exists) {
    return { hasAccess: false };
  }

  const role = roomDoc.data()?.role as string | undefined;
  return { hasAccess: true, role };
}

/**
 * Create an error response for API routes
 */
function apiErrorResponse(
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
    const user = await requireAuthenticatedUser();

    // Parse request body
    let body: AuthRequestBody;
    try {
      body = await req.json();
    } catch {
      return apiErrorResponse(400, "Bad Request", "Invalid JSON body");
    }

    const { room } = body;

    if (!room || typeof room !== "string") {
      return apiErrorResponse(400, "Bad Request", "Room ID is required");
    }

    // Sanitize room ID
    const roomId = room.trim();
    if (!roomId) {
      return apiErrorResponse(400, "Bad Request", "Room ID cannot be empty");
    }

    // Check room access and get role
    const { hasAccess, role } = await checkRoomAccess(user.uid, roomId);

    if (!hasAccess) {
      return apiErrorResponse(
        403,
        "Forbidden",
        "You do not have access to this room"
      );
    }

    // Prepare Liveblocks session
    const session = liveblocks.prepareSession(user.uid, {
      userInfo: {
        name: user.name ?? "Anonymous",
        email: user.email ?? "anonymous",
        avatar: user.picture ?? "",
      },
    });

    // Grant access based on role — viewers get read-only, others get full access
    if (role === "viewer") {
      session.allow(roomId, session.READ_ACCESS);
    } else {
      session.allow(roomId, session.FULL_ACCESS);
    }

    // Authorize and return response
    const { body: authBody, status } = await session.authorize();
    return new NextResponse(authBody, { status });
  } catch (error) {
    console.error("[auth-endpoint] Error:", error);

    if (isUnauthorizedError(error)) {
      return apiErrorResponse(401, "Unauthorized", "Please sign in to continue.");
    }

    // Don't expose internal error details
    return apiErrorResponse(
      500,
      "Internal Server Error",
      "An unexpected error occurred. Please try again."
    );
  }
}
