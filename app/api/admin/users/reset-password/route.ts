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

    const userId = String(body.userId || "");
    const newPassword = String(body.newPassword || "");

    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: "Utente e nuova password sono obbligatori." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: passwordHash },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return NextResponse.json(
      { error: "Errore reset password." },
      { status: 500 }
    );
  }
}