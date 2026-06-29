"use client";

import AppLayout from "@/components/AppLayout";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CompanyForm = {
  name: string;
  plan: string;
  expiresAt: string;
  maxVehicles: string;
  isActive: boolean;
};

export default function EditCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = String(params.id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>({
    name: "",
    plan: "basic",
    expiresAt: "",
    maxVehicles: "30",
    isActive: true,
  });

  useEffect(() => {
    async function loadCompany() {
      setLoading(true);

      const response = await fetch(`/api/admin/companies/${companyId}`);
      const data = await response.json();

      setLoading(false);

      if (!response.ok) {
        alert(data.error || "Errore caricamento azienda.");
        router.push("/admin");
        return;
      }

      setForm({
        name: data.company.name,
        plan: data.company.plan,
        expiresAt: data.company.expiresAt
          ? String(data.company.expiresAt).slice(0, 10)
          : "",
        maxVehicles: String(data.company.maxVehicles),
        isActive: data.company.isActive,
      });
    }

    loadCompany();
  }, [companyId, router]);

  function updateForm<K extends keyof CompanyForm>(
    key: K,
    value: CompanyForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const response = await fetch(`/api/admin/companies/${companyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        maxVehicles: Number(form.maxVehicles),
      }),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      alert(data.error || "Errore aggiornamento azienda.");
      return;
    }

    alert("Azienda aggiornata correttamente.");
    router.push("/admin");
    router.refresh();
  }

  return (
    <AppLayout title="MODIFICA AZIENDA" subtitle="Gestione dati SaaS cliente">
      <form
        onSubmit={handleSubmit}
        className="border border-slate-800 bg-slate-900/70 p-6 max-w-2xl space-y-4"
      >
        <input
          placeholder="Nome azienda"
          value={form.name}
          onChange={(e) => updateForm("name", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <select
          value={form.plan}
          onChange={(e) => updateForm("plan", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        >
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>

        <input
          type="number"
          min="1"
          placeholder="Max veicoli"
          value={form.maxVehicles}
          onChange={(e) => updateForm("maxVehicles", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <input
          type="date"
          value={form.expiresAt}
          onChange={(e) => updateForm("expiresAt", e.target.value)}
          disabled={loading}
          className="w-full bg-slate-950 border border-slate-700 p-3"
        />

        <label className="flex items-center gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => updateForm("isActive", e.target.checked)}
            disabled={loading}
          />
          Azienda attiva
        </label>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="border border-slate-700 px-6 py-3 font-black"
          >
            ANNULLA
          </button>

          <button
            disabled={loading || saving}
            className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black"
          >
            {saving ? "SALVATAGGIO..." : "SALVA AZIENDA"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
