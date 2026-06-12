"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  currentKm: number;
  insuranceExpiry: string | null;
  inspectionExpiry: string | null;
  taxExpiry: string | null;
  serviceDueKm: number | null;
};

type ScheduledMaintenance = {
  id: string;
  title: string;
  worksText: string | null;
  dueType: string;
  dueKm: number | null;
  dueDate: string | null;
  warningKm: number;
  warningDays: number;
  vehicle: Vehicle;
};

type DeadlineRow = {
  id: string;
  vehicle: string;
  type: string;
  due: string;
  status: string;
  detail: string;
  action: string;
  level: "green" | "yellow" | "red";
};

function formatKm(value: number) {
  return value.toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function getDateStatus(value: string | null, warningDays = 30) {
  if (!value) return null;

  const today = new Date();
  const dueDate = new Date(value);
  const diffMs = dueDate.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return {
      status: "SCADUTO",
      detail: `Scaduto da ${Math.abs(daysLeft)} giorni`,
      level: "red" as const,
    };
  }

  if (daysLeft <= warningDays) {
    return {
      status: "IN SCADENZA",
      detail: `Mancano ${daysLeft} giorni`,
      level: "yellow" as const,
    };
  }

  return {
    status: "OK",
    detail: `Mancano ${daysLeft} giorni`,
    level: "green" as const,
  };
}

function getKmStatus(currentKm: number, dueKm: number | null, warningKm = 1000) {
  if (!dueKm) return null;

  const kmLeft = dueKm - currentKm;

  if (kmLeft < 0) {
    return {
      status: "SUPERATO",
      detail: `Superato di ${formatKm(Math.abs(kmLeft))} km`,
      level: "red" as const,
    };
  }

  if (kmLeft <= warningKm) {
    return {
      status: "IN SCADENZA",
      detail: `Mancano ${formatKm(kmLeft)} km`,
      level: "yellow" as const,
    };
  }

  return {
    status: "OK",
    detail: `Mancano ${formatKm(kmLeft)} km`,
    level: "green" as const,
  };
}

export default function DeadlinesPage() {
  const [rows, setRows] = useState<DeadlineRow[]>([]);
  const [error, setError] = useState("");

  async function loadDeadlines() {
    setError("");

    const vehiclesResponse = await fetch("/api/vehicles");
    const vehiclesData = await vehiclesResponse.json();

    if (!vehiclesResponse.ok) {
      setError(vehiclesData.error || "Errore caricamento veicoli.");
      return;
    }

    const maintenanceResponse = await fetch("/api/scheduled-maintenances");
    const maintenanceData = await maintenanceResponse.json();

    if (!maintenanceResponse.ok) {
      setError(
        maintenanceData.error || "Errore caricamento manutenzioni programmate."
      );
      return;
    }

    const deadlineRows: DeadlineRow[] = [];

    vehiclesData.vehicles.forEach((vehicle: Vehicle) => {
      const vehicleName = `${vehicle.plate} - ${vehicle.brand || ""} ${
        vehicle.model || ""
      }`;

      const insurance = getDateStatus(vehicle.insuranceExpiry, 30);
      if (insurance) {
        deadlineRows.push({
          id: `${vehicle.id}-insurance`,
          vehicle: vehicleName,
          type: "Assicurazione",
          due: new Date(vehicle.insuranceExpiry as string).toLocaleDateString(
            "it-IT"
          ),
          status: insurance.status,
          detail: insurance.detail,
          action:
            "Rinnovare assicurazione e registrare il rinnovo in Rinnovi Documenti.",
          level: insurance.level,
        });
      }

      const inspection = getDateStatus(vehicle.inspectionExpiry, 30);
      if (inspection) {
        deadlineRows.push({
          id: `${vehicle.id}-inspection`,
          vehicle: vehicleName,
          type: "Revisione",
          due: new Date(vehicle.inspectionExpiry as string).toLocaleDateString(
            "it-IT"
          ),
          status: inspection.status,
          detail: inspection.detail,
          action:
            "Effettuare revisione e registrare il rinnovo in Rinnovi Documenti.",
          level: inspection.level,
        });
      }

      const tax = getDateStatus(vehicle.taxExpiry, 30);
      if (tax) {
        deadlineRows.push({
          id: `${vehicle.id}-tax`,
          vehicle: vehicleName,
          type: "Bollo",
          due: new Date(vehicle.taxExpiry as string).toLocaleDateString("it-IT"),
          status: tax.status,
          detail: tax.detail,
          action: "Pagare bollo e registrare il rinnovo in Rinnovi Documenti.",
          level: tax.level,
        });
      }

      const hasScheduledMaintenanceForSameKm = maintenanceData.items.some(
  (item: ScheduledMaintenance) =>
    item.vehicle.id === vehicle.id &&
    item.dueType === "km" &&
    item.dueKm === vehicle.serviceDueKm
);

const legacyService = getKmStatus(
  vehicle.currentKm,
  vehicle.serviceDueKm,
  1000
);

if (legacyService && !hasScheduledMaintenanceForSameKm) {
  deadlineRows.push({
    id: `${vehicle.id}-legacy-service`,
    vehicle: vehicleName,
    type: "Tagliando",
    due: `${formatKm(vehicle.serviceDueKm || 0)} km`,
    status: legacyService.status,
    detail: legacyService.detail,
    action:
      "Tagliando registrato dalla scheda veicolo / registro operativo.",
    level: legacyService.level,
  });
}
    });

    maintenanceData.items.forEach((item: ScheduledMaintenance) => {
      const vehicle = item.vehicle;

      const vehicleName = `${vehicle.plate} - ${vehicle.brand || ""} ${
        vehicle.model || ""
      }`;

      if (item.dueType === "km") {
        const status = getKmStatus(
          vehicle.currentKm,
          item.dueKm,
          item.warningKm || 1000
        );

        if (status) {
          deadlineRows.push({
            id: `maintenance-${item.id}`,
            vehicle: vehicleName,
            type: `Manutenzione · ${item.title}`,
            due: `${formatKm(item.dueKm || 0)} km`,
            status: status.status,
            detail: status.detail,
            action: item.worksText || "Lavori non specificati.",
            level: status.level,
          });
        }
      }

      if (item.dueType === "date") {
        const status = getDateStatus(item.dueDate, item.warningDays || 30);

        if (status) {
          deadlineRows.push({
            id: `maintenance-${item.id}`,
            vehicle: vehicleName,
            type: `Manutenzione · ${item.title}`,
            due: item.dueDate
              ? new Date(item.dueDate).toLocaleDateString("it-IT")
              : "-",
            status: status.status,
            detail: status.detail,
            action: item.worksText || "Lavori non specificati.",
            level: status.level,
          });
        }
      }
    });

    const sortedRows = deadlineRows.sort((a, b) => {
      const priority = {
        red: 0,
        yellow: 1,
        green: 2,
      };

      return priority[a.level] - priority[b.level];
    });

    setRows(sortedRows);
  }

  useEffect(() => {
    loadDeadlines();
  }, []);

  function rowClass(level: string) {
    if (level === "red") return "bg-red-950/50 text-red-100";
    if (level === "yellow") return "bg-yellow-950/40 text-yellow-100";
    return "bg-emerald-950/40 text-emerald-100";
  }

  return (
    <AppLayout
      title="SCADENZE"
      subtitle="Documenti, tagliandi e manutenzioni programmate"
    >
      {error && (
        <div className="border border-red-900 bg-red-950/40 text-red-200 px-4 py-3 text-sm mb-8">
          {error}
        </div>
      )}

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3">MEZZO</th>
              <th className="text-left p-3">TIPO</th>
              <th className="text-left p-3">SCADENZA</th>
              <th className="text-left p-3">STATO</th>
              <th className="text-left p-3">DETTAGLIO</th>
              <th className="text-left p-3 min-w-[320px]">DA FARE</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={`border-t border-slate-800 align-top ${rowClass(
                  row.level
                )}`}
              >
                <td className="p-3 font-bold">{row.vehicle}</td>
                <td className="p-3">{row.type}</td>
                <td className="p-3">{row.due}</td>
                <td className="p-3 font-black">{row.status}</td>
                <td className="p-3">{row.detail}</td>
                <td className="p-3 min-w-[320px] font-bold">{row.action}</td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={6}>
                  Nessuna scadenza registrata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}