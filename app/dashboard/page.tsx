import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

function formatEuro(value: number) {
  return `€ ${value.toFixed(2)}`;
}

function formatNumber(value: number) {
  return value.toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function getDateLevel(value: Date | null) {
  if (!value) return null;

  const today = new Date();
  const diffMs = value.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return "red";
  if (daysLeft <= 30) return "yellow";
  return "green";
}

function getKmLevel(currentKm: number, dueKm: number | null) {
  if (!dueKm) return null;

  const kmLeft = dueKm - currentKm;

  if (kmLeft < 0) return "red";
  if (kmLeft <= 1000) return "yellow";
  return "green";
}

export default async function DashboardPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      status: "active",
    },
    include: {
      dailyRecords: true,
      fuelRecords: true,
      expenses: true,
    },
  });

  const vehiclesCount = vehicles.length;

  const dailyAll = await prisma.dailyRecord.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    _sum: {
      kmDone: true,
    },
  });

  const fuelAll = await prisma.fuelRecord.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    _sum: {
      liters: true,
      totalCost: true,
    },
  });

  const expensesAll = await prisma.expense.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    _sum: {
      amount: true,
    },
  });

  const daily30 = await prisma.dailyRecord.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
      recordDate: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      kmDone: true,
    },
  });

  const fuel30 = await prisma.fuelRecord.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
      fuelDate: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      liters: true,
      totalCost: true,
    },
  });

  const expenses30 = await prisma.expense.aggregate({
    where: {
      companyId: DEMO_COMPANY_ID,
      expenseDate: {
        gte: thirtyDaysAgo,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const kmTotal = dailyAll._sum.kmDone || 0;
  const fuelLitersTotal = fuelAll._sum.liters || 0;
  const fuelCostTotal = fuelAll._sum.totalCost || 0;
  const expensesCostTotal = expensesAll._sum.amount || 0;
  const totalCost = fuelCostTotal + expensesCostTotal;

  const km30 = daily30._sum.kmDone || 0;
  const fuelLiters30 = fuel30._sum.liters || 0;
  const fuelCost30 = fuel30._sum.totalCost || 0;
  const expensesCost30 = expenses30._sum.amount || 0;
  const totalCost30 = fuelCost30 + expensesCost30;

  const avgKmPerLiter =
    fuelLitersTotal > 0 ? kmTotal / fuelLitersTotal : 0;

  const avgFuelCostPerKm =
    kmTotal > 0 ? fuelCostTotal / kmTotal : 0;

  const avgTotalCostPerKm =
    kmTotal > 0 ? totalCost / kmTotal : 0;

  const avgKmPerLiter30 =
    fuelLiters30 > 0 ? km30 / fuelLiters30 : 0;

  const avgFuelCostPerKm30 =
    km30 > 0 ? fuelCost30 / km30 : 0;

  const avgTotalCostPerKm30 =
    km30 > 0 ? totalCost30 / km30 : 0;

  let criticalDeadlines = 0;
  let warningDeadlines = 0;
  let okDeadlines = 0;

  for (const vehicle of vehicles) {
    const levels = [
      getDateLevel(vehicle.insuranceExpiry),
      getDateLevel(vehicle.inspectionExpiry),
      getDateLevel(vehicle.taxExpiry),
      getKmLevel(vehicle.currentKm, vehicle.serviceDueKm),
    ];

    for (const level of levels) {
      if (level === "red") criticalDeadlines += 1;
      if (level === "yellow") warningDeadlines += 1;
      if (level === "green") okDeadlines += 1;
    }
  }

  const topCostVehicles = vehicles
    .map((vehicle) => {
      const fuelTotal = vehicle.fuelRecords.reduce(
        (sum, record) => sum + record.totalCost,
        0
      );

      const expensesTotal = vehicle.expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        total: fuelTotal + expensesTotal,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  const topUsageVehicles = vehicles
    .map((vehicle) => {
      const totalKm = vehicle.dailyRecords.reduce(
        (sum, record) => sum + record.kmDone,
        0
      );

      return {
        plate: vehicle.plate,
        brand: vehicle.brand,
        model: vehicle.model,
        totalKm,
      };
    })
    .sort((a, b) => b.totalKm - a.totalKm)
    .slice(0, 5);

  const latestOperations = await prisma.dailyRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      recordDate: "desc",
    },
    take: 8,
  });

  return (
    <AppLayout
      title="DASHBOARD"
      subtitle="Controllo generale flotta, costi, km e scadenze"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <MetricCard
          label="MEZZI"
          value={vehiclesCount}
          caption="unità attive"
        />

        <MetricCard
          label="KM 30 GG"
          value={formatNumber(km30)}
          caption="chilometri registrati"
        />

        <MetricCard
          label="COSTO 30 GG"
          value={formatEuro(totalCost30)}
          caption="carburante + interventi"
        />

        <MetricCard
          label="SCADUTE"
          value={criticalDeadlines}
          caption="scadenze critiche"
        />

        <MetricCard
          label="IN ARRIVO"
          value={warningDeadlines}
          caption="entro 30 giorni / 1000 km"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Panel title="ULTIMI 30 GIORNI">
          <DataLine label="Km percorsi" value={`${formatNumber(km30)} km`} />
          <DataLine label="Litri carburante" value={`${formatDecimal(fuelLiters30)} L`} />
          <DataLine label="Costo carburante" value={formatEuro(fuelCost30)} />
          <DataLine label="Costo interventi" value={formatEuro(expensesCost30)} />
          <DataLine label="Costo totale" value={formatEuro(totalCost30)} />
          <DataLine label="Consumo medio" value={`${formatDecimal(avgKmPerLiter30)} km/L`} />
          <DataLine label="Costo carburante/km" value={formatEuro(avgFuelCostPerKm30)} />
          <DataLine label="Costo totale/km" value={formatEuro(avgTotalCostPerKm30)} />
        </Panel>

        <Panel title="TOTALI GENERALI">
          <DataLine label="Km totali" value={`${formatNumber(kmTotal)} km`} />
          <DataLine label="Litri totali" value={`${formatDecimal(fuelLitersTotal)} L`} />
          <DataLine label="Carburante totale" value={formatEuro(fuelCostTotal)} />
          <DataLine label="Interventi totali" value={formatEuro(expensesCostTotal)} />
          <DataLine label="Costo complessivo" value={formatEuro(totalCost)} />
          <DataLine label="Consumo medio generale" value={`${formatDecimal(avgKmPerLiter)} km/L`} />
          <DataLine label="Costo carburante/km" value={formatEuro(avgFuelCostPerKm)} />
          <DataLine label="Costo totale/km" value={formatEuro(avgTotalCostPerKm)} />
        </Panel>

        <Panel title="SCADENZE">
          <DataLine label="Critiche" value={criticalDeadlines} />
          <DataLine label="In arrivo" value={warningDeadlines} />
          <DataLine label="Regolari" value={okDeadlines} />
          <DataLine
            label="Totale monitorate"
            value={criticalDeadlines + warningDeadlines + okDeadlines}
          />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Panel title="TOP 5 MEZZI PER COSTO">
          {topCostVehicles.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessun costo registrato.
            </p>
          )}

          {topCostVehicles.map((vehicle, index) => (
            <DataLine
              key={`${vehicle.plate}-${index}`}
              label={`${index + 1}. ${vehicle.plate} · ${vehicle.brand || ""} ${vehicle.model || ""}`}
              value={formatEuro(vehicle.total)}
            />
          ))}
        </Panel>

        <Panel title="TOP 5 MEZZI PIÙ UTILIZZATI">
          {topUsageVehicles.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessun km registrato.
            </p>
          )}

          {topUsageVehicles.map((vehicle, index) => (
            <DataLine
              key={`${vehicle.plate}-${index}`}
              label={`${index + 1}. ${vehicle.plate} · ${vehicle.brand || ""} ${vehicle.model || ""}`}
              value={`${formatNumber(vehicle.totalKm)} km`}
            />
          ))}
        </Panel>
      </div>

      <Panel title="ULTIME OPERAZIONI">
        {latestOperations.length === 0 && (
          <p className="text-slate-500 text-sm">
            Nessuna operazione registrata.
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="text-left py-2">DATA</th>
                <th className="text-left py-2">MEZZO</th>
                <th className="text-right py-2">KM PARTENZA</th>
                <th className="text-right py-2">KM ARRIVO</th>
                <th className="text-right py-2">KM FATTI</th>
              </tr>
            </thead>

            <tbody>
              {latestOperations.map((operation) => (
                <tr
                  key={operation.id}
                  className="border-t border-slate-800"
                >
                  <td className="py-2">
                    {operation.recordDate.toLocaleDateString("it-IT")}
                  </td>

                  <td className="py-2 font-bold">
                    {operation.vehicle.plate}
                  </td>

                  <td className="py-2 text-right">
                    {formatNumber(operation.startKm)}
                  </td>

                  <td className="py-2 text-right">
                    {formatNumber(operation.endKm)}
                  </td>

                  <td className="py-2 text-right">
                    {formatNumber(operation.kmDone)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppLayout>
  );
}

function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="border border-slate-800 bg-slate-900/70 p-5">
      <div className="text-xs font-black tracking-widest text-slate-500">
        {label}
      </div>

      <div className="text-3xl font-black mt-2">
        {value}
      </div>

      <div className="text-xs text-sky-400 mt-1">
        {caption}
      </div>
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

      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function DataLine({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm gap-4">
      <span className="text-slate-400">
        {label}
      </span>

      <span className="font-bold text-slate-100 text-right">
        {value}
      </span>
    </div>
  );
}