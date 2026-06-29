import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("HEALTH CHECK ERROR:", error);

    return NextResponse.json(
      {
        ok: false,
        database: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
