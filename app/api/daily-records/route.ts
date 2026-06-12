import AppLayout from "@/components/AppLayout";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

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
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore caricamento km giornalieri." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const vehicleId = String(body.vehicleId || "");
    const recordDate = String(body.recordDate || "");
    const startKm = Number(body.startKm || 0);
    const endKm = Number(body.endKm || 0);
    const liters = Number(body.liters || 0);
    const fuelCost = Number(body.fuelCost || 0);
    const notes = String(body.notes || "");

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Seleziona un veicolo." },
        { status: 400 }
      );
    }

    if (!recordDate) {
      return NextResponse.json(
        { error: "La data è obbligatoria." },
        { status: 400 }
      );
    }

    if (endKm < startKm) {
      return NextResponse.json(
        { error: "I km di arrivo non possono essere inferiori ai km di partenza." },
        { status: 400 }
      );
    }

    const kmDone = endKm - startKm;
    const kmPerLiter = liters > 0 ? kmDone / liters : 0;
    const costPerKm = kmDone > 0 ? fuelCost / kmDone : 0;

    const record = await prisma.dailyRecord.create({
      data: {
        companyId: DEMO_COMPANY_ID,
        vehicleId,
        recordDate: new Date(recordDate),
        startKm,
        endKm,
        kmDone,
        liters,
        fuelCost,
        kmPerLiter,
        costPerKm,
        notes,
      },
    });

    await prisma.vehicle.update({
      where: {
        id: vehicleId,
      },
      data: {
        currentKm: endKm,
      },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore salvataggio km giornalieri." },
      { status: 500 }
    );
  }
}