import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSession, requireSession } from "@/lib/auth";

export async function POST() {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 403 });
    }

    if (!session.originalCompanyId) {
      return NextResponse.json(
        { error: "Nessuna impersonificazione attiva." },
        { status: 400 }
      );
    }

    const token = await createSession({
      userId: session.userId,
      companyId: session.originalCompanyId,
      email: session.email,
      role: "superadmin",
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
    console.error("RETURN ADMIN ERROR:", error);

    return NextResponse.json(
      { error: "Errore ritorno admin." },
      { status: 500 }
    );
  }
}