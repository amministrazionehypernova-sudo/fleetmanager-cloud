"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/AppLayout";

type Vehicle = {
  id: string;
  plate: string;
  brand: string | null;
  model: string | null;
  insuranceExpiry: string | null;
  inspectionExpiry: string | null;
  taxExpiry: string | null;
};

type DocumentRenewal = {
  id: string;
  documentType: string;
  renewalDate: string;
  nextExpiryDate: string;
  amount: number;
  supplier: string | null;
  invoiceNumber: string | null;
  notes: string | null;
  vehicle: Vehicle;
};

function todayInputDate() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("it-IT");
}

function formatEuro(value: number) {
  return `€ ${value.toFixed(2)}`;
}

function documentLabel(type: string) {
  if (type === "insurance") return "Assicurazione";
  if (type === "inspection") return "Revisione";
  if (type === "tax") return "Bollo";
  return type;
}

function getCurrentExpiry(vehicle: Vehicle | undefined, type: string) {
  if (!vehicle) return "";

  if (type === "insurance") return vehicle.insuranceExpiry || "";
  if (type === "inspection") return vehicle.inspectionExpiry || "";
  if (type === "tax") return vehicle.taxExpiry || "";

  return "";
}

export default function DocumentRenewalsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [renewals, setRenewals] = useState<DocumentRenewal[]>([]);

  const [vehicleId, setVehicleId] = useState("");
  const [documentType, setDocumentType] = useState("insurance");
  const [renewalDate, setRenewalDate] = useState(todayInputDate());
  const [nextExpiryDate, setNextExpiryDate] = useState("");
  const [amount, setAmount] = useState("");
  const [supplier, setSupplier] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState("all");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("all");
  const [search, setSearch] = useState("");

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
      return;
    }

    const activeVehicleId =
      selectedVehicleId || vehicleId || loadedVehicles[0].id;

    const selected =
      loadedVehicles.find((vehicle) => vehicle.id === activeVehicleId) ||
      loadedVehicles[0];

    setVehicleId(selected.id);
  }

  async function loadRenewals() {
    const response = await fetch("/api/document-renewals");
    const data = await response.json();

    if (response.ok) {
      setRenewals(data.renewals);
    }
  }

  function resetForm() {
    setDocumentType("insurance");
    setRenewalDate(todayInputDate());
    setNextExpiryDate("");
    setAmount("");
    setSupplier("");
    setInvoiceNumber("");
    setNotes("");
  }

  async function saveRenewal(event: React.FormEvent) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!vehicleId) {
      setError("Seleziona un veicolo.");
      return;
    }

    if (!nextExpiryDate) {
      setError("Inserisci la prossima scadenza.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/document-renewals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        vehicleId,
        documentType,
        renewalDate,
        nextExpiryDate,
        amount,
        supplier,
        invoiceNumber,
        notes,
      }),
    });

    const data = await response.json();

    setLoading(false);

    if (!response.ok) {
      setError(data.error || "Errore salvataggio rinnovo.");
      return;
    }

    resetForm();
    setSuccess(
      "Rinnovo salvato. La scadenza del veicolo è stata aggiornata automaticamente."
    );

    await loadVehicles(vehicleId);
    await loadRenewals();
  }

  useEffect(() => {
    loadVehicles();
    loadRenewals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === vehicleId);
  const currentExpiry = getCurrentExpiry(selectedVehicle, documentType);

  const filteredRenewals = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return renewals.filter((renewal) => {
      const vehicleMatch =
        selectedVehicleFilter === "all" ||
        renewal.vehicle.id === selectedVehicleFilter;

      const typeMatch =
        selectedTypeFilter === "all" ||
        renewal.documentType === selectedTypeFilter;

      const text = [
        renewal.vehicle.plate,
        renewal.vehicle.brand,
        renewal.vehicle.model,
        documentLabel(renewal.documentType),
        renewal.supplier,
        renewal.invoiceNumber,
        renewal.notes,
        renewal.amount,
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch = !searchValue || text.includes(searchValue);

      return vehicleMatch && typeMatch && searchMatch;
    });
  }, [renewals, selectedVehicleFilter, selectedTypeFilter, search]);

  const totalAmount = filteredRenewals.reduce(
    (sum, renewal) => sum + renewal.amount,
    0
  );

  return (
    <AppLayout
      title="RINNOVI DOCUMENTI"
      subtitle="Assicurazione, revisione e bollo con aggiornamento automatico scadenze"
    >
      <form
        onSubmit={saveRenewal}
        className="border border-slate-800 bg-slate-900/70 p-5 mb-8 space-y-5"
      >
        <div>
          <h2 className="text-sm font-black tracking-widest text-slate-200">
            NUOVO RINNOVO
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Quando salvi un rinnovo, la nuova scadenza viene aggiornata automaticamente nella scheda veicolo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Field label="TIPO DOCUMENTO">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={documentType}
              onChange={(event) => setDocumentType(event.target.value)}
            >
              <option value="insurance">Assicurazione</option>
              <option value="inspection">Revisione</option>
              <option value="tax">Bollo</option>
            </select>
          </Field>

          <Field label="SCADENZA ATTUALE">
            <input
              className="w-full bg-slate-900 border border-slate-700 px-3 py-2 text-slate-400"
              value={currentExpiry ? formatDate(currentExpiry) : "-"}
              readOnly
            />
          </Field>

          <Field label="DATA RINNOVO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={renewalDate}
              onChange={(event) => setRenewalDate(event.target.value)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Field label="PROSSIMA SCADENZA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              type="date"
              value={nextExpiryDate}
              onChange={(event) => setNextExpiryDate(event.target.value)}
            />
          </Field>

          <Field label="IMPORTO PAGATO">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. 650.00"
              type="number"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </Field>

          <Field label="FORNITORE / ENTE">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Es. Agenzia / Assicurazione"
              value={supplier}
              onChange={(event) => setSupplier(event.target.value)}
            />
          </Field>

          <Field label="NUMERO FATTURA / RICEVUTA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Opzionale"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </Field>
        </div>

        <Field label="NOTE">
          <input
            className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
            placeholder="Note rinnovo"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </Field>

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
          {loading ? "SALVATAGGIO..." : "SALVA RINNOVO"}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="RINNOVI FILTRATI"
          value={filteredRenewals.length}
          caption="storico documenti"
        />

        <MetricCard
          label="IMPORTO TOTALE"
          value={formatEuro(totalAmount)}
          caption="sui risultati filtrati"
        />

        <MetricCard
          label="DOCUMENTI"
          value="3"
          caption="assicurazione / revisione / bollo"
        />
      </div>

      <div className="border border-slate-800 bg-slate-900/70 p-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="FILTRO MEZZO">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={selectedVehicleFilter}
              onChange={(event) => setSelectedVehicleFilter(event.target.value)}
            >
              <option value="all">Tutti i mezzi</option>

              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand || ""} {vehicle.model || ""}
                </option>
              ))}
            </select>
          </Field>

          <Field label="FILTRO DOCUMENTO">
            <select
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              value={selectedTypeFilter}
              onChange={(event) => setSelectedTypeFilter(event.target.value)}
            >
              <option value="all">Tutti i documenti</option>
              <option value="insurance">Assicurazione</option>
              <option value="inspection">Revisione</option>
              <option value="tax">Bollo</option>
            </select>
          </Field>

          <Field label="CERCA">
            <input
              className="w-full bg-slate-950 border border-slate-700 px-3 py-2"
              placeholder="Targa, fornitore, fattura, note..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="border border-slate-800 bg-slate-900/70 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="text-left p-3">DATA RINNOVO</th>
              <th className="text-left p-3">MEZZO</th>
              <th className="text-left p-3">DOCUMENTO</th>
              <th className="text-left p-3">NUOVA SCADENZA</th>
              <th className="text-right p-3">IMPORTO</th>
              <th className="text-left p-3">FORNITORE</th>
              <th className="text-left p-3">FATTURA</th>
              <th className="text-left p-3">NOTE</th>
            </tr>
          </thead>

          <tbody>
            {filteredRenewals.map((renewal) => (
              <tr
                key={renewal.id}
                className="border-t border-slate-800 hover:bg-slate-800/50"
              >
                <td className="p-3">
                  {formatDate(renewal.renewalDate)}
                </td>

                <td className="p-3 font-bold">
                  {renewal.vehicle.plate}
                  <span className="block text-xs font-normal text-slate-500">
                    {renewal.vehicle.brand || ""} {renewal.vehicle.model || ""}
                  </span>
                </td>

                <td className="p-3">
                  {documentLabel(renewal.documentType)}
                </td>

                <td className="p-3">
                  {formatDate(renewal.nextExpiryDate)}
                </td>

                <td className="p-3 text-right">
                  {formatEuro(renewal.amount)}
                </td>

                <td className="p-3">
                  {renewal.supplier || "-"}
                </td>

                <td className="p-3">
                  {renewal.invoiceNumber || "-"}
                </td>

                <td className="p-3">
                  {renewal.notes || "-"}
                </td>
              </tr>
            ))}

            {filteredRenewals.length === 0 && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={8}>
                  Nessun rinnovo documento registrato.
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