"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButton() {
  const { data: session } = useSession();
  

  if (session) {
    return (
      <div className="p-4">
        {/* <p className="mb-2">Signed in as {session.user?.name}</p> */}
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <div>
    
    {/* <button
      onClick={() => signIn("github")}
      className="px-4 py-2 bg-black text-white rounded-md"
    >
      Sign in with GitHub
    </button> */}
    </div>
  );
}