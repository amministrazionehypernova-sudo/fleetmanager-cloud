"use client";

import { useState } from "react";

export default function AdminResetPasswordButton({
  userId,
  userEmail,
}: {
  userId: string;
  userEmail: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const newPassword = window.prompt(
      `Nuova password per ${userEmail}:`,
      "admin123"
    );

    if (!newPassword) return;

    setLoading(true);

    const response = await fetch("/api/admin/users/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        newPassword,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(data.error || "Errore reset password.");
      return;
    }

    alert("Password aggiornata correttamente.");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="px-3 py-2 text-xs font-black border border-yellow-800 text-yellow-300 hover:bg-yellow-950 disabled:opacity-50"
    >
      {loading ? "..." : "RESET PASSWORD"}
    </button>
  );
}