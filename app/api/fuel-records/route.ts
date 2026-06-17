import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function toNumberOrZero(value: unknown) {
  if (!value) return 0;
  return Number(value);
}

export async function GET() {
  try {
    const session = await requireSession();

    const records = await prisma.fuelRecord.findMany({
      where: {
        companyId: session.companyId,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        fuelDate: "desc",
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore caricamento rifornimenti." },
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
    const fuelDate = String(body.fuelDate || "");
    const kmValue = toNumberOrZero(body.kmValue);
    const liters = toNumberOrZero(body.liters);
    const totalCost = toNumberOrZero(body.totalCost);
    const notes = String(body.notes || "").trim();

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

    if (!fuelDate) {
      return NextResponse.json(
        { error: "Inserisci la data del rifornimento." },
        { status: 400 }
      );
    }

    if (liters <= 0) {
      return NextResponse.json(
        { error: "I litri devono essere maggiori di zero." },
        { status: 400 }
      );
    }

    if (totalCost <= 0) {
      return NextResponse.json(
        { error: "Il costo totale deve essere maggiore di zero." },
        { status: 400 }
      );
    }

    const pricePerLiter = totalCost / liters;

    const record = await prisma.fuelRecord.create({
      data: {
        companyId,
        vehicleId,
        fuelDate: new Date(fuelDate),
        kmValue,
        liters,
        totalCost,
        pricePerLiter,
        notes,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore salvataggio rifornimento." },
      { status: 500 }
    );
  }
}