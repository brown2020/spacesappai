"use client";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Breadcrumbs from "./Breadcrumbs";

export default function Header() {
  const { user } = useUser();

  return (
    <div className="flex items-center justify-between p-5 bg-purple-600 text-white">
      {user ? (
        <h1 className="text-lg sm:text-2xl">{`${
          user?.firstName || "User"
        }'s Space`}</h1>
      ) : (
        <h1 className="text-lg sm:text-2xl">Spaces</h1>
      )}

      <div className="hidden sm:block mx-2 px-3 py-2 rounded-md bg-white">
        <Breadcrumbs />
      </div>

      <div>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
