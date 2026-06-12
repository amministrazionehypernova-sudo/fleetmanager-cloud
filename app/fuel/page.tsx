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

type FuelRecord = {
  id: string;
  fuelDate: string;
  kmValue: number;
  liters: number;
  totalCost: number;
  pricePerLiter: number;
  notes: string | null;
  vehicle: Vehicle;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("it-IT");
}

function formatKm(value: number) {
  return value.toLocaleString("it-IT", {
    maximumFractionDigits: 0,
  });
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function formatEuro(value: number) {
  return `€ ${value.toFixed(2)}`;
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

function getDateMonthsAgo(months: number) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().slice(0, 10);
}

export default function FuelPage() {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [selectedVehicleId, setSelectedVehicleId] = useState("all");
  const [startDate, setStartDate] = useState(getDateMonthsAgo(1));
  const [endDate, setEndDate] = useState(getTodayDate());
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadVehicles() {
    const response = await fetch("/api/vehicles");
    const data = await response.json();

    if (response.ok) {
      setVehicles(data.vehicles);
    }
  }

  async function loadRecords() {
    setError("");

    const response = await fetch("/api/fuel-records");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore caricamento rifornimenti.");
      return;
    }

    setRecords(data.records);
  }

  useEffect(() => {
    loadVehicles();
    loadRecords();
  }, []);

  const filteredRecords = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return records.filter((record) => {
      const vehicleMatch =
        selectedVehicleId === "all" ||
        record.vehicle.id === selectedVehicleId;

      const recordDate = new Date(record.fuelDate);
      const fromDate = startDate ? new Date(startDate) : null;
      const toDate = endDate ? new Date(endDate) : null;

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
      }

      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      const dateMatch =
        (!fromDate || recordDate >= fromDate) &&
        (!toDate || recordDate <= toDate);

      const text = [
        record.vehicle.plate,
        record.vehicle.brand,
        record.vehicle.model,
        record.fuelDate,
        record.kmValue,
        record.liters,
        record.totalCost,
        record.pricePerLiter,
        record.notes,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = !searchValue || text.includes(searchValue);

      return vehicleMatch && dateMatch && searchMatch;
    });
  }, [records, selectedVehicleId, startDate, endDate, search]);

  const totalLiters = filteredRecords.reduce(
    (sum, record) => sum + record.liters,
    0
  );

  const totalCost = filteredRecords.reduce(
    (sum, record) => sum + record.totalCost,
    0
  );

  const averagePricePerLiter =
    totalLiters > 0 ? totalCost / totalLiters : 0;

  function clearFilters() {
    setSelectedVehicleId("all");
    setStartDate(getDateMonthsAgo(1));
    setEndDate(getTodayDate());
    setSearch("");
  }

  function setToday() {
    const today = getTodayDate();
    setStartDate(today);
    setEndDate(today);
  }

  function setLast7Days() {
    const date = new Date();
    date.setDate(date.getDate() - 7);

    setStartDate(date.toISOString().slice(0, 10));
    setEndDate(getTodayDate());
  }

  function setLast30Days() {
    const date = new Date();
    date.setDate(date.getDate() - 30);

    setStartDate(date.toISOString().slice(0, 10));
    setEndDate(getTodayDate());
  }

  function setCurrentYear() {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 1);

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(getTodayDate());
  }

  return (
    <AppLayout
      title="RIFORNIMENTI"
      subtitle="Storico carburante registrato dal Registro Operativo"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="LITRI TOTALI"
          value={`${formatDecimal(totalLiters)} L`}
          caption="sui risultati filtrati"
        />

        <MetricCard
          label="COSTO TOTALE"
          value={formatEuro(totalCost)}
          caption="spesa carburante filtrata"
        />

        <MetricCard
          label="MEDIA €/L"
          value={formatEuro(averagePricePerLiter)}
          caption="prezzo medio carburante"
        />
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              MEZZO
            </span>

            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={selectedVehicleId}
              onChange={(event) => setSelectedVehicleId(event.target.value)}
            >
              <option value="all">Tutti i mezzi</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand || ""} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              DATA INIZIO
            </span>

            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              DATA FINE
            </span>

            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-black tracking-widest text-slate-500 mb-2">
              CERCA
            </span>

            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Targa, marca, note..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={setToday}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            OGGI
          </button>

          <button
            type="button"
            onClick={setLast7Days}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            ULTIMI 7 GIORNI
          </button>

          <button
            type="button"
            onClick={setLast30Days}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            ULTIMI 30 GIORNI
          </button>

          <button
            type="button"
            onClick={setCurrentYear}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            ANNO CORRENTE
          </button>

          <button
            type="button"
            onClick={clearFilters}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            PULISCI FILTRI
          </button>
        </div>

        <p className="text-xs text-slate-500">
          I rifornimenti si inseriscono dal Registro Operativo. Questa pagina serve per storico,
          controllo e futuri report PDF/Excel filtrati per mezzo e periodo.
        </p>
      </div>

      {error && (
        <div className="border border-red-900 bg-red-950/40 text-red-200 px-4 py-3 text-sm mb-8">
          {error}
        </div>
      )}

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3">DATA</th>
              <th className="text-left p-3">MEZZO</th>
              <th className="text-right p-3">KM</th>
              <th className="text-right p-3">LITRI</th>
              <th className="text-right p-3">COSTO</th>
              <th className="text-right p-3">€/L</th>
              <th className="text-left p-3">NOTE</th>
            </tr>
          </thead>

          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3">
                  {formatDate(record.fuelDate)}
                </td>

                <td className="p-3 font-bold">
                  {record.vehicle.plate}
                  <span className="block text-xs font-normal text-slate-500">
                    {record.vehicle.brand || ""} {record.vehicle.model || ""}
                  </span>
                </td>

                <td className="p-3 text-right">
                  {formatKm(record.kmValue)}
                </td>

                <td className="p-3 text-right">
                  {formatDecimal(record.liters)}
                </td>

                <td className="p-3 text-right">
                  {formatEuro(record.totalCost)}
                </td>

                <td className="p-3 text-right">
                  {formatEuro(record.pricePerLiter)}
                </td>

                <td className="p-3">
                  {record.notes || "-"}
                </td>
              </tr>
            ))}

            {filteredRecords.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={7}>
                  Nessun rifornimento trovato nel periodo selezionato.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}

function MetricCard({
  label,
  value,
  caption,
}: {
  label: string | number;
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