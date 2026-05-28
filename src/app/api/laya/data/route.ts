import { NextResponse } from "next/server";

// GET /api/laya/data
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      message: "Laya data endpoint",
    },
  });
}