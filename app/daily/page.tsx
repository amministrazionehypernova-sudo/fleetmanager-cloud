"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  currentKm: number;
};

type DailyRecord = {
  id: string;
  recordDate: string;
  startKm: number;
  endKm: number;
  kmDone: number;
  liters: number;
  fuelCost: number;
  kmPerLiter: number;
  costPerKm: number;
  notes: string | null;
  vehicle: Vehicle;
};

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT");
}

function formatNumber(value: number) {
  return value.toLocaleString("it-IT");
}

function formatEuro(value: number) {
  return `€ ${value.toFixed(2)}`;
}

export default function DailyPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [recordDate, setRecordDate] = useState(todayInputDate());
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [liters, setLiters] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [notes, setNotes] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadVehicles(selectedVehicleId?: string) {
    const response = await fetch("/api/vehicles");
    const data = await response.json();

    if (!response.ok) {
      setError("Errore caricamento veicoli.");
      return;
    }

    const loadedVehicles: Vehicle[] = data.vehicles;
    setVehicles(loadedVehicles);

    if (loadedVehicles.length === 0) {
      setVehicleId("");
      setStartKm("");
      return;
    }

    const activeVehicleId = selectedVehicleId || vehicleId || loadedVehicles[0].id;
    const selected = loadedVehicles.find((vehicle) => vehicle.id === activeVehicleId);

    if (selected) {
      setVehicleId(selected.id);
      setStartKm(String(selected.currentKm || 0));
    } else {
      setVehicleId(loadedVehicles[0].id);
      setStartKm(String(loadedVehicles[0].currentKm || 0));
    }
  }

  async function loadRecords() {
    const response = await fetch("/api/daily-records");
    const data = await response.json();

    if (response.ok) {
      setRecords(data.records);
    }
  }

  function handleVehicleChange(id: string) {
    setVehicleId(id);
    setError("");
    setSuccess("");

    const selected = vehicles.find((vehicle) => vehicle.id === id);

    if (selected) {
      setStartKm(String(selected.currentKm || 0));
    }
  }

  async function saveRecord(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!vehicleId) {
      setError("Seleziona un veicolo.");
      return;
    }

    if (!recordDate) {
      setError("Inserisci la data.");
      return;
    }

    if (!endKm.trim()) {
      setError("Inserisci i km di arrivo.");
      return;
    }

    const numericStartKm = Number(startKm || 0);
    const numericEndKm = Number(endKm || 0);

    if (numericEndKm < numericStartKm) {
      setError("I km di arrivo non possono essere inferiori ai km di partenza.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/daily-records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
        recordDate,
        startKm,
        endKm,
        liters,
        fuelCost,
        notes,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Errore salvataggio giornata.");
      return;
    }

    setEndKm("");
    setLiters("");
    setFuelCost("");
    setNotes("");
    setSuccess("Giornata salvata. Km veicolo aggiornati automaticamente.");

    await loadVehicles(vehicleId);
    await loadRecords();
  }

  useEffect(() => {
    loadVehicles();
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AppLayout
      title="KM GIORNALIERI"
      subtitle="Registro percorrenze e aggiornamento automatico km veicolo"
    >
      <form
        onSubmit={saveRecord}
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-5"
      >
        <div>
          <h2 className="text-sm font-black tracking-widest text-slate-200">
            REGISTRA USCITA GIORNALIERA
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Il campo Km partenza viene letto automaticamente dai Km attuali del veicolo.
            Dopo il salvataggio, i Km arrivo diventano i nuovi Km attuali.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="VEICOLO">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={vehicleId}
              onChange={(event) => handleVehicleChange(event.target.value)}
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand || ""} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="DATA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={recordDate}
              onChange={(event) => setRecordDate(event.target.value)}
            />
          </Field>

          <Field label="KM PARTENZA AUTOMATICI">
            <input
              className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-slate-400"
              value={startKm}
              readOnly
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Field label="KM ARRIVO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. 120150"
              value={endKm}
              onChange={(event) => setEndKm(event.target.value)}
              type="number"
            />
          </Field>

          <Field label="LITRI RIFORNITI">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Opzionale"
              value={liters}
              onChange={(event) => setLiters(event.target.value)}
              type="number"
              step="0.01"
            />
          </Field>

          <Field label="COSTO CARBURANTE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Opzionale"
              value={fuelCost}
              onChange={(event) => setFuelCost(event.target.value)}
              type="number"
              step="0.01"
            />
          </Field>

          <Field label="NOTE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Note giornata"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </Field>

          <div className="flex items-end">
            <button
              disabled={loading}
              className="w-full bg-sky-700 hover:bg-sky-600 disabled:opacity-50 px-4 py-2 font-black tracking-widest"
            >
              {loading ? "SALVATAGGIO..." : "SALVA"}
            </button>
          </div>
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
      </form>

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3">DATA</th>
              <th className="text-left p-3">MEZZO</th>
              <th className="text-right p-3">KM PARTENZA</th>
              <th className="text-right p-3">KM ARRIVO</th>
              <th className="text-right p-3">KM FATTI</th>
              <th className="text-right p-3">LITRI</th>
              <th className="text-right p-3">COSTO</th>
              <th className="text-right p-3">KM/L</th>
              <th className="text-right p-3">€/KM</th>
              <th className="text-left p-3">NOTE</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3">
                  {formatDate(record.recordDate)}
                </td>

                <td className="p-3 font-bold">
                  {record.vehicle.plate}
                </td>

                <td className="p-3 text-right">
                  {formatNumber(record.startKm)}
                </td>

                <td className="p-3 text-right">
                  {formatNumber(record.endKm)}
                </td>

                <td className="p-3 text-right">
                  {formatNumber(record.kmDone)}
                </td>

                <td className="p-3 text-right">
                  {record.liters.toFixed(2)}
                </td>

                <td className="p-3 text-right">
                  {formatEuro(record.fuelCost)}
                </td>

                <td className="p-3 text-right">
                  {record.kmPerLiter.toFixed(2)}
                </td>

                <td className="p-3 text-right">
                  € {record.costPerKm.toFixed(2)}
                </td>

                <td className="p-3">
                  {record.notes || "-"}
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={10}>
                  Nessuna giornata registrata.
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
    <label className="block">
      <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
        {label}
      </span>

      {children}
    </label>
  );
}