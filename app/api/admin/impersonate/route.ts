import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession, requireSession } from "@/lib/auth";

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

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Azienda non trovata" }, { status: 404 });
    }

    const token = await createSession({
  userId: session.userId,
  companyId: company.id,
  email: session.email,
  role: "superadmin",
  originalCompanyId: session.originalCompanyId || session.companyId,
});

    const cookieStore = await cookies();

    cookieStore.set("fleet_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("IMPERSONATE ERROR:", error);

    return NextResponse.json(
      { error: "Errore accesso cliente." },
      { status: 500 }
    );
  }
}