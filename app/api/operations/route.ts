import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

function toNumberOrZero(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
}

function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

export async function GET() {
  try {
    const records = await prisma.dailyRecord.findMany({
      where: {
        companyId: DEMO_COMPANY_ID,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        recordDate: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("OPERATIONS GET ERROR:", error);

    return NextResponse.json(
      { error: "Errore caricamento registro operativo." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const vehicleId = String(body.vehicleId || "");
    const recordDate = String(body.recordDate || "");

    const startKm = toNumberOrZero(body.startKm);
    const endKm = toNumberOrZero(body.endKm);
    const notes = String(body.notes || "").trim();

    const hasFuel = Boolean(body.hasFuel);
    const fuelLiters = toNumberOrZero(body.fuelLiters);
    const fuelTotalCost = toNumberOrZero(body.fuelTotalCost);
    const fuelNotes = String(body.fuelNotes || "").trim();

    const hasExpense = Boolean(body.hasExpense);

    const selectedWorks = Array.isArray(body.workItemIds)
      ? body.workItemIds.map((item: unknown) => String(item).trim()).filter(Boolean)
      : [];

    const expenseCategory = String(body.expenseCategory || "").trim();
    const expenseSupplier = String(body.expenseSupplier || "").trim();
    const expenseAmount = toNumberOrZero(body.expenseAmount);
    const expenseInvoiceNumber = String(body.expenseInvoiceNumber || "").trim();
    const expenseNotes = String(body.expenseNotes || "").trim();
    const nextDueKm = toNumberOrNull(body.nextDueKm);

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Seleziona un veicolo." },
        { status: 400 }
      );
    }

    if (!recordDate) {
      return NextResponse.json(
        { error: "Inserisci la data." },
        { status: 400 }
      );
    }

    if (endKm <= startKm) {
      return NextResponse.json(
        { error: "I km di arrivo devono essere superiori ai km di partenza." },
        { status: 400 }
      );
    }

    if (hasFuel && fuelLiters <= 0) {
      return NextResponse.json(
        { error: "Hai selezionato rifornimento: inserisci litri validi." },
        { status: 400 }
      );
    }

    if (hasFuel && fuelTotalCost <= 0) {
      return NextResponse.json(
        { error: "Hai selezionato rifornimento: inserisci costo carburante valido." },
        { status: 400 }
      );
    }

    if (hasExpense && selectedWorks.length === 0 && !expenseCategory) {
      return NextResponse.json(
        { error: "Hai selezionato intervento: scegli almeno un lavoro o inserisci una categoria." },
        { status: 400 }
      );
    }

    const kmDone = endKm - startKm;

    const result = await prisma.$transaction(async (tx) => {
      const dailyRecord = await tx.dailyRecord.create({
        data: {
          companyId: DEMO_COMPANY_ID,
          vehicleId,
          recordDate: new Date(recordDate),
          startKm,
          endKm,
          kmDone,
          liters: 0,
          fuelCost: 0,
          costPerKm: 0,
          kmPerLiter: 0,
          notes,
        },
      });

      await tx.vehicle.update({
        where: {
          id: vehicleId,
        },
        data: {
          currentKm: endKm,
        },
      });

      let fuelRecord = null;

      if (hasFuel) {
        fuelRecord = await tx.fuelRecord.create({
          data: {
            companyId: DEMO_COMPANY_ID,
            vehicleId,
            fuelDate: new Date(recordDate),
            kmValue: endKm,
            liters: fuelLiters,
            totalCost: fuelTotalCost,
            pricePerLiter: fuelTotalCost / fuelLiters,
            notes: fuelNotes,
          },
        });
      }

      let expense = null;
      let scheduledMaintenance = null;

      if (hasExpense) {
        const worksText = selectedWorks.join(", ");

        const finalCategory =
          selectedWorks.length > 0 ? worksText : expenseCategory;

        const finalNotes = [
          expenseCategory && selectedWorks.length > 0
            ? `Categoria personalizzata: ${expenseCategory}`
            : "",
          expenseNotes,
        ]
          .filter(Boolean)
          .join(" | ");

        expense = await tx.expense.create({
          data: {
            companyId: DEMO_COMPANY_ID,
            vehicleId,
            expenseDate: new Date(recordDate),
            kmValue: endKm,
            category: finalCategory,
            supplier: expenseSupplier,
            amount: expenseAmount,
            invoiceNumber: expenseInvoiceNumber,
            notes: finalNotes,
            nextDueKm,
          },
        });

        if (nextDueKm) {
          await tx.vehicle.update({
            where: {
              id: vehicleId,
            },
            data: {
              serviceDueKm: nextDueKm,
              serviceDueDescription: finalCategory,
            },
          });

          scheduledMaintenance = await tx.scheduledMaintenance.create({
            data: {
              companyId: DEMO_COMPANY_ID,
              vehicleId,
              title: expenseCategory || "Tagliando / Manutenzione",
              worksText: finalCategory,
              workItemsJson: JSON.stringify(selectedWorks),
              dueType: "km",
              dueKm: nextDueKm,
              warningKm: 1000,
              warningDays: 30,
              status: "active",
              notes: "Creata automaticamente dal Registro Operativo",
            },
          });
        }
      }

      return {
        dailyRecord,
        fuelRecord,
        expense,
        scheduledMaintenance,
      };
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error("OPERATIONS POST ERROR:", error);

    return NextResponse.json(
      { error: "Errore salvataggio registro operativo." },
      { status: 500 }
    );
  }
}