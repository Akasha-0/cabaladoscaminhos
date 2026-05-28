import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");

  if (id) {
    return NextResponse.json({ id, data: "ewa-record" });
  }

  return NextResponse.json({ data: [] });
}