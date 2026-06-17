import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

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

function formatVehicle(vehicle: {
  plate: string;
  brand: string | null;
  model: string | null;
}) {
  return `${vehicle.plate} ${vehicle.brand || ""} ${vehicle.model || ""}`.trim();
}

export async function GET(request: Request) {
  const session = await requireSession();
  const companyId = session.companyId;
  
  const { searchParams } = new URL(request.url);

  const vehicleId = searchParams.get("vehicleId") || "all";
  const fromInput = searchParams.get("from") || monthStartInputDate();
  const toInput = searchParams.get("to") || todayInputDate();

  const fromDate = toStartDate(fromInput);
  const toDate = toEndDate(toInput);

  const vehicleFilter =
    vehicleId === "all"
      ? {}
      : {
          vehicleId,
        };

  const [vehicles, dailyRecords, fuelRecords, expenses, documentRenewals] =
    await Promise.all([
      prisma.vehicle.findMany({
        where: {
          companyId,
        },
        orderBy: {
          plate: "asc",
        },
      }),

      prisma.dailyRecord.findMany({
        where: {
          companyId,
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
      }),

      prisma.fuelRecord.findMany({
        where: {
          companyId,
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
      }),

      prisma.expense.findMany({
        where: {
          companyId,
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
      }),

      prisma.documentRenewal.findMany({
        where: {
          companyId,
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
      }),
    ]);

  const selectedVehicleLabel =
    vehicleId === "all"
      ? "Tutti i veicoli"
      : vehicles.find((vehicle) => vehicle.id === vehicleId)?.plate ||
        "Veicolo selezionato";

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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "FleetManagerPro";
  workbook.created = new Date();

  const summary = workbook.addWorksheet("Riepilogo");

  summary.columns = [
    { header: "Voce", key: "label", width: 32 },
    { header: "Valore", key: "value", width: 28 },
  ];

  summary.addRows([
    { label: "Veicolo", value: selectedVehicleLabel },
    { label: "Dal", value: fromInput },
    { label: "Al", value: toInput },
    { label: "Km percorsi", value: totalKm },
    { label: "Litri carburante", value: totalLiters },
    { label: "Costo carburante", value: totalFuelCost },
    { label: "Costo interventi", value: totalExpensesCost },
    { label: "Costo documenti", value: totalDocumentsCost },
    { label: "Costo totale", value: totalCost },
    { label: "Costo/km", value: costPerKm },
    { label: "Km/l medio", value: kmPerLiter },
    { label: "Rifornimenti", value: fuelRecords.length },
    { label: "Interventi", value: expenses.length },
    { label: "Rinnovi documenti", value: documentRenewals.length },
    { label: "Giornate registrate", value: dailyRecords.length },
  ]);

  const fuelsSheet = workbook.addWorksheet("Rifornimenti");
  fuelsSheet.columns = [
    { header: "Data", key: "date", width: 16 },
    { header: "Mezzo", key: "vehicle", width: 24 },
    { header: "Km", key: "km", width: 12 },
    { header: "Litri", key: "liters", width: 12 },
    { header: "Totale", key: "total", width: 14 },
    { header: "Prezzo/L", key: "pricePerLiter", width: 14 },
    { header: "Note", key: "notes", width: 40 },
  ];

  fuelRecords.forEach((record) => {
    fuelsSheet.addRow({
      date: record.fuelDate.toISOString().slice(0, 10),
      vehicle: formatVehicle(record.vehicle),
      km: record.kmValue,
      liters: record.liters,
      total: record.totalCost,
      pricePerLiter: record.pricePerLiter,
      notes: record.notes || "",
    });
  });

  const expensesSheet = workbook.addWorksheet("Interventi");
  expensesSheet.columns = [
    { header: "Data", key: "date", width: 16 },
    { header: "Mezzo", key: "vehicle", width: 24 },
    { header: "Km", key: "km", width: 12 },
    { header: "Intervento", key: "category", width: 42 },
    { header: "Fornitore", key: "supplier", width: 24 },
    { header: "Fattura", key: "invoice", width: 18 },
    { header: "Importo", key: "amount", width: 14 },
    { header: "Note", key: "notes", width: 40 },
  ];

  expenses.forEach((expense) => {
    expensesSheet.addRow({
      date: expense.expenseDate.toISOString().slice(0, 10),
      vehicle: formatVehicle(expense.vehicle),
      km: expense.kmValue,
      category: expense.category || "",
      supplier: expense.supplier || "",
      invoice: expense.invoiceNumber || "",
      amount: expense.amount,
      notes: expense.notes || "",
    });
  });

  const documentsSheet = workbook.addWorksheet("Documenti");
  documentsSheet.columns = [
    { header: "Data rinnovo", key: "renewalDate", width: 16 },
    { header: "Mezzo", key: "vehicle", width: 24 },
    { header: "Documento", key: "documentType", width: 20 },
    { header: "Prossima scadenza", key: "nextExpiryDate", width: 18 },
    { header: "Importo", key: "amount", width: 14 },
    { header: "Fornitore", key: "supplier", width: 24 },
    { header: "Fattura", key: "invoice", width: 18 },
    { header: "Note", key: "notes", width: 40 },
  ];

  documentRenewals.forEach((renewal) => {
    documentsSheet.addRow({
      renewalDate: renewal.renewalDate.toISOString().slice(0, 10),
      vehicle: formatVehicle(renewal.vehicle),
      documentType: renewal.documentType,
      nextExpiryDate: renewal.nextExpiryDate.toISOString().slice(0, 10),
      amount: renewal.amount,
      supplier: renewal.supplier || "",
      invoice: renewal.invoiceNumber || "",
      notes: renewal.notes || "",
    });
  });

  const operationsSheet = workbook.addWorksheet("Registro Operativo");
  operationsSheet.columns = [
    { header: "Data", key: "date", width: 16 },
    { header: "Mezzo", key: "vehicle", width: 24 },
    { header: "Km partenza", key: "startKm", width: 14 },
    { header: "Km arrivo", key: "endKm", width: 14 },
    { header: "Km fatti", key: "kmDone", width: 14 },
    { header: "Note", key: "notes", width: 40 },
  ];

  dailyRecords.forEach((record) => {
    operationsSheet.addRow({
      date: record.recordDate.toISOString().slice(0, 10),
      vehicle: formatVehicle(record.vehicle),
      startKm: record.startKm,
      endKm: record.endKm,
      kmDone: record.kmDone,
      notes: record.notes || "",
    });
  });

  workbook.worksheets.forEach((sheet) => {
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).height = 22;

    sheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.alignment = {
          vertical: "middle",
          horizontal: "left",
          wrapText: true,
        };
      });
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fleetmanager-report-${fromInput}-${toInput}.xlsx"`,
    },
  });
}