import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requireSession();

    const records = await prisma.dailyRecord.findMany({
      where: {
        companyId: session.companyId,
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
    const session = await requireSession();
    const companyId = session.companyId;

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

    if (!recordDate) {
      return NextResponse.json(
        { error: "La data è obbligatoria." },
        { status: 400 }
      );
    }

    if (endKm < startKm) {
      return NextResponse.json(
        {
          error:
            "I km di arrivo non possono essere inferiori ai km di partenza.",
        },
        { status: 400 }
      );
    }

    const kmDone = endKm - startKm;
    const kmPerLiter = liters > 0 ? kmDone / liters : 0;
    const costPerKm = kmDone > 0 ? fuelCost / kmDone : 0;

    const result = await prisma.$transaction(async (tx) => {
      const record = await tx.dailyRecord.create({
        data: {
          companyId,
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

      await tx.vehicle.update({
        where: {
          id: vehicleId,
        },
        data: {
          currentKm: endKm,
        },
      });

      return record;
    });

    return NextResponse.json({ record: result });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore salvataggio km giornalieri." },
      { status: 500 }
    );
  }
}