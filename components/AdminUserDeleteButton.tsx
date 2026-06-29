"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminUserDeleteButton({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Eliminare definitivamente l'utente ${userEmail}?`)) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore eliminazione utente.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-2 text-xs font-black border border-red-800 text-red-300 hover:bg-red-950 disabled:opacity-50"
    >
      {loading ? "..." : "ELIMINA"}
    </button>
  );
}
