import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const leads = await db.lead.findMany({
      where: {
        analysisEmailSent: false,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error("[API] Error in leads-pending-analysis:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
