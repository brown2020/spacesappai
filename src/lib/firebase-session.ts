import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/firebase/firebaseAdmin";

export const SESSION_COOKIE_NAME = "__session";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

function decodeToUser(decoded: DecodedIdToken): AuthenticatedUser {
  return {
    uid: decoded.uid,
    email: typeof decoded.email === "string" ? decoded.email : null,
    name: typeof decoded.name === "string" ? decoded.name : null,
    picture: typeof decoded.picture === "string" ? decoded.picture : null,
  };
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodeToUser(decoded);
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAuthenticatedUserOrRedirect(
  redirectTo: string
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}


