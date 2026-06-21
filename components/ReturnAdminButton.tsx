"use client";

import { useRouter } from "next/navigation";

export default function ReturnAdminButton() {
  const router = useRouter();

  async function handleClick() {
    const response = await fetch("/api/admin/return", {
      method: "POST",
    });

    if (!response.ok) {
      alert("Errore ritorno admin");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="border border-yellow-700 text-yellow-300 px-4 py-2 text-xs font-black"
    >
      TORNA ADMIN
    </button>
  );
}