import { NextResponse } from "next/server";
import { adminAuth } from "@/firebase/firebaseAdmin";
import { SESSION_COOKIE_NAME } from "@/lib/firebase-session";
import { isProd } from "@/lib/env";

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
} as const;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { idToken?: string }
    | null;

  const idToken = body?.idToken;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json(
      { error: "Bad Request", message: "idToken is required" },
      { status: 400 }
    );
  }

  try {
    // Verify the client token, then mint an HttpOnly session cookie for SSR / server actions.
    const decoded = await adminAuth.verifyIdToken(idToken);

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: FIVE_DAYS_MS,
    });

    const res = NextResponse.json(
      { ok: true, uid: decoded.uid },
      { headers: { "Cache-Control": "no-store" } }
    );

    res.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: Math.floor(FIVE_DAYS_MS / 1000),
    });

    return res;
  } catch (error) {
    console.error("[session] Failed to create session:", error);
    return NextResponse.json(
      { error: "Unauthorized", message: "Invalid or expired token" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "no-store" } }
  );

  res.cookies.set(SESSION_COOKIE_NAME, "", {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return res;
}
