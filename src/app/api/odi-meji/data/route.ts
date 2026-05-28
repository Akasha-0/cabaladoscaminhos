import { NextResponse } from "next/server";
import { getData } from "@/lib/meji-odi/meji-odi-data";

export async function GET() {
  return NextResponse.json(getData());
}
