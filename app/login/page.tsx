"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white px-12 py-10 rounded-xl shadow-md text-center w-105">
        
        <div className="flex justify-center mb-6">
          <Image
            src="/swinburne-logo.png"
            alt="Swinburne Logo"
            width={280}
            height={120}
          />
        </div>

        <h1 className="text-3xl font-bold mb-2 text-black">
          File Automation System
        </h1>

        <p className="text-gray-700 mb-6 text-lg">
          Access your OneDrive securely
        </p>

        <button
          onClick={() => signIn("microsoft-entra-id", { callbackUrl: "/dashboard" })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-3 mx-auto transition"
        >
          <span className="text-lg">🪟</span>
          Sign in with Microsoft
        </button>
      </div>
    </div>
  );
}