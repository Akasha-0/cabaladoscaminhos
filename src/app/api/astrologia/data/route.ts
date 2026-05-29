import { NextResponse } from "next/server";
import { getPositions } from "@/lib/astrologia/planet-positions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  const date = dateParam ? new Date(dateParam) : new Date();

  const positions = getPositions(date);

  return NextResponse.json({ positions });
}
