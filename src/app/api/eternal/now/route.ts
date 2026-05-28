// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest) {
  return Response.json({
    timestamp: new Date().toISOString(),
    era: "eternal",
  });
}
