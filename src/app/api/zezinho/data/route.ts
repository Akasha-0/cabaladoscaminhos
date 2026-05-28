import { NextRequest, NextResponse } from "next/server";

// GET /api/zezinho/data
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const key = searchParams.get("key");

  // Mock data - replace with real data source as needed
  const data = {
    id: key || "default",
    timestamp: new Date().toISOString(),
    status: "active",
    message: "Zezinho data endpoint",
  };

  return NextResponse.json(data);
}
