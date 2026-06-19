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