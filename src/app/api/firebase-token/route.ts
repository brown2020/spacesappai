import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { getUserEmail } from "@/lib/auth-utils";

export async function POST() {
  const { userId, sessionClaims } = await auth.protect();

  // uid for Firebase Auth is the Clerk userId (stable + unique)
  const uid = userId;
  const email = getUserEmail(sessionClaims);

  const token = await adminAuth.createCustomToken(uid, {
    // Keep email around for app/UI/debugging (rules use uid).
    email: email === "anonymous" ? undefined : email,
  });

  return NextResponse.json(
    { token },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}


