"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";

export default function NewCompanyPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plan, setPlan] = useState("basic");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxVehicles, setMaxVehicles] = useState("30");
  const [isActive, setIsActive] = useState(true);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);

    const response = await fetch(
      "/api/admin/companies",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          companyName,
          fullName,
          email,
          password,
          plan,
          expiresAt,
          maxVehicles: Number(maxVehicles),
          isActive,
        }),
      }
    );

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      alert(data.error);
      return;
    }

    alert("Azienda creata con successo");

    router.push("/admin");
    router.refresh();
  }

  return (
    <AppLayout
      title="CREA AZIENDA"
      subtitle="Nuovo cliente FleetManagerPro"
    >
      <form
        onSubmit={handleSubmit}
        className="border border-slate-800 bg-slate-900/70 p-6 max-w-2xl"
      >
        <div className="space-y-4">
          <input
            placeholder="Nome azienda"
            value={companyName}
            onChange={(e) =>
              setCompanyName(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <input
            placeholder="Nome amministratore"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <input
            placeholder="Email amministratore"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <input
            type="password"
            placeholder="Password iniziale"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
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
            value={maxVehicles}
            onChange={(e) => setMaxVehicles(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 p-3"
          />

          <label className="flex items-center gap-3 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Azienda attiva
          </label>

          <button
            disabled={loading}
            className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black"
          >
            {loading
              ? "CREAZIONE..."
              : "CREA AZIENDA"}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
