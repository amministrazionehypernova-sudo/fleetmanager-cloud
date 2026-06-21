"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminImpersonateButton({
  companyId,
  companyName,
}: {
  companyId: string;
  companyName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!confirm(`Entrare come cliente "${companyName}"?`)) return;

    setLoading(true);

    const response = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ companyId }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Errore accesso cliente.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-2 text-xs font-black border border-sky-800 text-sky-300 hover:bg-sky-950"
    >
      {loading ? "..." : "ENTRA"}
    </button>
  );
}