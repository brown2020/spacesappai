"use client";

import {
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { deleteCookie } from "cookies-next";
import { auth } from "@/firebase/firebaseConfig";
import { mapFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { AuthContext, type AuthContextType } from "./authContext";

const googleProvider = new GoogleAuthProvider();

type AuthState = {
  user: User | null;
  isLoading: boolean;
  authError: string | null;
};

type AuthAction =
  | { type: "sync-start"; user: User | null }
  | { type: "sync-success"; user: User | null }
  | { type: "sync-failure"; message: string }
  | { type: "set-error"; message: string | null };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "sync-start":
      return { user: action.user, isLoading: true, authError: null };
    case "sync-success":
      return { user: action.user, isLoading: false, authError: null };
    case "sync-failure":
      return { ...state, isLoading: false, authError: action.message };
    case "set-error":
      return { ...state, authError: action.message };
    default:
      return state;
  }
}

async function syncSessionCookie(user: User | null) {
  if (!user) {
    const response = await fetch("/api/auth/session", { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Failed to clear session cookie");
    }
    return;
  }
  const idToken = await user.getIdToken(true);
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  if (!response.ok) {
    throw new Error("Failed to create session cookie");
  }
}

function readSafeRedirectPath(): string | null {
  if (typeof window === "undefined") return null;
  const redirectPath = new URLSearchParams(window.location.search).get(
    "redirect"
  );
  if (!redirectPath?.startsWith("/") || redirectPath.startsWith("//")) {
    return null;
  }
  return redirectPath;
}

function dispatchMappedError(
  dispatch: Dispatch<AuthAction>,
  error: unknown,
  fallback: string
) {
  dispatch({
    type: "set-error",
    message: mapFirebaseAuthError(error, fallback),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isLoading: true,
    authError: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch({ type: "sync-success", user });
    });
    return () => unsubscribe();
  }, []);

  const clearAuthError = useCallback(() => {
    dispatch({ type: "set-error", message: null });
  }, []);

  const finishAuthenticatedSession = useCallback(async (user: User) => {
    await syncSessionCookie(user);
    dispatch({ type: "sync-success", user });
    const redirectPath = readSafeRedirectPath();
    if (redirectPath) {
      // Full navigation after auth — avoids useEffect client redirects.
      window.location.assign(redirectPath);
    }
  }, []);

  const signInWithGoogle = useCallback(async () => {
    try {
      dispatch({ type: "set-error", message: null });
      const credential = await signInWithPopup(auth, googleProvider);
      await finishAuthenticatedSession(credential.user);
    } catch (error) {
      // Handled via authError — do not rethrow (avoids Next.js FirebaseError overlay).
      dispatchMappedError(
        dispatch,
        error,
        "Failed to sign in. Please try again."
      );
    }
  }, [finishAuthenticatedSession]);

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: "set-error", message: null });
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        await finishAuthenticatedSession(credential.user);
      } catch (error) {
        dispatchMappedError(
          dispatch,
          error,
          "Email sign-in failed. Check your email and password."
        );
      }
    },
    [finishAuthenticatedSession]
  );

  const signUpWithEmail = useCallback(
    async (email: string, password: string) => {
      try {
        dispatch({ type: "set-error", message: null });
        const credential = await createUserWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        await finishAuthenticatedSession(credential.user);
      } catch (error) {
        dispatchMappedError(
          dispatch,
          error,
          "Could not create account. Please try again."
        );
      }
    },
    [finishAuthenticatedSession]
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      dispatch({ type: "set-error", message: null });
      await sendPasswordResetEmail(auth, email.trim());
      return true;
    } catch (error) {
      dispatchMappedError(
        dispatch,
        error,
        "Could not send reset email. Check the address and try again."
      );
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      dispatch({ type: "set-error", message: null });
      await syncSessionCookie(null);
      deleteCookie("__session", { path: "/" });
      deleteCookie("authToken", { path: "/" });
      await signOut(auth);
      dispatch({ type: "sync-success", user: null });
    } catch (error) {
      dispatchMappedError(
        dispatch,
        error,
        "Failed to sign out. Please try again."
      );
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user: state.user,
      isLoading: state.isLoading,
      authError: state.authError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      logout,
      clearAuthError,
    }),
    [
      state.user,
      state.isLoading,
      state.authError,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      sendPasswordReset,
      logout,
      clearAuthError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
