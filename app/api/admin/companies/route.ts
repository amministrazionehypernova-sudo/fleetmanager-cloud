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

    if (!companyName || !email || !password) {
      return NextResponse.json(
        { error: "Campi obbligatori mancanti." },
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