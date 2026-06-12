"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  currentKm: number;
};

type WorkItem = {
  id: string;
  name: string;
  category: string | null;
};

type ScheduledMaintenance = {
  id: string;
  vehicleId: string;
  title: string;
  worksText: string | null;
  workItemsJson: string | null;
  dueType: string;
  dueKm: number | null;
  dueDate: string | null;
  warningKm: number;
  warningDays: number;
  notes: string | null;
  vehicle: Vehicle;
};

function formatKm(value: number | null | undefined) {
  return (value || 0).toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

function parseWorkItemsJson(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function getMaintenanceStatus(item: ScheduledMaintenance) {
  if (item.dueType === "km") {
    const currentKm = item.vehicle?.currentKm || 0;
    const dueKm = item.dueKm || 0;
    const kmLeft = dueKm - currentKm;

    if (kmLeft < 0) {
      return {
        label: "SCADUTA",
        detail: `Superata di ${formatKm(Math.abs(kmLeft))} km`,
        level: "red",
      };
    }

    if (kmLeft <= item.warningKm) {
      return {
        label: "IN SCADENZA",
        detail: `Mancano ${formatKm(kmLeft)} km`,
        level: "yellow",
      };
    }

    return {
      label: "OK",
      detail: `Mancano ${formatKm(kmLeft)} km`,
      level: "green",
    };
  }

  if (item.dueType === "date" && item.dueDate) {
    const today = new Date();
    const dueDate = new Date(item.dueDate);
    const diffMs = dueDate.getTime() - today.getTime();
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) {
      return {
        label: "SCADUTA",
        detail: `Scaduta da ${Math.abs(daysLeft)} giorni`,
        level: "red",
      };
    }

    if (daysLeft <= item.warningDays) {
      return {
        label: "IN SCADENZA",
        detail: `Mancano ${daysLeft} giorni`,
        level: "yellow",
      };
    }

    return {
      label: "OK",
      detail: `Mancano ${daysLeft} giorni`,
      level: "green",
    };
  }

  return {
    label: "NON IMPOSTATA",
    detail: "-",
    level: "gray",
  };
}

export default function MaintenanceProgramsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [items, setItems] = useState<ScheduledMaintenance[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [vehicleId, setVehicleId] = useState("");
  const [title, setTitle] = useState("");
  const [selectedWorkItemIds, setSelectedWorkItemIds] = useState<string[]>([]);
  const [workSearch, setWorkSearch] = useState("");
  const [dueType, setDueType] = useState("km");
  const [dueKm, setDueKm] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [warningKm, setWarningKm] = useState("1000");
  const [warningDays, setWarningDays] = useState("30");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadVehicles() {
    const response = await fetch("/api/vehicles");
    const data = await response.json();

    if (response.ok) {
      const loadedVehicles = data.vehicles || [];
      setVehicles(loadedVehicles);

      if (loadedVehicles.length > 0 && !vehicleId) {
        setVehicleId(loadedVehicles[0].id);
      }
    }
  }

  async function loadWorkItems() {
    const response = await fetch("/api/work-items");
    const data = await response.json();

    if (response.ok) {
      setWorkItems(data.workItems || []);
    }
  }

  async function loadItems() {
    const response = await fetch("/api/scheduled-maintenances");
    const data = await response.json();

    if (response.ok) {
      setItems(data.items || []);
    }
  }

  useEffect(() => {
    loadVehicles();
    loadWorkItems();
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groupedWorkItems = useMemo(() => {
    const search = workSearch.toLowerCase().trim();

    const filtered = workItems.filter((item) => {
      if (!search) return true;
      return `${item.name} ${item.category || ""}`
        .toLowerCase()
        .includes(search);
    });

    return filtered.reduce<Record<string, WorkItem[]>>((groups, item) => {
      const category = item.category || "Altro";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
      return groups;
    }, {});
  }, [workItems, workSearch]);

  const selectedWorkItems = workItems.filter((item) =>
    selectedWorkItemIds.includes(item.id)
  );

  function toggleWorkItem(id: string) {
    setSelectedWorkItemIds((current) => {
      if (current.includes(id)) {
        return current.filter((itemId) => itemId !== id);
      }

      return [...current, id];
    });
  }

  function resetForm() {
    setEditingId(null);
    setTitle("");
    setSelectedWorkItemIds([]);
    setWorkSearch("");
    setDueType("km");
    setDueKm("");
    setDueDate("");
    setWarningKm("1000");
    setWarningDays("30");
    setNotes("");
    setError("");
    setSuccess("");
  }

  function startEdit(item: ScheduledMaintenance) {
    setEditingId(item.id);
    setVehicleId(item.vehicleId);
    setTitle(item.title || "");
    setSelectedWorkItemIds(parseWorkItemsJson(item.workItemsJson));
    setDueType(item.dueType || "km");
    setDueKm(item.dueKm ? String(item.dueKm) : "");
    setDueDate(item.dueDate ? new Date(item.dueDate).toISOString().slice(0, 10) : "");
    setWarningKm(String(item.warningKm || 1000));
    setWarningDays(String(item.warningDays || 30));
    setNotes(item.notes || "");
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!vehicleId) {
      setError("Seleziona un veicolo.");
      return;
    }

    if (!title.trim()) {
      setError("Inserisci il titolo della manutenzione.");
      return;
    }

    if (selectedWorkItemIds.length === 0) {
      setError("Seleziona almeno un lavoro da eseguire.");
      return;
    }

    if (dueType === "km" && !dueKm.trim()) {
      setError("Inserisci i km di scadenza.");
      return;
    }

    if (dueType === "date" && !dueDate) {
      setError("Inserisci la data di scadenza.");
      return;
    }

    const response = await fetch("/api/scheduled-maintenances", {
      method: editingId ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingId,
        vehicleId,
        title,
        workItemIds: selectedWorkItemIds,
        dueType,
        dueKm,
        dueDate,
        warningKm,
        warningDays,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore salvataggio manutenzione.");
      return;
    }

    setSuccess(
      editingId
        ? "Manutenzione modificata correttamente."
        : "Manutenzione programmata salvata correttamente."
    );

    resetForm();
    await loadItems();
  }

  async function completeItem(item: ScheduledMaintenance) {
    const confirmed = window.confirm(
      `Vuoi completare la manutenzione "${item.title}"? Verrà creato un intervento nello storico.`
    );

    if (!confirmed) return;

    const amount = window.prompt("Importo intervento:", "0");
    if (amount === null) return;

    const supplier = window.prompt("Fornitore / officina:", "");
    if (supplier === null) return;

    const invoiceNumber = window.prompt("Numero fattura:", "");
    if (invoiceNumber === null) return;

    const notes = window.prompt("Note:", "");
    if (notes === null) return;

    const response = await fetch("/api/scheduled-maintenances/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maintenanceId: item.id,
        amount,
        supplier,
        invoiceNumber,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore completamento manutenzione.");
      return;
    }

    setSuccess("Manutenzione completata e intervento creato nello storico.");
    await loadItems();
  }

  async function deleteItem(item: ScheduledMaintenance) {
    const confirmed = window.confirm(
      `Vuoi eliminare la manutenzione "${item.title}"?`
    );

    if (!confirmed) return;

    const response = await fetch("/api/scheduled-maintenances", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore eliminazione manutenzione.");
      return;
    }

    if (editingId === item.id) {
      resetForm();
    }

    await loadItems();
  }

  function statusClass(level: string) {
    if (level === "red") return "text-red-300";
    if (level === "yellow") return "text-yellow-300";
    if (level === "green") return "text-emerald-300";
    return "text-slate-400";
  }

  return (
    <AppLayout
      title="MANUTENZIONI PROGRAMMATE"
      subtitle="Pianificazione interventi futuri per ogni veicolo"
    >
      <form
        onSubmit={saveItem}
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-5"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black tracking-widest text-slate-200">
              {editingId ? "MODIFICA MANUTENZIONE" : "NUOVA MANUTENZIONE PROGRAMMATA"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Puoi programmare più manutenzioni contemporaneamente sullo stesso veicolo.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-xs font-black"
            >
              ANNULLA MODIFICA
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="VEICOLO">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand || ""} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="TITOLO MANUTENZIONE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. Tagliando 20.000 km"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
        </div>

        <div className="border border-slate-800 bg-slate-950/50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <Field label="CERCA LAVORO">
              <input
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                placeholder="Es. olio, freni, pneumatici..."
                value={workSearch}
                onChange={(event) => setWorkSearch(event.target.value)}
              />
            </Field>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedWorkItemIds([]);
                  setWorkSearch("");
                }}
                className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
              >
                PULISCI LAVORI
              </button>
            </div>
          </div>

          {selectedWorkItems.length > 0 && (
            <div className="mb-4 border border-emerald-900 bg-emerald-950/30 p-3">
              <div className="text-xs font-black tracking-widest text-emerald-300 mb-2">
                LAVORI SELEZIONATI
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedWorkItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleWorkItem(item.id)}
                    className="border border-emerald-800 text-emerald-200 px-2 py-1 text-xs hover:bg-emerald-950"
                  >
                    {item.name} ×
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
            {Object.entries(groupedWorkItems).map(([category, items]) => (
              <div key={category} className="border border-slate-800 p-3">
                <div className="text-xs font-black tracking-widest text-sky-400 mb-2">
                  {category}
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-start gap-2 text-sm text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedWorkItemIds.includes(item.id)}
                        onChange={() => toggleWorkItem(item.id)}
                        className="mt-1"
                      />

                      <span>{item.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="TIPO SCADENZA">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={dueType}
              onChange={(event) => setDueType(event.target.value)}
            >
              <option value="km">KM</option>
              <option value="date">DATA</option>
            </select>
          </Field>

          {dueType === "km" ? (
            <>
              <Field label="SCADENZA KM">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Es. 20000"
                  type="number"
                  value={dueKm}
                  onChange={(event) => setDueKm(event.target.value)}
                />
              </Field>

              <Field label="AVVISO KM PRIMA">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Es. 1000"
                  type="number"
                  value={warningKm}
                  onChange={(event) => setWarningKm(event.target.value)}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="DATA SCADENZA">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                />
              </Field>

              <Field label="AVVISO GIORNI PRIMA">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Es. 30"
                  type="number"
                  value={warningDays}
                  onChange={(event) => setWarningDays(event.target.value)}
                />
              </Field>
            </>
          )}

          <Field label="NOTE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Note manutenzione"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>
        </div>

        {error && (
          <div className="border border-red-900 bg-red-950/40 text-red-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="border border-emerald-900 bg-emerald-950/40 text-emerald-200 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <button className="bg-sky-700 hover:bg-sky-600 px-6 py-3 font-black tracking-widest">
          {editingId ? "SALVA MODIFICHE" : "SALVA MANUTENZIONE"}
        </button>
      </form>

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3">MEZZO</th>
              <th className="text-left p-3">MANUTENZIONE</th>
              <th className="text-left p-3 min-w-[320px]">LAVORI DA FARE</th>
              <th className="text-left p-3">SCADENZA</th>
              <th className="text-left p-3">STATO</th>
              <th className="text-right p-3 min-w-[140px]">AZIONI</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => {
              const status = getMaintenanceStatus(item);

              return (
                <tr
                  key={item.id}
                  className="border-t border-slate-800 hover:bg-slate-800/50 align-top"
                >
                  <td className="p-3 font-bold">
                    {item.vehicle?.plate}
                    <span className="block text-xs font-normal text-slate-500">
                      {item.vehicle?.brand || ""} {item.vehicle?.model || ""}
                    </span>
                  </td>

                  <td className="p-3 font-bold">
                    {item.title}
                    {item.notes && (
                      <span className="block text-xs font-normal text-slate-500 mt-1">
                        {item.notes}
                      </span>
                    )}
                  </td>

                  <td className="p-3 min-w-[320px]">{item.worksText || "-"}</td>

                  <td className="p-3">
                    {item.dueType === "km"
                      ? `${formatKm(item.dueKm)} km`
                      : formatDate(item.dueDate)}
                  </td>

                  <td className="p-3">
                    <div className={`font-black ${statusClass(status.level)}`}>
                      {status.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {status.detail}
                    </div>
                  </td>

                  <td className="p-3 text-right min-w-[140px]">
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="w-[100px] border border-sky-800 text-sky-300 hover:bg-sky-950 px-3 py-1 text-xs font-black"
                      >
                        MODIFICA
                      </button>

                      <button
                        type="button"
                        onClick={() => completeItem(item)}
                        className="w-[100px] border border-emerald-800 text-emerald-300 hover:bg-emerald-950 px-3 py-1 text-xs font-black"
                      >
                        COMPLETA
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteItem(item)}
                        className="w-[100px] border border-red-900 text-red-300 hover:bg-red-950 px-3 py-1 text-xs font-black"
                      >
                        ELIMINA
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={6}>
                  Nessuna manutenzione programmata.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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