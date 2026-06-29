import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    const body = await request.json();
    const companyId = String(body.companyId || "");

    if (!companyId) {
      return NextResponse.json({ error: "Azienda mancante" }, { status: 400 });
    }

    if (companyId === session.companyId || companyId === session.originalCompanyId) {
      return NextResponse.json(
        { error: "Non puoi disattivare l'azienda SuperAdmin corrente." },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      include: { users: true },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
    }

    if (company.users.some((user) => user.role === "superadmin")) {
      return NextResponse.json(
        { error: "Non puoi disattivare un'azienda con utenti SuperAdmin." },
        { status: 400 }
      );
    }

    const updatedCompany = await prisma.company.update({
      where: { id: companyId },
      data: { isActive: !company.isActive },
    });

    return NextResponse.json({ ok: true, company: updatedCompany });
  } catch (error) {
    console.error("TOGGLE COMPANY ERROR FULL:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore aggiornamento azienda." },
      { status: 500 }
    );
  }
}
