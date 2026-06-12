import Link from "next/link";
import type { ReactNode } from "react";
import AppLayout from "@/components/AppLayout";
import { prisma } from "@/lib/prisma";

type VehicleDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

function formatKm(value: number | null | undefined) {
  return (value || 0).toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatEuro(value: number | null | undefined) {
  return `€ ${(value || 0).toFixed(2)}`;
}

function formatDecimal(value: number | null | undefined) {
  return (value || 0).toFixed(2);
}

function getDateStatus(value: Date | null) {
  if (!value) {
    return {
      label: "Non impostata",
      detail: "-",
      className: "text-slate-400",
    };
  }

  const today = new Date();
  const diffMs = value.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      label: "SCADUTA",
      detail: `Scaduta da ${Math.abs(daysLeft)} giorni`,
      className: "text-red-300",
    };
  }

  if (daysLeft <= 30) {
    return {
      label: "IN SCADENZA",
      detail: `Mancano ${daysLeft} giorni`,
      className: "text-yellow-300",
    };
  }

  return {
    label: "OK",
    detail: `Mancano ${daysLeft} giorni`,
    className: "text-emerald-300",
  };
}

function getMaintenanceStatus(
  currentKm: number,
  dueType: string,
  dueKm: number | null,
  dueDate: Date | null,
  warningKm: number,
  warningDays: number
) {
  if (dueType === "km" && dueKm) {
    const kmLeft = dueKm - currentKm;

    if (kmLeft < 0) {
      return {
        label: "SCADUTA",
        detail: `Superata di ${formatKm(Math.abs(kmLeft))} km`,
        className: "text-red-300",
      };
    }

    if (kmLeft <= warningKm) {
      return {
        label: "IN SCADENZA",
        detail: `Mancano ${formatKm(kmLeft)} km`,
        className: "text-yellow-300",
      };
    }

    return {
      label: "OK",
      detail: `Mancano ${formatKm(kmLeft)} km`,
      className: "text-emerald-300",
    };
  }

  if (dueType === "date" && dueDate) {
    const today = new Date();
    const diffMs = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        label: "SCADUTA",
        detail: `Scaduta da ${Math.abs(daysLeft)} giorni`,
        className: "text-red-300",
      };
    }

    if (daysLeft <= warningDays) {
      return {
        label: "IN SCADENZA",
        detail: `Mancano ${daysLeft} giorni`,
        className: "text-yellow-300",
      };
    }

    return {
      label: "OK",
      detail: `Mancano ${daysLeft} giorni`,
      className: "text-emerald-300",
    };
  }

  return {
    label: "NON IMPOSTATA",
    detail: "-",
    className: "text-slate-400",
  };
}

function documentLabel(type: string) {
  if (type === "insurance") return "Assicurazione";
  if (type === "inspection") return "Revisione";
  if (type === "tax") return "Bollo";
  return type;
}

export default async function VehicleDetailsPage({
  params,
}: VehicleDetailsPageProps) {
  const { id } = await params;

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
    },
    include: {
      dailyRecords: {
        orderBy: {
          recordDate: "desc",
        },
      },
      fuelRecords: {
        orderBy: {
          fuelDate: "desc",
        },
      },
      expenses: {
        orderBy: {
          expenseDate: "desc",
        },
      },
      documentRenewals: {
        orderBy: {
          renewalDate: "desc",
        },
      },
      scheduledMaintenances: {
        where: {
          status: "active",
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!vehicle) {
    return (
      <AppLayout title="SCHEDA VEICOLO" subtitle="Veicolo non trovato">
        <div className="border border-red-900 bg-red-950/40 text-red-200 p-5">
          Veicolo non trovato.
        </div>

        <Link
          href="/vehicles"
          className="inline-block mt-6 border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
        >
          TORNA AI VEICOLI
        </Link>
      </AppLayout>
    );
  }

  const totalKm = vehicle.dailyRecords.reduce(
    (sum, record) => sum + record.kmDone,
    0
  );

  const totalFuelLiters = vehicle.fuelRecords.reduce(
    (sum, record) => sum + record.liters,
    0
  );

  const totalFuelCost = vehicle.fuelRecords.reduce(
    (sum, record) => sum + record.totalCost,
    0
  );

  const totalExpensesCost = vehicle.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const totalRenewalsCost = vehicle.documentRenewals.reduce(
    (sum, renewal) => sum + renewal.amount,
    0
  );

  const totalCost = totalFuelCost + totalExpensesCost + totalRenewalsCost;

  const avgKmPerLiter =
    totalFuelLiters > 0 ? totalKm / totalFuelLiters : 0;

  const avgFuelCostPerKm =
    totalKm > 0 ? totalFuelCost / totalKm : 0;

  const avgTotalCostPerKm =
    totalKm > 0 ? totalCost / totalKm : 0;

  const insuranceStatus = getDateStatus(vehicle.insuranceExpiry);
  const inspectionStatus = getDateStatus(vehicle.inspectionExpiry);
  const taxStatus = getDateStatus(vehicle.taxExpiry);

  return (
    <AppLayout
      title={`SCHEDA VEICOLO · ${vehicle.plate}`}
      subtitle={`${vehicle.brand || ""} ${vehicle.model || ""}`}
    >
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/vehicles"
          className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
        >
          ← TORNA AI VEICOLI
        </Link>

        <Link
          href="/operations"
          className="border border-sky-800 text-sky-300 hover:bg-sky-950 px-4 py-2 text-sm font-black"
        >
          REGISTRA OPERAZIONE
        </Link>

        <Link
          href="/document-renewals"
          className="border border-emerald-800 text-emerald-300 hover:bg-emerald-950 px-4 py-2 text-sm font-black"
        >
          RINNOVA DOCUMENTO
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="KM ATTUALI"
          value={`${formatKm(vehicle.currentKm)} km`}
          caption="dato aggiornato dal Registro Operativo"
        />

        <MetricCard
          label="KM REGISTRATI"
          value={`${formatKm(totalKm)} km`}
          caption="storico giornaliero"
        />

        <MetricCard
          label="COSTO TOTALE"
          value={formatEuro(totalCost)}
          caption="carburante + interventi + documenti"
        />

        <MetricCard
          label="COSTO/KM"
          value={formatEuro(avgTotalCostPerKm)}
          caption="media complessiva"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Panel title="ANAGRAFICA">
          <DataLine label="Targa" value={vehicle.plate} />
          <DataLine label="Marca" value={vehicle.brand || "-"} />
          <DataLine label="Modello" value={vehicle.model || "-"} />
          <DataLine label="Anno" value={vehicle.year || "-"} />
          <DataLine label="Alimentazione" value={vehicle.fuelType || "-"} />
          <DataLine label="VIN" value={vehicle.vin || "-"} />
          <DataLine label="Stato" value={vehicle.status} />
        </Panel>

        <Panel title="DOCUMENTI">
          <StatusLine
            label="Assicurazione"
            date={formatDate(vehicle.insuranceExpiry)}
            status={insuranceStatus.label}
            detail={insuranceStatus.detail}
            className={insuranceStatus.className}
          />

          <StatusLine
            label="Revisione"
            date={formatDate(vehicle.inspectionExpiry)}
            status={inspectionStatus.label}
            detail={inspectionStatus.detail}
            className={inspectionStatus.className}
          />

          <StatusLine
            label="Bollo"
            date={formatDate(vehicle.taxExpiry)}
            status={taxStatus.label}
            detail={taxStatus.detail}
            className={taxStatus.className}
          />
        </Panel>

        <Panel title="COSTI E CONSUMI">
          <DataLine label="Litri carburante" value={`${formatDecimal(totalFuelLiters)} L`} />
          <DataLine label="Costo carburante" value={formatEuro(totalFuelCost)} />
          <DataLine label="Costo interventi" value={formatEuro(totalExpensesCost)} />
          <DataLine label="Costo documenti" value={formatEuro(totalRenewalsCost)} />
          <DataLine label="Km/L medio" value={`${formatDecimal(avgKmPerLiter)} km/L`} />
          <DataLine label="Carburante/km" value={formatEuro(avgFuelCostPerKm)} />
          <DataLine label="Totale/km" value={formatEuro(avgTotalCostPerKm)} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Panel title="MANUTENZIONI PROGRAMMATE">
          {vehicle.scheduledMaintenances.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessuna manutenzione programmata attiva.
            </p>
          )}

          {vehicle.scheduledMaintenances.map((item) => {
            const status = getMaintenanceStatus(
              vehicle.currentKm,
              item.dueType,
              item.dueKm,
              item.dueDate,
              item.warningKm,
              item.warningDays
            );

            return (
              <div key={item.id} className="border-b border-slate-800 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-black text-slate-100">
                      {item.title}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {item.worksText || "Lavori non specificati"}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-black ${status.className}`}>
                      {status.label}
                    </div>

                    <div className="text-xs text-slate-500 mt-1">
                      {status.detail}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mt-2">
                  Scadenza:{" "}
                  {item.dueType === "km"
                    ? `${formatKm(item.dueKm)} km`
                    : formatDate(item.dueDate)}
                </div>
              </div>
            );
          })}
        </Panel>

        <Panel title="ULTIMI RINNOVI DOCUMENTI">
          {vehicle.documentRenewals.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessun rinnovo registrato.
            </p>
          )}

          {vehicle.documentRenewals.slice(0, 8).map((renewal) => (
            <DataLine
              key={renewal.id}
              label={`${documentLabel(renewal.documentType)} · ${formatDate(
                renewal.renewalDate
              )}`}
              value={formatEuro(renewal.amount)}
            />
          ))}
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <Panel title="ULTIMI INTERVENTI">
          {vehicle.expenses.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessun intervento registrato.
            </p>
          )}

          {vehicle.expenses.slice(0, 8).map((expense) => (
            <DataLine
              key={expense.id}
              label={`${expense.category || "Intervento"} · ${formatDate(
                expense.expenseDate
              )}`}
              value={formatEuro(expense.amount)}
            />
          ))}
        </Panel>

        <Panel title="ULTIMI RIFORNIMENTI">
          {vehicle.fuelRecords.length === 0 && (
            <p className="text-slate-500 text-sm">
              Nessun rifornimento registrato.
            </p>
          )}

          {vehicle.fuelRecords.slice(0, 8).map((fuel) => (
            <DataLine
              key={fuel.id}
              label={`${formatDate(fuel.fuelDate)} · ${formatDecimal(
                fuel.liters
              )} L`}
              value={formatEuro(fuel.totalCost)}
            />
          ))}
        </Panel>
      </div>

      <TablePanel title="ULTIME GIORNATE KM">
        <thead className="bg-slate-900 text-slate-300">
          <tr>
            <th className="text-left p-3">DATA</th>
            <th className="text-right p-3">KM PARTENZA</th>
            <th className="text-right p-3">KM ARRIVO</th>
            <th className="text-right p-3">KM FATTI</th>
            <th className="text-left p-3">NOTE</th>
          </tr>
        </thead>

        <tbody>
          {vehicle.dailyRecords.slice(0, 15).map((record) => (
            <tr
              key={record.id}
              className="border-t border-slate-800 hover:bg-slate-800/50"
            >
              <td className="p-3">{formatDate(record.recordDate)}</td>
              <td className="p-3 text-right">{formatKm(record.startKm)}</td>
              <td className="p-3 text-right">{formatKm(record.endKm)}</td>
              <td className="p-3 text-right">{formatKm(record.kmDone)}</td>
              <td className="p-3">{record.notes || "-"}</td>
            </tr>
          ))}

          {vehicle.dailyRecords.length === 0 && (
            <tr>
              <td className="p-6 text-slate-500" colSpan={5}>
                Nessuna giornata registrata.
              </td>
            </tr>
          )}
        </tbody>
      </TablePanel>
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
  children: ReactNode;
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

function TablePanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
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

function DataLine({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-sm gap-4">
      <span className="text-slate-400">{label}</span>
      <span className="font-bold text-slate-100 text-right">{value}</span>
    </div>
  );
}

function StatusLine({
  label,
  date,
  status,
  detail,
  className,
}: {
  label: string;
  date: string;
  status: string;
  detail: string;
  className: string;
}) {
  return (
    <div className="border-b border-slate-800 pb-2">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-bold text-slate-100">{date}</span>
      </div>

      <div className="flex items-center justify-between gap-4 text-xs mt-1">
        <span className={className}>{status}</span>
        <span className="text-slate-500 text-right">{detail}</span>
      </div>
    </div>
  );
}