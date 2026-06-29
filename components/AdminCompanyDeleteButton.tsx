"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminCompanyDeleteButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = confirm(
      `Eliminare definitivamente l'azienda "${companyName}" e tutti i suoi dati?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);

    const response = await fetch(`/api/admin/companies/${companyId}`, {
      method: "DELETE",
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore eliminazione azienda.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-2 text-xs font-black border border-red-800 text-red-300 hover:bg-red-950"
    >
      {loading ? "..." : "ELIMINA"}
    </button>
  );
}
