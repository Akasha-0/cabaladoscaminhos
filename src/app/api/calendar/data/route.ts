import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const type = searchParams.get('type')

    const targetDate = date ? new Date(date) : new Date()
    const targetYear = year ? parseInt(year) : targetDate.getFullYear()
    const targetMonth = month ? parseInt(month) - 1 : targetDate.getMonth()

    const events: Array<{
      id: string
      title: string
      date: string
      type: string
      significance: string
    }> = []

    const dayOfWeek = targetDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

    if (type === 'events' || !type) {
      events.push({
        id: crypto.randomUUID(),
        title: 'Daily Meditation',
        date: targetDate.toISOString(),
        type: 'spiritual',
        significance: 'regular',
      })
    }

    if (type === 'lunar' || !type) {
      const lunarPhase = ['new', 'waxing', 'full', 'waning'][Math.floor(Math.random() * 4)]
      events.push({
        id: crypto.randomUUID(),
        title: `${lunarPhase.charAt(0).toUpperCase() + lunarPhase.slice(1)} Moon`,
        date: targetDate.toISOString(),
        type: 'lunar',
        significance: lunarPhase === 'full' ? 'high' : 'medium',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        date: targetDate.toISOString(),
        month: targetMonth + 1,
        year: targetYear,
        events,
        isWeekend,
        lunarPhase: ['new', 'waxing', 'full', 'waning'][Math.floor(Math.random() * 4)],
      },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}