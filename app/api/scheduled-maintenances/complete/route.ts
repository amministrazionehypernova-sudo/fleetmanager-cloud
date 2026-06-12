import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const maintenanceId = String(body.maintenanceId || "");
    const amount = Number(body.amount || 0);
    const supplier = String(body.supplier || "");
    const invoiceNumber = String(body.invoiceNumber || "");
    const notes = String(body.notes || "");

    if (!maintenanceId) {
      return NextResponse.json(
        {
          error: "Maintenance ID mancante.",
        },
        {
          status: 400,
        }
      );
    }

    const maintenance =
      await prisma.scheduledMaintenance.findUnique({
        where: {
          id: maintenanceId,
        },
      });

    if (!maintenance) {
      return NextResponse.json(
        {
          error: "Manutenzione non trovata.",
        },
        {
          status: 404,
        }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        companyId: DEMO_COMPANY_ID,
        vehicleId: maintenance.vehicleId,

        expenseDate: new Date(),

        kmValue: maintenance.dueKm || 0,

        category: maintenance.title,

        supplier,

        amount,

        invoiceNumber,

        notes:
          notes ||
          `Completata manutenzione programmata: ${maintenance.title}`,

        warningDays: 30,
        warningKm: 1000,
      },
    });

    await prisma.scheduledMaintenance.update({
      where: {
        id: maintenance.id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
        completedExpenseId: expense.id,
      },
    });
    if (maintenance.dueType === "km" && maintenance.dueKm) {
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: maintenance.vehicleId,
    },
  });

  if (vehicle?.serviceDueKm === maintenance.dueKm) {
    await prisma.vehicle.update({
      where: {
        id: maintenance.vehicleId,
      },
      data: {
        serviceDueKm: null,
        serviceDueDescription: null,
      },
    });
  }
}

    return NextResponse.json({
      success: true,
      expenseId: expense.id,
    });
  } catch (error) {
    console.error("COMPLETE MAINTENANCE ERROR:", error);

    return NextResponse.json(
      {
        error: "Errore completamento manutenzione.",
      },
      {
        status: 500,
      }
    );
  }
}