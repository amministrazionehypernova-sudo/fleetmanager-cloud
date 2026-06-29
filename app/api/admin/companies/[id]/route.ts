import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

type CompanyRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseCompanyPayload(body: Record<string, unknown>) {
  const name = String(body.name || "").trim();
  const plan = String(body.plan || "basic").trim().toLowerCase();
  const expiresAtValue = String(body.expiresAt || "").trim();
  const maxVehicles = Number(body.maxVehicles || 30);
  const isActive = body.isActive !== false;

  if (!name) {
    return { error: "Il nome azienda è obbligatorio." };
  }

  if (!["basic", "pro", "enterprise"].includes(plan)) {
    return { error: "Piano azienda non valido." };
  }

  if (!Number.isInteger(maxVehicles) || maxVehicles < 1) {
    return { error: "Il numero massimo di veicoli deve essere almeno 1." };
  }

  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;

  if (expiresAtValue && Number.isNaN(expiresAt?.getTime())) {
    return { error: "Data scadenza non valida." };
  }

  return {
    data: {
      name,
      plan,
      expiresAt,
      maxVehicles,
      isActive,
    },
  };
}

export async function PUT(request: Request, context: CompanyRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = parseCompanyPayload(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const company = await prisma.company.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, company });
  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);

    return NextResponse.json(
      { error: "Errore aggiornamento azienda." },
      { status: 500 }
    );
  }
}

export async function GET(_request: Request, context: CompanyRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;

    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata." }, { status: 404 });
    }

    return NextResponse.json({ ok: true, company });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);

    return NextResponse.json(
      { error: "Errore caricamento azienda." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: CompanyRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;

    if (id === session.companyId || id === session.originalCompanyId) {
      return NextResponse.json(
        { error: "Non puoi eliminare l'azienda SuperAdmin corrente." },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata." }, { status: 404 });
    }

    if (company.users.some((user) => user.role === "superadmin")) {
      return NextResponse.json(
        { error: "Non puoi eliminare un'azienda con utenti SuperAdmin." },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.scheduledMaintenance.deleteMany({ where: { companyId: id } });
      await tx.documentRenewal.deleteMany({ where: { companyId: id } });
      await tx.fuelRecord.deleteMany({ where: { companyId: id } });
      await tx.dailyRecord.deleteMany({ where: { companyId: id } });
      await tx.expense.deleteMany({ where: { companyId: id } });
      await tx.alert.deleteMany({ where: { companyId: id } });
      await tx.vehicle.deleteMany({ where: { companyId: id } });
      await tx.user.deleteMany({ where: { companyId: id } });
      await tx.company.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);

    return NextResponse.json(
      { error: "Errore eliminazione azienda." },
      { status: 500 }
    );
  }
}
