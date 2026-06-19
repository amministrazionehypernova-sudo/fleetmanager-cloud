import AppLayout from "@/components/AppLayout";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await requireSession();

  if (session.role !== "superadmin") {
    redirect("/dashboard");
  }

  const companies = await prisma.company.findMany({
    include: {
      users: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppLayout
      title="HYPERNOVA ADMIN"
      subtitle="Pannello amministrazione SaaS"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <AdminCard
          title="AZIENDE"
          value={String(companies.length)}
          description="Aziende registrate"
        />

        <AdminCard
          title="UTENTI"
          value={String(
            companies.reduce(
              (total, company) => total + company.users.length,
              0
            )
          )}
          description="Utenti totali"
        />

        <AdminCard
          title="SISTEMA"
          value="ONLINE"
          description="Accesso Super Admin verificato"
        />
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5 mb-8">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          FUNZIONI DISPONIBILI
        </h2>

        <div className="space-y-3 text-sm text-slate-400">
          <p>✓ Accesso riservato a Hypernova Super Admin</p>
          <p>✓ Gestione aziende</p>
          <p>✓ Gestione utenti</p>
          <p>✓ Reset password clienti</p>
          <p>✓ Controllo completo SaaS</p>
        </div>
      </div>

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/companies/new"
          className="bg-sky-700 hover:bg-sky-600 px-5 py-3 text-sm font-black tracking-widest"
        >
          + CREA AZIENDA
        </Link>
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          AZIENDE REGISTRATE
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-3">AZIENDA</th>
                <th className="text-left p-3">UTENTI</th>
                <th className="text-left p-3">CREATA IL</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr
                  key={company.id}
                  className="border-b border-slate-800"
                >
                  <td className="p-3 font-bold">
                    {company.name}
                  </td>

                  <td className="p-3">
                    {company.users.length}
                  </td>

                  <td className="p-3">
                    {new Date(company.createdAt).toLocaleDateString(
                      "it-IT"
                    )}
                  </td>
                </tr>
              ))}

              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-6 text-center text-slate-500"
                  >
                    Nessuna azienda registrata
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

function AdminCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="border border-slate-800 bg-slate-900/70 p-5">
      <div className="text-xs font-black tracking-widest text-slate-500">
        {title}
      </div>

      <div className="text-2xl font-black mt-2 text-slate-100">
        {value}
      </div>

      <div className="text-xs text-sky-400 mt-2">
        {description}
      </div>
    </div>
  );
}