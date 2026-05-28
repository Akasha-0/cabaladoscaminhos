import { NextResponse } from "next/server";

// GET /api/nada/data
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      message: "Nada data endpoint",
    },
  });
}