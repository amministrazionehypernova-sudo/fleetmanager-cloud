"use client";
import AppLayout from "@/components/AppLayout";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@demo.it");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Errore login.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-slate-800 bg-slate-900/70 p-8">
        <h1 className="text-3xl font-black tracking-widest mb-2">
          FLEETMANAGER
        </h1>

        <p className="text-sm text-slate-400 mb-8">
          Accesso gestionale flotta cloud
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            className="w-full bg-slate-950 border border-slate-700 px-4 py-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <input
            className="w-full bg-slate-950 border border-slate-700 px-4 py-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          {error && <div className="text-red-300">{error}</div>}

          <button
            disabled={loading}
            className="w-full bg-sky-700 px-4 py-3 font-black"
          >
            {loading ? "ACCESSO..." : "ACCEDI"}
          </button>
        </form>
      </div>
    </main>
  );
}