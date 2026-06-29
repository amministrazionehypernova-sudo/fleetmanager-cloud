import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const companyName = String(body.companyName || "").trim();
    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();
    const password = String(body.password || "");
    const plan = String(body.plan || "basic").trim().toLowerCase();
    const expiresAtValue = String(body.expiresAt || "").trim();
    const maxVehicles = Number(body.maxVehicles || 30);
    const isActive = body.isActive !== false;

    if (!companyName || !email || !password) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti." },
        { status: 400 }
      );
    }

    if (!["basic", "pro", "enterprise"].includes(plan)) {
      return NextResponse.json(
        { error: "Piano azienda non valido." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(maxVehicles) || maxVehicles < 1) {
      return NextResponse.json(
        { error: "Il numero massimo di veicoli deve essere almeno 1." },
        { status: 400 }
      );
    }

    const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;

    if (expiresAtValue && Number.isNaN(expiresAt?.getTime())) {
      return NextResponse.json(
        { error: "Data scadenza non valida." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email già utilizzata." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: companyName,
          isActive,
          plan,
          expiresAt,
          maxVehicles,
        },
      });

      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email,
          password: passwordHash,
          fullName,
          role: "admin",
        },
      });

      return {
        company,
        user,
      };
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Errore creazione azienda." },
      { status: 500 }
    );
  }
}
