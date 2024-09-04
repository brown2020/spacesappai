import { adminDb } from "@/firebase/firebaseAdmin";
import { liveblocks } from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { DocumentSnapshot } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    const { sessionClaims } = await auth().protect();
    const { room } = await req.json();

    const session = liveblocks.prepareSession(
      sessionClaims?.email || "noEmail",
      {
        userInfo: {
          name: sessionClaims?.fullName || "noName",
          email: sessionClaims?.email || "",
          avatar: sessionClaims?.image || "",
        },
      }
    );

    const usersInRoom = await adminDb
      .collectionGroup("rooms")
      .where("userId", "==", sessionClaims?.email || "")
      .get();

    const userInRoom = usersInRoom.docs.find(
      (doc: DocumentSnapshot) => doc.id === room
    );

    if (userInRoom) {
      session.allow(room, session.FULL_ACCESS);
      const { body, status } = await session.authorize();
      return new NextResponse(body, { status });
    } else {
      return NextResponse.json(
        { message: "You are not in this room" },
        { status: 403 }
      );
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "An error occurred", error: errorMessage },
      { status: 500 }
    );
  }
}
