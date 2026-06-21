"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminCompanyToggleButton({
  companyId,
  isActive,
}: {
  companyId: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(isActive ? "Disattivare questa azienda?" : "Riattivare questa azienda?")) {
      return;
    }

    setLoading(true);

    const response = await fetch("/api/admin/companies/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyId }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore aggiornamento azienda.");
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`px-3 py-2 text-xs font-black ${
        isActive
          ? "border border-red-800 text-red-300 hover:bg-red-950"
          : "border border-emerald-800 text-emerald-300 hover:bg-emerald-950"
      }`}
    >
      {loading ? "..." : isActive ? "DISATTIVA" : "RIATTIVA"}
    </button>
  );
}