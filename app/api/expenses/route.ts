import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        companyId: DEMO_COMPANY_ID,
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
    const body = await request.json();

    const expense = await prisma.expense.create({
      data: {
        companyId: DEMO_COMPANY_ID,
        vehicleId: String(body.vehicleId || ""),
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