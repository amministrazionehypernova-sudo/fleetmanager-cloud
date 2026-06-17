import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function toDateOrNull(value: unknown) {
  if (!value) return null;
  return new Date(String(value));
}

function toNumberOrZero(value: unknown) {
  if (!value) return 0;
  return Number(value);
}

function toNumberOrNull(value: unknown) {
  if (!value) return null;
  return Number(value);
}

export async function GET() {
  try {
    const session = await requireSession();

    const vehicles = await prisma.vehicle.findMany({
      where: {
        companyId: session.companyId,
        status: "active",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ vehicles });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore caricamento veicoli." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();

    const plate = String(body.plate || "").trim().toUpperCase();
    const brand = String(body.brand || "").trim();
    const model = String(body.model || "").trim();

    if (!plate) {
      return NextResponse.json(
        { error: "La targa è obbligatoria." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        companyId: session.companyId,
        plate,
        brand,
        model,
        currentKm: toNumberOrZero(body.currentKm),
        insuranceExpiry: toDateOrNull(body.insuranceExpiry),
        inspectionExpiry: toDateOrNull(body.inspectionExpiry),
        taxExpiry: toDateOrNull(body.taxExpiry),
        serviceDueKm: toNumberOrNull(body.serviceDueKm),
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore creazione veicolo." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "ID veicolo mancante." },
        { status: 400 }
      );
    }

    const vehicleExists = await prisma.vehicle.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
    });

    if (!vehicleExists) {
      return NextResponse.json(
        { error: "Veicolo non trovato." },
        { status: 404 }
      );
    }

    const plate = String(body.plate || "").trim().toUpperCase();

    if (!plate) {
      return NextResponse.json(
        { error: "La targa è obbligatoria." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        plate,
        brand: String(body.brand || "").trim(),
        model: String(body.model || "").trim(),
        currentKm: toNumberOrZero(body.currentKm),
        insuranceExpiry: toDateOrNull(body.insuranceExpiry),
        inspectionExpiry: toDateOrNull(body.inspectionExpiry),
        taxExpiry: toDateOrNull(body.taxExpiry),
        serviceDueKm: toNumberOrNull(body.serviceDueKm),
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore modifica veicolo." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireSession();

    const body = await request.json();

    const id = String(body.id || "");

    if (!id) {
      return NextResponse.json(
        { error: "ID veicolo mancante." },
        { status: 400 }
      );
    }

    const vehicleExists = await prisma.vehicle.findFirst({
      where: {
        id,
        companyId: session.companyId,
      },
    });

    if (!vehicleExists) {
      return NextResponse.json(
        { error: "Veicolo non trovato." },
        { status: 404 }
      );
    }

    const vehicle = await prisma.vehicle.update({
      where: {
        id,
      },
      data: {
        status: "archived",
      },
    });

    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore archiviazione veicolo." },
      { status: 500 }
    );
  }
}

