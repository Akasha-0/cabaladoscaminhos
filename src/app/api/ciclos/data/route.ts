import { NextResponse } from "next/server";

// GET endpoints - Static data about ciclos
export async function GET() {
  return NextResponse.json({ ciclos: true });
}
