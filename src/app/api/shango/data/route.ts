// @ts-nocheck
// SKIP_LINT

import { NextResponse } from "next/server";
import { getData, getDataById, searchData, getShangoByDay, getShangoByElement } from "@/lib/orixa/shango-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const query = searchParams.get("q");
  const day = searchParams.get("day");
  const element = searchParams.get("element");

  if (id) {
    const item = getDataById(id);
    if (!item) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ data: item });
  }

  if (query) {
    return NextResponse.json({ data: searchData(query) });
  }

  if (day) {
    return NextResponse.json({ data: getShangoByDay(day) });
  }

  if (element) {
    return NextResponse.json({ data: getShangoByElement(element) });
  }

  return NextResponse.json({ data: getData() });
}