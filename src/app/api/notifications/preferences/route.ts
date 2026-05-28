import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler } from "@/lib/error-handling";

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  transitAlerts: boolean;
  dailyInsights: boolean;
}

// Mock database - replace with real DB calls
const mockPreferences: NotificationPreferences = {
  email: true,
  push: false,
  transitAlerts: true,
  dailyInsights: true,
};

export const GET = withErrorHandler(async (_req: NextRequest) => {
  return NextResponse.json(mockPreferences);
});

export const PUT = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json() as Partial<NotificationPreferences>;

  // Basic validation
  if (
    typeof body.email !== "boolean" &&
    typeof body.push !== "boolean" &&
    typeof body.transitAlerts !== "boolean" &&
    typeof body.dailyInsights !== "boolean"
  ) {
    return NextResponse.json(
      { error: { code: 2001, message: "Invalid preferences payload" } },
      { status: 400 }
    );
  }

  const updated: NotificationPreferences = {
    email: body.email ?? mockPreferences.email,
    push: body.push ?? mockPreferences.push,
    transitAlerts: body.transitAlerts ?? mockPreferences.transitAlerts,
    dailyInsights: body.dailyInsights ?? mockPreferences.dailyInsights,
  };

  return NextResponse.json(updated);
});
