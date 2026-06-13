"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="w-full border border-red-900 text-red-300 hover:bg-red-950 px-4 py-2 text-xs font-black tracking-widest"
    >
      LOGOUT
    </button>
  );
}