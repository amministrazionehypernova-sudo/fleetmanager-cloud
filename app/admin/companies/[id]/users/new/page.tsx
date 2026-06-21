"use client";

import AppLayout from "@/components/AppLayout";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function NewCompanyUserPage() {
  const router = useRouter();
  const params = useParams();

  const companyId = String(params.id);

  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("admin123");
  const [role, setRole] = useState("operator");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        companyId,
        fullName,
        email,
        password,
        role,
      }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(data.error || "Errore creazione utente.");
      return;
    }

    alert("Utente creato correttamente.");
    router.push(`/admin/companies/${companyId}/users`);
    router.refresh();
  }

  return (
    <AppLayout title="CREA UTENTE" subtitle="Nuovo utente azienda">
      <form
        onSubmit={handleSubmit}
        className="border border-slate-800 bg-slate-900/70 p-6 max-w-2xl space-y-4"
      >
        <input
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <input
          placeholder="Password iniziale"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        >
          <option value="admin">Admin azienda</option>
          <option value="operator">Operatore</option>
        </select>

        <button
          disabled={loading}
          className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black"
        >
          {loading ? "CREAZIONE..." : "CREA UTENTE"}
        </button>
      </form>
    </AppLayout>
  );
}