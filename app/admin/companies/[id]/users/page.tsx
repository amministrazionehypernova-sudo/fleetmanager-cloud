import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CompanyUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();

  if (session.role !== "superadmin") {
    redirect("/dashboard");
  }

  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: true,
    },
  });

  if (!company) {
    redirect("/admin");
  }

  return (
    <AppLayout
      title={`UTENTI - ${company.name}`}
      subtitle="Gestione utenti azienda"
    >
      <div className="mb-4 flex justify-between items-center">
        <Link
          href="/admin"
          className="border border-slate-700 px-4 py-2 text-xs font-black"
        >
          ← TORNA ADMIN
        </Link>

        <button className="bg-sky-700 hover:bg-sky-600 px-5 py-3 text-sm font-black tracking-widest">
          + CREA UTENTE
        </button>
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          UTENTI REGISTRATI
        </h2>

        <div className="space-y-3">
          {company.users.map((user) => (
            <div
              key={user.id}
              className="border border-slate-800 bg-slate-950/60 p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-bold text-slate-100">
                  {user.fullName || "Utente"}
                </div>

                <div className="text-sm text-slate-400">{user.email}</div>

                <div className="text-xs text-sky-400 uppercase mt-1">
                  {user.role}
                </div>
              </div>

              <div className="flex gap-2">
                <button className="px-3 py-2 text-xs font-black border border-yellow-800 text-yellow-300">
                  RESET PASSWORD
                </button>

                <button className="px-3 py-2 text-xs font-black border border-red-800 text-red-300">
                  DISATTIVA
                </button>
              </div>
            </div>
          ))}

          {company.users.length === 0 && (
            <div className="p-6 text-center text-slate-500">
              Nessun utente registrato.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}