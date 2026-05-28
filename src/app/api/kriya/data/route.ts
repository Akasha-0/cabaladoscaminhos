import { NextResponse } from "next/server";

// GET /api/kriya/data
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      message: "Kriya data endpoint",
    },
  });
}
