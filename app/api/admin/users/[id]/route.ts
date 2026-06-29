import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

type UserRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function parseUserPayload(body: Record<string, unknown>) {
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const role = String(body.role || "operator");

  if (!email) {
    return { error: "Email obbligatoria." };
  }

  if (!["admin", "operator"].includes(role)) {
    return { error: "Ruolo non valido." };
  }

  return {
    data: {
      fullName,
      email,
      role,
    },
  };
}

export async function GET(_request: Request, context: UserRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    if (user.role === "superadmin") {
      return NextResponse.json(
        { error: "Gli utenti SuperAdmin non sono gestibili da questa sezione." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("GET ADMIN USER ERROR:", error);

    return NextResponse.json(
      { error: "Errore caricamento utente." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: UserRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = parseUserPayload(body);

    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    if (currentUser.role === "superadmin") {
      return NextResponse.json(
        { error: "Gli utenti SuperAdmin non sono gestibili da questa sezione." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (existingUser && existingUser.id !== id) {
      return NextResponse.json({ error: "Email già utilizzata." }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    console.error("UPDATE ADMIN USER ERROR:", error);

    return NextResponse.json(
      { error: "Errore aggiornamento utente." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: UserRouteContext) {
  try {
    const session = await requireSession();

    if (session.role !== "superadmin") {
      return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
    }

    const { id } = await context.params;

    if (id === session.userId) {
      return NextResponse.json(
        { error: "Non puoi eliminare il tuo utente corrente." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
    }

    if (user.role === "superadmin") {
      return NextResponse.json(
        { error: "Gli utenti SuperAdmin non sono gestibili da questa sezione." },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE ADMIN USER ERROR:", error);

    return NextResponse.json(
      { error: "Errore eliminazione utente." },
      { status: 500 }
    );
  }
}
