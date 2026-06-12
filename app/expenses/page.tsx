"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
};

type Expense = {
  id: string;
  expenseDate: string;
  kmValue: number;
  category: string | null;
  supplier: string | null;
  amount: number;
  invoiceNumber: string | null;
  notes: string | null;
  nextDueKm: number | null;
  vehicle: Vehicle | null;
};

function formatDate(value: string) {
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

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateDaysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

function currentYearStart() {
  const now = new Date();
  return new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  async function loadExpenses() {
    setError("");

    const response = await fetch("/api/expenses");
    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Errore caricamento interventi.");
      return;
    }

    setExpenses(data.expenses || []);
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  const vehicles = useMemo(() => {
    const map = new Map<string, Vehicle>();

    expenses.forEach((expense) => {
      if (expense.vehicle) {
        map.set(expense.vehicle.id, expense.vehicle);
      }
    });

    return Array.from(map.values());
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return expenses.filter((expense) => {
      const vehicleId = expense.vehicle?.id || "";

      const vehicleMatch =
        selectedVehicle === "all" || vehicleId === selectedVehicle;

      const expenseDate = new Date(expense.expenseDate);

      const fromDate = startDate ? new Date(startDate) : null;
      const toDate = endDate ? new Date(endDate) : null;

      if (fromDate) {
        fromDate.setHours(0, 0, 0, 0);
      }

      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
      }

      const dateMatch =
        (!fromDate || expenseDate >= fromDate) &&
        (!toDate || expenseDate <= toDate);

      const text = [
        expense.vehicle?.plate,
        expense.vehicle?.brand,
        expense.vehicle?.model,
        expense.category,
        expense.supplier,
        expense.invoiceNumber,
        expense.notes,
        expense.amount,
        expense.nextDueKm,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = !searchValue || text.includes(searchValue);

      return vehicleMatch && dateMatch && searchMatch;
    });
  }, [expenses, selectedVehicle, startDate, endDate, search]);

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );

  const averageAmount =
    filteredExpenses.length > 0 ? totalAmount / filteredExpenses.length : 0;

  function resetFilters() {
    setSelectedVehicle("all");
    setStartDate("");
    setEndDate("");
    setSearch("");
  }

  function setToday() {
    const today = todayDate();
    setStartDate(today);
    setEndDate(today);
  }

  function setLast7Days() {
    setStartDate(dateDaysAgo(7));
    setEndDate(todayDate());
  }

  function setLast30Days() {
    setStartDate(dateDaysAgo(30));
    setEndDate(todayDate());
  }

  function setThisYear() {
    setStartDate(currentYearStart());
    setEndDate(todayDate());
  }

  return (
    <AppLayout
      title="INTERVENTI"
      subtitle="Storico manutenzioni registrate dal Registro Operativo"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="INTERVENTI"
          value={filteredExpenses.length}
          caption="risultati filtrati"
        />

        <MetricCard
          label="COSTO TOTALE"
          value={formatEuro(totalAmount)}
          caption="spesa manutenzioni"
        />

        <MetricCard
          label="MEDIA INTERVENTO"
          value={formatEuro(averageAmount)}
          caption="costo medio"
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
              value={selectedVehicle}
              onChange={(event) => setSelectedVehicle(event.target.value)}
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
              placeholder="Lavoro, fornitore, fattura, note..."
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
            onClick={setThisYear}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            ANNO CORRENTE
          </button>

          <button
            type="button"
            onClick={resetFilters}
            className="border border-slate-700 hover:bg-slate-800 px-4 py-2 text-sm font-black"
          >
            PULISCI FILTRI
          </button>
        </div>
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
              <th className="text-left p-3 min-w-[320px]">LAVORI EFFETTUATI</th>
              <th className="text-right p-3">IMPORTO</th>
              <th className="text-left p-3">FORNITORE</th>
              <th className="text-left p-3">FATTURA</th>
              <th className="text-right p-3">PROSSIMO KM</th>
              <th className="text-left p-3 min-w-[260px]">NOTE</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-t border-slate-800 hover:bg-slate-800/50 align-top"
              >
                <td className="p-3">
                  {formatDate(expense.expenseDate)}
                </td>

                <td className="p-3 font-bold">
                  {expense.vehicle?.plate || "-"}
                  <span className="block text-xs font-normal text-slate-500">
                    {expense.vehicle?.brand || ""} {expense.vehicle?.model || ""}
                  </span>
                </td>

                <td className="p-3 text-right">
                  {formatKm(expense.kmValue)}
                </td>

                <td className="p-3 min-w-[320px]">
                  <div className="font-bold text-slate-100 leading-relaxed whitespace-normal">
                    {expense.category || "-"}
                  </div>
                </td>

                <td className="p-3 text-right">
                  {formatEuro(expense.amount)}
                </td>

                <td className="p-3">
                  {expense.supplier || "-"}
                </td>

                <td className="p-3">
                  {expense.invoiceNumber || "-"}
                </td>

                <td className="p-3 text-right">
                  {expense.nextDueKm ? formatKm(expense.nextDueKm) : "-"}
                </td>

                <td className="p-3 min-w-[260px]">
                  {expense.notes || "-"}
                </td>
              </tr>
            ))}

            {filteredExpenses.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={9}>
                  Nessun intervento trovato.
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
