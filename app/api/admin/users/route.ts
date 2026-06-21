import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const body = await request.json();

    const companyId = String(body.companyId || "");
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = String(body.role || "operator");

    if (!companyId || !email || !password) {
      return NextResponse.json(
        { error: "Azienda, email e password sono obbligatorie." },
        { status: 400 }
      );
    }

    if (!["admin", "operator"].includes(role)) {
      return NextResponse.json({ error: "Ruolo non valido." }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata." }, { status: 404 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email già utilizzata." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        companyId,
        fullName,
        email,
        password: passwordHash,
        role,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("CREATE ADMIN USER ERROR:", error);

    return NextResponse.json(
      { error: "Errore creazione utente." },
      { status: 500 }
    );
  }
}