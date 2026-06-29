import AdminImpersonateButton from "@/components/AdminImpersonateButton";
import AdminCompanyToggleButton from "@/components/AdminCompanyToggleButton";
import AdminCompanyDeleteButton from "@/components/AdminCompanyDeleteButton";
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
      vehicles: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalUsers = companies.reduce(
    (total, company) => total + company.users.length,
    0
  );
  const activeCompanies = companies.filter((company) => company.isActive).length;
  const inactiveCompanies = companies.length - activeCompanies;
  const totalVehicles = companies.reduce(
    (total, company) =>
      total +
      company.vehicles.filter((vehicle) => vehicle.status === "active").length,
    0
  );

  return (
    <AppLayout title="HYPERNOVA ADMIN" subtitle="Pannello amministrazione SaaS">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <AdminCard
          title="AZIENDE"
          value={String(companies.length)}
          description="Totale aziende"
        />

        <AdminCard
          title="ATTIVE"
          value={String(activeCompanies)}
          description="Aziende abilitate"
        />

        <AdminCard
          title="DISATTIVE"
          value={String(inactiveCompanies)}
          description="Aziende bloccate"
        />

        <AdminCard
          title="UTENTI"
          value={String(totalUsers)}
          description="Utenti registrati"
        />

        <AdminCard
          title="VEICOLI"
          value={String(totalVehicles)}
          description="Veicoli attivi"
        />
      </div>

      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/companies/new"
          className="bg-sky-700 hover:bg-sky-600 px-5 py-3 text-sm font-black tracking-widest"
        >
          + CREA AZIENDA
        </Link>
      </div>

      {companies.length > 0 && (
        <div className="border border-slate-800 bg-slate-900/70 p-5 mb-6">
          <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
            AZIONI AZIENDE
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="border border-slate-800 bg-slate-950/60 p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="font-bold text-slate-100">{company.name}</div>
                  <div className="text-xs text-slate-500 uppercase mt-1">
                    {company.plan} · {company.isActive ? "ATTIVA" : "DISATTIVA"}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/admin/companies/${company.id}/edit`}
                    className="px-4 py-2 text-xs font-black border border-slate-600 text-slate-100 hover:bg-slate-800"
                  >
                    MODIFICA
                  </Link>

                  <AdminCompanyDeleteButton
                    companyId={company.id}
                    companyName={company.name}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
          AZIENDE REGISTRATE
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-3">AZIENDA</th>
                <th className="text-left p-3">AZIONI</th>
                <th className="text-left p-3">PIANO</th>
                <th className="text-left p-3">STATO</th>
                <th className="text-left p-3">MAX VEICOLI</th>
                <th className="text-left p-3">VEICOLI</th>
                <th className="text-left p-3">UTENTI</th>
                <th className="text-left p-3">SCADENZA</th>
                <th className="text-left p-3">CREATA IL</th>
                <th className="text-left p-3">GESTIONE</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-slate-800">
                  <td className="p-3 font-bold">{company.name}</td>

                  <td className="p-3">
                    <div className="flex min-w-[190px] flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/companies/${company.id}/edit`}
                        className="px-3 py-2 text-xs font-black border border-slate-700 text-slate-200 hover:bg-slate-800"
                      >
                        MODIFICA
                      </Link>

                      <AdminCompanyDeleteButton
                        companyId={company.id}
                        companyName={company.name}
                      />
                    </div>
                  </td>

                  <td className="p-3 uppercase">{company.plan}</td>

                  <td className="p-3">
                    {company.isActive ? (
                      <span className="text-emerald-400">ATTIVA</span>
                    ) : (
                      <span className="text-red-400">DISATTIVA</span>
                    )}
                  </td>

                  <td className="p-3">{company.maxVehicles}</td>

                  <td className="p-3">
                    {
                      company.vehicles.filter(
                        (vehicle) => vehicle.status === "active"
                      ).length
                    }
                  </td>

                  <td className="p-3">{company.users.length}</td>

                  <td className="p-3">
                    {company.expiresAt
                      ? new Date(company.expiresAt).toLocaleDateString("it-IT")
                      : "-"}
                  </td>

                  <td className="p-3">
                    {new Date(company.createdAt).toLocaleDateString("it-IT")}
                  </td>

                  <td className="p-3">
                    <div className="flex min-w-[280px] flex-wrap items-center gap-2">
                      <AdminCompanyToggleButton
                        companyId={company.id}
                        isActive={company.isActive}
                      />

                      <AdminImpersonateButton
                        companyId={company.id}
                        companyName={company.name}
                      />

                      <Link
                        href={`/admin/companies/${company.id}/users`}
                        className="px-3 py-2 text-xs font-black border border-violet-800 text-violet-300 hover:bg-violet-950"
                      >
                        UTENTI
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {companies.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-slate-500">
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

      <div className="text-2xl font-black mt-2 text-slate-100">{value}</div>

      <div className="text-xs text-sky-400 mt-2">{description}</div>
    </div>
  );
}
