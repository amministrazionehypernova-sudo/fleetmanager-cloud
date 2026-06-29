"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Errore login.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md border border-slate-800 bg-slate-900/80 p-8"
      >
        <div className="mb-8">
          <div className="text-xs font-black tracking-[0.35em] text-sky-400 mb-3">
            FLEETMANAGERPRO
          </div>

          <h1 className="text-3xl font-black">
            Login
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Accedi al gestionale flotta.
          </p>
        </div>

        <div className="space-y-4">
          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              EMAIL
            </span>

            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-3"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              PASSWORD
            </span>

            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-3"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
            />
          </label>
        </div>

        {error && (
          <div className="mt-5 border border-red-900 bg-red-950/40 text-red-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className="mt-6 w-full bg-sky-700 hover:bg-sky-600 disabled:opacity-50 px-6 py-3 font-black tracking-widest"
        >
          {loading ? "ACCESSO..." : "ACCEDI"}
        </button>

        <footer className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <Link className="hover:text-sky-400" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="hover:text-sky-400" href="/termini">
            Termini di Servizio
          </Link>
        </footer>
      </form>
    </main>
  );
}
