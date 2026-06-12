"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import Link from "next/link";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  currentKm: number;
  status: string;
  insuranceExpiry: string | null;
  inspectionExpiry: string | null;
  taxExpiry: string | null;
  serviceDueKm: number | null;
};

function formatDateForInput(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatDateForTable(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [currentKm, setCurrentKm] = useState("");

  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [inspectionExpiry, setInspectionExpiry] = useState("");
  const [taxExpiry, setTaxExpiry] = useState("");
  const [serviceDueKm, setServiceDueKm] = useState("");

  const [error, setError] = useState("");

  async function loadVehicles() {
    const response = await fetch("/api/vehicles");
    const data = await response.json();

    if (response.ok) {
      setVehicles(data.vehicles);
    }
  }

  function resetForm() {
    setEditingId(null);
    setPlate("");
    setBrand("");
    setModel("");
    setCurrentKm("");
    setInsuranceExpiry("");
    setInspectionExpiry("");
    setTaxExpiry("");
    setServiceDueKm("");
    setError("");
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setPlate(vehicle.plate || "");
    setBrand(vehicle.brand || "");
    setModel(vehicle.model || "");
    setCurrentKm(String(vehicle.currentKm || 0));
    setInsuranceExpiry(formatDateForInput(vehicle.insuranceExpiry));
    setInspectionExpiry(formatDateForInput(vehicle.inspectionExpiry));
    setTaxExpiry(formatDateForInput(vehicle.taxExpiry));
    setServiceDueKm(vehicle.serviceDueKm ? String(vehicle.serviceDueKm) : "");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveVehicle(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const method = editingId ? "PATCH" : "POST";

    const response = await fetch("/api/vehicles", {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingId,
        plate,
        brand,
        model,
        currentKm,
        insuranceExpiry,
        inspectionExpiry,
        taxExpiry,
        serviceDueKm,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore salvataggio veicolo.");
      return;
    }

    resetForm();
    await loadVehicles();
  }

  async function archiveVehicle(vehicle: Vehicle) {
    const confirmArchive = window.confirm(
      `Vuoi archiviare il veicolo ${vehicle.plate}?`
    );

    if (!confirmArchive) return;

    const response = await fetch("/api/vehicles", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: vehicle.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore archiviazione veicolo.");
      return;
    }

    if (editingId === vehicle.id) {
      resetForm();
    }

    await loadVehicles();
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  return (
    <AppLayout
      title="VEICOLI"
      subtitle="Gestione mezzi, scadenze documentali e tagliandi a km"
    >
      <form
        onSubmit={saveVehicle}
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black tracking-widest text-slate-200">
              {editingId ? "MODIFICA VEICOLO" : "NUOVO VEICOLO"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Le scadenze inserite qui alimentano automaticamente Dashboard e pagina Scadenze.
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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="TARGA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. AB123CD"
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
            />
          </Field>

          <Field label="MARCA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. FIAT"
              value={brand}
              onChange={(event) => setBrand(event.target.value)}
            />
          </Field>

          <Field label="MODELLO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. Ducato"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
          </Field>

          <Field label="KM ATTUALI">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. 120000"
              value={currentKm}
              onChange={(event) => setCurrentKm(event.target.value)}
              type="number"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="SCADENZA ASSICURAZIONE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={insuranceExpiry}
              onChange={(event) => setInsuranceExpiry(event.target.value)}
            />
          </Field>

          <Field label="SCADENZA REVISIONE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={inspectionExpiry}
              onChange={(event) => setInspectionExpiry(event.target.value)}
            />
          </Field>

          <Field label="SCADENZA BOLLO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={taxExpiry}
              onChange={(event) => setTaxExpiry(event.target.value)}
            />
          </Field>

          <Field label="KM PROSSIMO TAGLIANDO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. 150000"
              value={serviceDueKm}
              onChange={(event) => setServiceDueKm(event.target.value)}
              type="number"
            />
          </Field>
        </div>

        {error && (
          <div className="border border-red-900 bg-red-950/40 text-red-200 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button className="bg-sky-700 hover:bg-sky-600 px-5 py-3 font-black tracking-widest">
          {editingId ? "SALVA MODIFICHE" : "+ CREA VEICOLO"}
        </button>
      </form>

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3 min-w-[220px]">TARGA / AZIONI</th>
<th className="text-left p-3">MARCA</th>
<th className="text-left p-3">MODELLO</th>
<th className="text-right p-3">KM</th>
<th className="text-left p-3">ASSICURAZIONE</th>
<th className="text-left p-3">REVISIONE</th>
<th className="text-left p-3">BOLLO</th>
<th className="text-right p-3">TAGLIANDO KM</th>
              
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3 min-w-[220px]">
  <div className="font-bold mb-2">
    {vehicle.plate}
  </div>

  <div className="flex flex-wrap gap-2">
    <Link
      href={`/vehicles/${vehicle.id}`}
      className="border border-emerald-800 text-emerald-300 hover:bg-emerald-950 px-2 py-1 text-[11px] font-black"
    >
      SCHEDA
    </Link>

    <button
      type="button"
      onClick={() => startEdit(vehicle)}
      className="border border-sky-800 text-sky-300 hover:bg-sky-950 px-2 py-1 text-[11px] font-black"
    >
      MODIFICA
    </button>

    <button
      type="button"
      onClick={() => archiveVehicle(vehicle)}
      className="border border-red-900 text-red-300 hover:bg-red-950 px-2 py-1 text-[11px] font-black"
    >
      ARCHIVIA
    </button>
  </div>
</td>
                <td className="p-3">{vehicle.brand || "-"}</td>
                <td className="p-3">{vehicle.model || "-"}</td>
                <td className="p-3 text-right">{vehicle.currentKm}</td>
                <td className="p-3">{formatDateForTable(vehicle.insuranceExpiry)}</td>
                <td className="p-3">{formatDateForTable(vehicle.inspectionExpiry)}</td>
                <td className="p-3">{formatDateForTable(vehicle.taxExpiry)}</td>
                <td className="p-3 text-right">{vehicle.serviceDueKm || "-"}</td>
               
              </tr>
            ))}

            {vehicles.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={8}>
                  Nessun veicolo registrato.
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