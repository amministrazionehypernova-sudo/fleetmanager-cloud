import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const companyId = session.companyId;

    const body = await request.json();

    const maintenanceId = String(body.maintenanceId || "");
    const amount = Number(body.amount || 0);
    const supplier = String(body.supplier || "");
    const invoiceNumber = String(body.invoiceNumber || "");
    const notes = String(body.notes || "");

    if (!maintenanceId) {
      return NextResponse.json(
        { error: "Maintenance ID mancante." },
        { status: 400 }
      );
    }

    const maintenance = await prisma.scheduledMaintenance.findFirst({
      where: {
        id: maintenanceId,
        companyId,
        status: "active",
      },
    });

    if (!maintenance) {
      return NextResponse.json(
        { error: "Manutenzione non trovata o non autorizzata." },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const expense = await tx.expense.create({
        data: {
          companyId,
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

      await tx.scheduledMaintenance.update({
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
        const vehicle = await tx.vehicle.findFirst({
          where: {
            id: maintenance.vehicleId,
            companyId,
          },
        });

        if (vehicle?.serviceDueKm === maintenance.dueKm) {
          await tx.vehicle.update({
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

      return expense;
    });

    return NextResponse.json({
      success: true,
      expenseId: result.id,
    });
  } catch (error) {
    console.error("COMPLETE MAINTENANCE ERROR:", error);

    return NextResponse.json(
      { error: "Errore completamento manutenzione." },
      { status: 500 }
    );
  }
}