"use client";

import AppLayout from "@/components/AppLayout";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type UserForm = {
  fullName: string;
  email: string;
  role: string;
};

export default function EditCompanyUserPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = String(params.id);
  const userId = String(params.userId);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<UserForm>({
    fullName: "",
    email: "",
    role: "operator",
  });

  useEffect(() => {
    async function loadUser() {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      setLoading(false);

      if (!response.ok) {
        alert(data.error || "Errore caricamento utente.");
        router.push(`/admin/companies/${companyId}/users`);
        return;
      }

      if (data.user.companyId !== companyId) {
        alert("Utente non appartenente a questa azienda.");
        router.push(`/admin/companies/${companyId}/users`);
        return;
      }

      setForm({
        fullName: data.user.fullName || "",
        email: data.user.email,
        role: data.user.role,
      });
    }

    loadUser();
  }, [companyId, router, userId]);

  function updateForm<K extends keyof UserForm>(key: K, value: UserForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      alert(data.error || "Errore aggiornamento utente.");
      return;
    }

    alert("Utente aggiornato correttamente.");
    router.push(`/admin/companies/${companyId}/users`);
    router.refresh();
  }

  return (
    <AppLayout title="MODIFICA UTENTE" subtitle="Gestione utente azienda">
      <form
        onSubmit={handleSubmit}
        className="border border-slate-800 bg-slate-900/70 p-6 max-w-2xl space-y-4"
      >
        <input
          placeholder="Nome completo"
          value={form.fullName}
          onChange={(e) => updateForm("fullName", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => updateForm("email", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <select
          value={form.role}
          onChange={(e) => updateForm("role", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        >
          <option value="admin">Admin azienda</option>
          <option value="operator">Operatore</option>
        </select>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/admin/companies/${companyId}/users`)}
            className="border border-slate-700 px-6 py-3 font-black"
          >
            ANNULLA
          </button>

          <button
            disabled={loading || saving}
            className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black"
          >
            {saving ? "SALVATAGGIO..." : "SALVA UTENTE"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
