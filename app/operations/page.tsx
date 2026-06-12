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

export default function OperationsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<DailyRecord[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [recordDate, setRecordDate] = useState(todayInputDate());
  const [startKm, setStartKm] = useState("");
  const [endKm, setEndKm] = useState("");
  const [notes, setNotes] = useState("");

  const [hasFuel, setHasFuel] = useState(false);
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelTotalCost, setFuelTotalCost] = useState("");
  const [fuelNotes, setFuelNotes] = useState("");

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

    const loadedVehicles: Vehicle[] = data.vehicles || [];
    setVehicles(loadedVehicles);

    if (loadedVehicles.length === 0) {
      setVehicleId("");
      setStartKm("");
      return;
    }

    const activeVehicleId = selectedVehicleId || vehicleId || loadedVehicles[0].id;
    const selected =
      loadedVehicles.find((vehicle) => vehicle.id === activeVehicleId) ||
      loadedVehicles[0];

    setVehicleId(selected.id);
    setStartKm(String(selected.currentKm || 0));
  }

  async function loadRecords() {
    const response = await fetch("/api/operations");
    const data = await response.json();

    if (response.ok) {
      setRecords(data.records || []);
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

  function getKmDone() {
    const start = Number(startKm || 0);
    const end = Number(endKm || 0);

    if (!endKm || end < start) return 0;

    return end - start;
  }

  function getPricePerLiter() {
    const liters = Number(fuelLiters || 0);
    const total = Number(fuelTotalCost || 0);

    if (!hasFuel || liters <= 0 || total <= 0) return 0;

    return total / liters;
  }

  async function saveOperation(event: React.FormEvent) {
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

    if (numericEndKm <= numericStartKm) {
      setError("I km di arrivo devono essere superiori ai km di partenza.");
      return;
    }

    if (hasFuel && Number(fuelLiters || 0) <= 0) {
      setError("Hai selezionato rifornimento: inserisci i litri.");
      return;
    }

    if (hasFuel && Number(fuelTotalCost || 0) <= 0) {
      setError("Hai selezionato rifornimento: inserisci il costo totale.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/operations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
        recordDate,
        startKm,
        endKm,
        notes,

        hasFuel,
        fuelLiters,
        fuelTotalCost,
        fuelNotes,

        hasExpense: false,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Errore salvataggio registro operativo.");
      return;
    }

    setEndKm("");
    setNotes("");

    setHasFuel(false);
    setFuelLiters("");
    setFuelTotalCost("");
    setFuelNotes("");

    setSuccess("Giornata salvata correttamente.");

    await loadVehicles(vehicleId);
    await loadRecords();
  }

  useEffect(() => {
    loadVehicles();
    loadRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const kmDone = getKmDone();
  const pricePerLiter = getPricePerLiter();

  return (
    <AppLayout
      title="REGISTRO OPERATIVO"
      subtitle="Km giornalieri e rifornimenti"
    >
      <form
        onSubmit={saveOperation}
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-6"
      >
        <section>
          <h2 className="text-sm font-black tracking-widest text-slate-200 mb-1">
            DATI GIORNATA
          </h2>

          <p className="text-xs text-slate-500">
            Inserisci l’uscita del mezzo. I km partenza sono automatici.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
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

            <Field label="KM PARTENZA">
              <input
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-slate-400"
                value={startKm}
                readOnly
              />
            </Field>

            <Field label="KM ARRIVO">
              <input
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                placeholder="Es. 120150"
                value={endKm}
                onChange={(event) => setEndKm(event.target.value)}
                type="number"
              />
            </Field>

            <Field label="KM FATTI">
              <input
                className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-slate-400"
                value={kmDone > 0 ? formatNumber(kmDone) : "-"}
                readOnly
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="NOTE GIORNATA">
              <input
                className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                placeholder="Note generali della giornata"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </Field>
          </div>
        </section>

        <section className="border-t border-slate-800 pt-5">
          <label className="flex items-center gap-3 text-sm font-black tracking-widest text-slate-200">
            <input
              type="checkbox"
              checked={hasFuel}
              onChange={(event) => setHasFuel(event.target.checked)}
            />
            RIFORNIMENTO EFFETTUATO
          </label>

          {hasFuel && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <Field label="LITRI">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Es. 55.50"
                  value={fuelLiters}
                  onChange={(event) => setFuelLiters(event.target.value)}
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="COSTO TOTALE">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Es. 95.00"
                  value={fuelTotalCost}
                  onChange={(event) => setFuelTotalCost(event.target.value)}
                  type="number"
                  step="0.01"
                />
              </Field>

              <Field label="€/L AUTOMATICO">
                <input
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-slate-400"
                  value={pricePerLiter > 0 ? formatEuro(pricePerLiter) : "-"}
                  readOnly
                />
              </Field>

              <Field label="NOTE RIFORNIMENTO">
                <input
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
                  placeholder="Note carburante"
                  value={fuelNotes}
                  onChange={(event) => setFuelNotes(event.target.value)}
                />
              </Field>
            </div>
          )}
        </section>

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

        <button
          disabled={loading}
          className="bg-sky-700 hover:bg-sky-600 disabled:opacity-50 px-6 py-3 font-black tracking-widest"
        >
          {loading ? "SALVATAGGIO..." : "SALVA GIORNATA"}
        </button>
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
              <th className="text-left p-3">NOTE</th>
            </tr>
          </thead>

          <tbody>
            {records.map((record) => (
              <tr
                key={record.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3">{formatDate(record.recordDate)}</td>
                <td className="p-3 font-bold">{record.vehicle.plate}</td>
                <td className="p-3 text-right">{formatNumber(record.startKm)}</td>
                <td className="p-3 text-right">{formatNumber(record.endKm)}</td>
                <td className="p-3 text-right">{formatNumber(record.kmDone)}</td>
                <td className="p-3">{record.notes || "-"}</td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={6}>
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
    <label className="block w-full">
      <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
        {label}
      </span>

      {children}
    </label>
  );
}