import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession();

    const expenses = await prisma.expense.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error("EXPENSES GET ERROR:", error);

    return NextResponse.json(
      { error: "Errore caricamento interventi." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const companyId = session.companyId;

    const body = await request.json();

    const vehicleId = String(body.vehicleId || "");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Seleziona un veicolo." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        companyId,
        status: "active",
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Veicolo non trovato o non autorizzato." },
        { status: 404 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        companyId,
        vehicleId,
        expenseDate: new Date(body.expenseDate),
        kmValue: Number(body.kmValue || 0),
        category: String(body.category || "").trim(),
        supplier: String(body.supplier || "").trim(),
        amount: Number(body.amount || 0),
        invoiceNumber: String(body.invoiceNumber || "").trim(),
        notes: String(body.notes || "").trim(),
        nextDueKm: body.nextDueKm ? Number(body.nextDueKm) : null,
      },
    });

    return NextResponse.json({ expense });
  } catch (error) {
    console.error("EXPENSES POST ERROR:", error);

    return NextResponse.json(
      { error: "Errore salvataggio intervento." },
      { status: 500 }
    );
  }
}