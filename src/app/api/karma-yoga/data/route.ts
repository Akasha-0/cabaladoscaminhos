import { NextResponse } from "next/server";

// GET /api/karma-yoga/data
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      message: "Karma-yoga data endpoint",
    },
  });
}
