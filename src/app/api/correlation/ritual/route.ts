import { NextResponse } from 'next/server';
import { generateRitualPlan, getWeeklyRitualSchedule } from '@/lib/correlation/ritual-planner';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'today';

  try {
    if (type === 'week') {
      const schedule = getWeeklyRitualSchedule();
      return NextResponse.json({
        success: true,
        data: schedule,
      });
    }

    // Default: single day plan
    const dateParam = searchParams.get('date');
    const date = dateParam ? new Date(dateParam) : new Date();
    const symptomsParam = searchParams.get('symptoms');
    const symptoms = symptomsParam ? symptomsParam.split(',') : undefined;
    const plan = generateRitualPlan(date.toISOString(), symptoms);

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
