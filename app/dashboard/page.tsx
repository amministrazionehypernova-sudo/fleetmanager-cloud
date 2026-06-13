import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

function formatKm(value: number | null | undefined) {
  return (value || 0).toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatEuro(value: number | null | undefined) {
  return `€ ${(value || 0).toFixed(2)}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

function monthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getDateLevel(value: Date | null, warningDays = 30) {
  if (!value) return "none";

  const today = new Date();
  const diffMs = value.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return "red";
  if (daysLeft <= warningDays) return "yellow";
  return "green";
}

function getMaintenanceLevel(
  currentKm: number,
  dueType: string,
  dueKm: number | null,
  dueDate: Date | null,
  warningKm: number,
  warningDays: number
) {
  if (dueType === "km" && dueKm) {
    const kmLeft = dueKm - currentKm;

    if (kmLeft < 0) return "red";
    if (kmLeft <= warningKm) return "yellow";
    return "green";
  }

  if (dueType === "date" && dueDate) {
    return getDateLevel(dueDate, warningDays);
  }

  return "none";
}

export default async function DashboardPage() {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    include: {
      fuelRecords: true,
      expenses: true,
      dailyRecords: true,
      documentRenewals: true,
      scheduledMaintenances: {
        where: {
          status: "active",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const monthFrom = monthStart();

  const monthlyFuel = await prisma.fuelRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      fuelDate: {
        gte: monthFrom,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      fuelDate: "desc",
    },
  });

  const monthlyExpenses = await prisma.expense.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      expenseDate: {
        gte: monthFrom,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  const monthlyRecords = await prisma.dailyRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      recordDate: {
        gte: monthFrom,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      recordDate: "desc",
    },
  });

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "active"
  );

  const totalMonthKm = monthlyRecords.reduce(
    (sum, record) => sum + record.kmDone,
    0
  );

  const totalMonthFuelCost = monthlyFuel.reduce(
    (sum, record) => sum + record.totalCost,
    0
  );

  const totalMonthFuelLiters = monthlyFuel.reduce(
    (sum, record) => sum + record.liters,
    0
  );

  const totalMonthMaintenanceCost = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalMonthCost = totalMonthFuelCost + totalMonthMaintenanceCost;

  const costPerKm =
    totalMonthKm > 0 ? totalMonthCost / totalMonthKm : 0;

  let redDocuments = 0;
  let yellowDocuments = 0;
  let redMaintenances = 0;
  let yellowMaintenances = 0;

  vehicles.forEach((vehicle) => {
    const documentLevels = [
      getDateLevel(vehicle.insuranceExpiry, 30),
      getDateLevel(vehicle.inspectionExpiry, 30),
      getDateLevel(vehicle.taxExpiry, 30),
    ];

    documentLevels.forEach((level) => {
      if (level === "red") redDocuments += 1;
      if (level === "yellow") yellowDocuments += 1;
    });

    vehicle.scheduledMaintenances.forEach((maintenance) => {
      const level = getMaintenanceLevel(
        vehicle.currentKm,
        maintenance.dueType,
        maintenance.dueKm,
        maintenance.dueDate,
        maintenance.warningKm,
        maintenance.warningDays
      );

      if (level === "red") redMaintenances += 1;
      if (level === "yellow") yellowMaintenances += 1;
    });
  });

  const criticalAlerts = redDocuments + redMaintenances;
  const warningAlerts = yellowDocuments + yellowMaintenances;

  const recentFuel = await prisma.fuelRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      fuelDate: "desc",
    },
    take: 5,
  });

  const recentExpenses = await prisma.expense.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
    take: 5,
  });

  const recentOperations = await prisma.dailyRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      recordDate: "desc",
    },
    take: 5,
  });

  const vehicleStats = vehicles.map((vehicle) => {
    const km = vehicle.dailyRecords.reduce(
      (sum, record) => sum + record.kmDone,
      0
    );

    const fuelCost = vehicle.fuelRecords.reduce(
      (sum, record) => sum + record.totalCost,
      0
    );

    const maintenanceCost = vehicle.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    const totalCost = fuelCost + maintenanceCost;

    return {
      id: vehicle.id,
      label: `${vehicle.plate} - ${vehicle.brand || ""} ${vehicle.model || ""}`,
      km,
      totalCost,
    };
  });

  const mostUsedVehicle = [...vehicleStats].sort((a, b) => b.km - a.km)[0];
  const mostExpensiveVehicle = [...vehicleStats].sort(
    (a, b) => b.totalCost - a.totalCost
  )[0];

  return (
    <AppLayout
      title="DASHBOARD"
      subtitle="Panoramica operativa flotta"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="VEICOLI ATTIVI"
          value={activeVehicles.length}
          caption={`${vehicles.length} veicoli totali`}
        />

        <MetricCard
          label="ALERT CRITICI"
          value={criticalAlerts}
          caption={`${redDocuments} documenti · ${redMaintenances} manutenzioni`}
          tone={criticalAlerts > 0 ? "red" : "green"}
        />

        <MetricCard
          label="IN SCADENZA"
          value={warningAlerts}
          caption={`${yellowDocuments} documenti · ${yellowMaintenances} manutenzioni`}
          tone={warningAlerts > 0 ? "yellow" : "green"}
        />

        <MetricCard
          label="COSTO MESE"
          value={formatEuro(totalMonthCost)}
          caption="carburante + interventi"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="KM MESE"
          value={`${formatKm(totalMonthKm)} km`}
          caption="km registrati nel mese"
        />

        <MetricCard
          label="LITRI MESE"
          value={`${totalMonthFuelLiters.toFixed(2)} L`}
          caption="carburante registrato"
        />

        <MetricCard
          label="SPESA CARBURANTE"
          value={formatEuro(totalMonthFuelCost)}
          caption="mese corrente"
        />

        <MetricCard
          label="COSTO/KM MESE"
          value={formatEuro(costPerKm)}
          caption="carburante + interventi / km"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Panel title="ALERT">
          <AlertLine
            label="Documenti scaduti"
            value={redDocuments}
            tone="red"
          />

          <AlertLine
            label="Documenti in scadenza"
            value={yellowDocuments}
            tone="yellow"
          />

          <AlertLine
            label="Manutenzioni scadute"
            value={redMaintenances}
            tone="red"
          />

          <AlertLine
            label="Manutenzioni in scadenza"
            value={yellowMaintenances}
            tone="yellow"
          />

          <Link
            href="/deadlines"
            className="inline-block mt-4 border border-sky-800 text-sky-300 hover:bg-sky-950 px-4 py-2 text-xs font-black"
          >
            VEDI SCADENZE
          </Link>
        </Panel>

        <Panel title="MEZZO PIÙ UTILIZZATO">
          {mostUsedVehicle ? (
            <>
              <div className="text-lg font-black text-slate-100">
                {mostUsedVehicle.label}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {formatKm(mostUsedVehicle.km)} km registrati
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm">Nessun dato disponibile.</p>
          )}
        </Panel>

        <Panel title="MEZZO CON PIÙ COSTI">
          {mostExpensiveVehicle ? (
            <>
              <div className="text-lg font-black text-slate-100">
                {mostExpensiveVehicle.label}
              </div>
              <div className="text-sm text-slate-500 mt-2">
                {formatEuro(mostExpensiveVehicle.totalCost)} registrati
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-sm">Nessun dato disponibile.</p>
          )}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="ULTIMI RIFORNIMENTI">
          {recentFuel.length === 0 && (
            <p className="text-slate-500 text-sm">Nessun rifornimento.</p>
          )}

          {recentFuel.map((record) => (
            <SmallRow
              key={record.id}
              title={record.vehicle.plate}
              detail={`${formatDate(record.fuelDate)} · ${record.liters.toFixed(
                2
              )} L`}
              value={formatEuro(record.totalCost)}
            />
          ))}
        </Panel>

        <Panel title="ULTIMI INTERVENTI">
          {recentExpenses.length === 0 && (
            <p className="text-slate-500 text-sm">Nessun intervento.</p>
          )}

          {recentExpenses.map((expense) => (
            <SmallRow
              key={expense.id}
              title={expense.vehicle.plate}
              detail={`${formatDate(expense.expenseDate)} · ${
                expense.category || "Intervento"
              }`}
              value={formatEuro(expense.amount)}
            />
          ))}
        </Panel>

        <Panel title="ULTIME OPERAZIONI">
          {recentOperations.length === 0 && (
            <p className="text-slate-500 text-sm">Nessuna operazione.</p>
          )}

          {recentOperations.map((record) => (
            <SmallRow
              key={record.id}
              title={record.vehicle.plate}
              detail={formatDate(record.recordDate)}
              value={`${formatKm(record.kmDone)} km`}
            />
          ))}
        </Panel>
      </div>
    </AppLayout>
  );
}

function MetricCard({
  label,
  value,
  caption,
  tone = "default",
}: {
  label: string;
  value: string | number;
  caption: string;
  tone?: "default" | "red" | "yellow" | "green";
}) {
  const toneClass =
    tone === "red"
      ? "text-red-300"
      : tone === "yellow"
      ? "text-yellow-300"
      : tone === "green"
      ? "text-emerald-300"
      : "text-slate-100";

  return (
    <div className="border border-slate-800 bg-slate-900/70 p-5">
      <div className="text-xs font-black tracking-widest text-slate-500">
        {label}
      </div>

      <div className={`text-3xl font-black mt-2 ${toneClass}`}>
        {value}
      </div>

      <div className="text-xs text-sky-400 mt-1">{caption}</div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="text-sm font-black tracking-widest text-slate-200 mb-4">
        {title}
      </h2>

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AlertLine({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "red" | "yellow";
}) {
  const className = tone === "red" ? "text-red-300" : "text-yellow-300";

  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm">
      <span className="text-slate-400">{label}</span>
      <span className={`font-black ${className}`}>{value}</span>
    </div>
  );
}

function SmallRow({
  title,
  detail,
  value,
}: {
  title: string;
  detail: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between border-b border-slate-800 pb-2 gap-4 text-sm">
      <div>
        <div className="font-bold text-slate-100">{title}</div>
        <div className="text-xs text-slate-500 mt-1">{detail}</div>
      </div>

      <div className="font-bold text-slate-100 text-right whitespace-nowrap">
        {value}
      </div>
    </div>
  );
}