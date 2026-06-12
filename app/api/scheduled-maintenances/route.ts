import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEMO_COMPANY_ID = "demo-company";

function toNumberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}

export async function GET() {
  try {
    const items = await prisma.scheduledMaintenance.findMany({
      where: {
        companyId: DEMO_COMPANY_ID,
        status: "active",
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("SCHEDULED GET ERROR:", error);

    return NextResponse.json(
      { error: "Errore caricamento manutenzioni programmate." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const workItemIds = Array.isArray(body.workItemIds)
      ? body.workItemIds.map((item) => String(item))
      : [];

    const worksText = workItemIds.join(", ");

    const dueType = String(body.dueType || "km");

    const item = await prisma.scheduledMaintenance.create({
      data: {
        companyId: DEMO_COMPANY_ID,
        vehicleId: String(body.vehicleId),
        title: String(body.title || "").trim(),
        worksText,
        workItemsJson: JSON.stringify(workItemIds),
        dueType,
        dueKm: dueType === "km" ? toNumberOrNull(body.dueKm) : null,
        dueDate: dueType === "date" && body.dueDate ? new Date(body.dueDate) : null,
        warningKm: body.warningKm ? Number(body.warningKm) : 1000,
        warningDays: body.warningDays ? Number(body.warningDays) : 30,
        notes: String(body.notes || "").trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("SCHEDULED POST ERROR:", error);

    return NextResponse.json(
      { error: "Errore salvataggio manutenzione programmata." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const workItemIds = Array.isArray(body.workItemIds)
      ? body.workItemIds.map((item) => String(item))
      : [];

    const worksText = workItemIds.join(", ");

    const dueType = String(body.dueType || "km");

    const item = await prisma.scheduledMaintenance.update({
      where: {
        id: String(body.id),
      },
      data: {
        vehicleId: String(body.vehicleId),
        title: String(body.title || "").trim(),
        worksText,
        workItemsJson: JSON.stringify(workItemIds),
        dueType,
        dueKm: dueType === "km" ? toNumberOrNull(body.dueKm) : null,
        dueDate: dueType === "date" && body.dueDate ? new Date(body.dueDate) : null,
        warningKm: body.warningKm ? Number(body.warningKm) : 1000,
        warningDays: body.warningDays ? Number(body.warningDays) : 30,
        notes: String(body.notes || "").trim() || null,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("SCHEDULED PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Errore modifica manutenzione programmata." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();

    const item = await prisma.scheduledMaintenance.update({
      where: {
        id: String(body.id),
      },
      data: {
        status: "archived",
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error("SCHEDULED DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Errore eliminazione manutenzione programmata." },
      { status: 500 }
    );
  }
}