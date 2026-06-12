import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

function toNumberOrZero(value: unknown) {
  if (value === null || value === undefined || value === "") return 0;
  return Number(value);
}

function getVehicleUpdateField(documentType: string, nextExpiryDate: Date) {
  if (documentType === "insurance") {
    return {
      insuranceExpiry: nextExpiryDate,
    };
  }

  if (documentType === "inspection") {
    return {
      inspectionExpiry: nextExpiryDate,
    };
  }

  if (documentType === "tax") {
    return {
      taxExpiry: nextExpiryDate,
    };
  }

  return null;
}

export async function GET() {
  try {
    const renewals = await prisma.documentRenewal.findMany({
      where: {
        companyId: DEMO_COMPANY_ID,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        renewalDate: "desc",
      },
    });

    return NextResponse.json({ renewals });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore caricamento rinnovi documenti." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const vehicleId = String(body.vehicleId || "");
    const documentType = String(body.documentType || "");
    const renewalDate = String(body.renewalDate || "");
    const nextExpiryDate = String(body.nextExpiryDate || "");
    const amount = toNumberOrZero(body.amount);
    const supplier = String(body.supplier || "").trim();
    const invoiceNumber = String(body.invoiceNumber || "").trim();
    const notes = String(body.notes || "").trim();

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Seleziona un veicolo." },
        { status: 400 }
      );
    }

    if (!documentType) {
      return NextResponse.json(
        { error: "Seleziona il tipo documento." },
        { status: 400 }
      );
    }

    if (!["insurance", "inspection", "tax"].includes(documentType)) {
      return NextResponse.json(
        { error: "Tipo documento non valido." },
        { status: 400 }
      );
    }

    if (!renewalDate) {
      return NextResponse.json(
        { error: "Inserisci la data del rinnovo." },
        { status: 400 }
      );
    }

    if (!nextExpiryDate) {
      return NextResponse.json(
        { error: "Inserisci la prossima scadenza." },
        { status: 400 }
      );
    }

    const parsedNextExpiryDate = new Date(nextExpiryDate);

    const vehicleUpdate = getVehicleUpdateField(
      documentType,
      parsedNextExpiryDate
    );

    if (!vehicleUpdate) {
      return NextResponse.json(
        { error: "Documento non gestibile." },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const renewal = await tx.documentRenewal.create({
        data: {
          companyId: DEMO_COMPANY_ID,
          vehicleId,
          documentType,
          renewalDate: new Date(renewalDate),
          nextExpiryDate: parsedNextExpiryDate,
          amount,
          supplier,
          invoiceNumber,
          notes,
        },
      });

      const vehicle = await tx.vehicle.update({
        where: {
          id: vehicleId,
        },
        data: vehicleUpdate,
      });

      return {
        renewal,
        vehicle,
      };
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore salvataggio rinnovo documento." },
      { status: 500 }
    );
  }
}