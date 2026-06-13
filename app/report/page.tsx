import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import ReportCharts from "@/components/ReportCharts";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

type ReportPageProps = {
  searchParams?: Promise<{
    vehicleId?: string;
    from?: string;
    to?: string;
  }>;
};

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartInputDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function toStartDate(value: string) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toEndDate(value: string) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function formatKm(value: number | null | undefined) {
  return (value || 0).toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatDecimal(value: number | null | undefined) {
  return (value || 0).toFixed(2);
}

function formatEuro(value: number | null | undefined) {
  return `€ ${(value || 0).toFixed(2)}`;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const params = searchParams ? await searchParams : {};

  const selectedVehicleId = params.vehicleId || "all";
  const fromInput = params.from || monthStartInputDate();
  const toInput = params.to || todayInputDate();

  const fromDate = toStartDate(fromInput);
  const toDate = toEndDate(toInput);

  const vehicles = await prisma.vehicle.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
    },
    orderBy: {
      plate: "asc",
    },
  });

  const vehicleFilter =
    selectedVehicleId === "all"
      ? {}
      : {
          vehicleId: selectedVehicleId,
        };

  const dailyRecords = await prisma.dailyRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      ...vehicleFilter,
      recordDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      recordDate: "desc",
    },
  });

  const fuelRecords = await prisma.fuelRecord.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      ...vehicleFilter,
      fuelDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      fuelDate: "desc",
    },
  });

  const expenses = await prisma.expense.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      ...vehicleFilter,
      expenseDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  const documentRenewals = await prisma.documentRenewal.findMany({
    where: {
      companyId: DEMO_COMPANY_ID,
      ...vehicleFilter,
      renewalDate: {
        gte: fromDate,
        lte: toDate,
      },
    },
    include: {
      vehicle: true,
    },
    orderBy: {
      renewalDate: "desc",
    },
  });

  const totalKm = dailyRecords.reduce((sum, record) => sum + record.kmDone, 0);

  const totalLiters = fuelRecords.reduce(
    (sum, record) => sum + record.liters,
    0
  );

  const totalFuelCost = fuelRecords.reduce(
    (sum, record) => sum + record.totalCost,
    0
  );

  const totalExpensesCost = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalDocumentsCost = documentRenewals.reduce(
    (sum, renewal) => sum + renewal.amount,
    0
  );

  const totalCost = totalFuelCost + totalExpensesCost + totalDocumentsCost;

  const costPerKm = totalKm > 0 ? totalCost / totalKm : 0;
  const kmPerLiter = totalLiters > 0 ? totalKm / totalLiters : 0;
  const fuelCostPerKm = totalKm > 0 ? totalFuelCost / totalKm : 0;

  const chartData = vehicles.map((vehicle) => {
    const vehicleDailyRecords = dailyRecords.filter(
      (record) => record.vehicleId === vehicle.id
    );

    const vehicleFuelRecords = fuelRecords.filter(
      (record) => record.vehicleId === vehicle.id
    );

    const vehicleExpenses = expenses.filter(
      (expense) => expense.vehicleId === vehicle.id
    );

    const vehicleDocumentRenewals = documentRenewals.filter(
      (renewal) => renewal.vehicleId === vehicle.id
    );

    return {
      name: vehicle.plate,
      km: vehicleDailyRecords.reduce((sum, record) => sum + record.kmDone, 0),
      carburante: vehicleFuelRecords.reduce(
        (sum, record) => sum + record.totalCost,
        0
      ),
      interventi: vehicleExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      ),
      documenti: vehicleDocumentRenewals.reduce(
        (sum, renewal) => sum + renewal.amount,
        0
      ),
    };
  });

  const selectedVehicleLabel =
    selectedVehicleId === "all"
      ? "Tutti i veicoli"
      : vehicles.find((vehicle) => vehicle.id === selectedVehicleId)?.plate ||
        "Veicolo selezionato";

  return (
    <AppLayout
      title="REPORT"
      subtitle="Analisi costi, consumi e utilizzo flotta"
    >
      <form
        method="GET"
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="VEICOLO">
            <select
              name="vehicleId"
              defaultValue={selectedVehicleId}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-3"
            >
              <option value="all">Tutti i veicoli</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand || ""} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="DAL">
            <input
              name="from"
              type="date"
              defaultValue={fromInput}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-3"
            />
          </Field>

          <Field label="AL">
            <input
              name="to"
              type="date"
              defaultValue={toInput}
              className="w-full bg-slate-950 border border-slate-700 px-3 py-3"
            />
          </Field>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="submit"
            className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black tracking-widest text-center whitespace-nowrap"
          >
            FILTRA
          </button>

          <Link
            href="/report"
            className="border border-slate-700 hover:bg-slate-800 px-6 py-3 font-black tracking-widest text-center whitespace-nowrap"
          >
            RESET
          </Link>

          <Link
            href={`/api/report/export?vehicleId=${selectedVehicleId}&from=${fromInput}&to=${toInput}`}
            className="border border-emerald-800 text-emerald-300 hover:bg-emerald-950 px-6 py-3 font-black tracking-widest text-center whitespace-nowrap"
          >
            ESPORTA EXCEL
          </Link>
        </div>

        <div className="text-xs text-slate-500 mt-4">
          Report: {selectedVehicleLabel} · {formatDate(fromDate)} -{" "}
          {formatDate(toDate)}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="KM PERCORSI"
          value={`${formatKm(totalKm)} km`}
          caption="periodo selezionato"
        />

        <MetricCard
          label="LITRI CARBURANTE"
          value={`${formatDecimal(totalLiters)} L`}
          caption="rifornimenti"
        />

        <MetricCard
          label="COSTO TOTALE"
          value={formatEuro(totalCost)}
          caption="carburante + interventi + documenti"
        />

        <MetricCard
          label="COSTO/KM"
          value={formatEuro(costPerKm)}
          caption="costo medio complessivo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="COSTO CARBURANTE"
          value={formatEuro(totalFuelCost)}
          caption={`${formatEuro(fuelCostPerKm)} / km`}
        />

        <MetricCard
          label="COSTO INTERVENTI"
          value={formatEuro(totalExpensesCost)}
          caption={`${expenses.length} interventi`}
        />

        <MetricCard
          label="COSTO DOCUMENTI"
          value={formatEuro(totalDocumentsCost)}
          caption={`${documentRenewals.length} rinnovi`}
        />

        <MetricCard
          label="KM/L MEDIO"
          value={`${formatDecimal(kmPerLiter)} km/L`}
          caption="su litri registrati"
        />
      </div>

      <ReportCharts data={chartData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Panel title="RIEPILOGO DATI">
          <DataLine label="Veicolo" value={selectedVehicleLabel} />
          <DataLine label="Periodo dal" value={formatDate(fromDate)} />
          <DataLine label="Periodo al" value={formatDate(toDate)} />
          <DataLine label="Giornate registrate" value={dailyRecords.length} />
          <DataLine label="Rifornimenti" value={fuelRecords.length} />
          <DataLine label="Interventi" value={expenses.length} />
          <DataLine label="Rinnovi documenti" value={documentRenewals.length} />
        </Panel>

        <Panel title="COMPOSIZIONE COSTI">
          <DataLine label="Carburante" value={formatEuro(totalFuelCost)} />
          <DataLine
            label="Interventi / manutenzioni"
            value={formatEuro(totalExpensesCost)}
          />
          <DataLine label="Documenti" value={formatEuro(totalDocumentsCost)} />
          <DataLine label="Totale" value={formatEuro(totalCost)} strong />
        </Panel>
      </div>

      <TablePanel title="RIFORNIMENTI NEL PERIODO">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="text-left p-3">DATA</th>
            <th className="text-left p-3">MEZZO</th>
            <th className="text-right p-3">KM</th>
            <th className="text-right p-3">LITRI</th>
            <th className="text-right p-3">TOTALE</th>
            <th className="text-right p-3">€/L</th>
          </tr>
        </thead>

        <tbody>
          {fuelRecords.map((record) => (
            <tr key={record.id} className="border-t border-slate-800">
              <td className="p-3">{formatDate(record.fuelDate)}</td>
              <td className="p-3 font-bold">{record.vehicle.plate}</td>
              <td className="p-3 text-right">{formatKm(record.kmValue)}</td>
              <td className="p-3 text-right">{formatDecimal(record.liters)}</td>
              <td className="p-3 text-right">{formatEuro(record.totalCost)}</td>
              <td className="p-3 text-right">
                {formatEuro(record.pricePerLiter)}
              </td>
            </tr>
          ))}

          {fuelRecords.length === 0 && (
            <tr>
              <td className="p-6 text-slate-500" colSpan={6}>
                Nessun rifornimento nel periodo.
              </td>
            </tr>
          )}
        </tbody>
      </TablePanel>

      <TablePanel title="INTERVENTI NEL PERIODO">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="text-left p-3">DATA</th>
            <th className="text-left p-3">MEZZO</th>
            <th className="text-right p-3">KM</th>
            <th className="text-left p-3">INTERVENTO</th>
            <th className="text-right p-3">IMPORTO</th>
          </tr>
        </thead>

        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id} className="border-t border-slate-800">
              <td className="p-3">{formatDate(expense.expenseDate)}</td>
              <td className="p-3 font-bold">{expense.vehicle.plate}</td>
              <td className="p-3 text-right">{formatKm(expense.kmValue)}</td>
              <td className="p-3">{expense.category || "-"}</td>
              <td className="p-3 text-right">{formatEuro(expense.amount)}</td>
            </tr>
          ))}

          {expenses.length === 0 && (
            <tr>
              <td className="p-6 text-slate-500" colSpan={5}>
                Nessun intervento nel periodo.
              </td>
            </tr>
          )}
        </tbody>
      </TablePanel>
    </AppLayout>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block w-full">
      <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
        {label}
      </span>
      {children}
    </label>
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
      <div className="text-3xl font-black mt-2">{value}</div>
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

function DataLine({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string | number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm gap-4">
      <span className="text-slate-400">{label}</span>
      <span
        className={`text-right ${
          strong ? "font-black text-slate-100" : "font-bold text-slate-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TablePanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto mb-8">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-sm font-black tracking-widest text-slate-200">
          {title}
        </h2>
      </div>

      <table className="w-full text-sm">{children}</table>
    </div>
  );
}