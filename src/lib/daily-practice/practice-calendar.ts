// Daily practice calendar

export interface CalendarDay {
  date: string;
  completed: boolean;
  practice?: string;
}

export interface CalendarView {
  days: CalendarDay[];
  currentMonth: string;
}

export function getCalendar(): CalendarView {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: CalendarDay[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    days.push({
      date: date.toISOString().split('T')[0],
      completed: false,
    });
  }

  return {
    days,
    currentMonth: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
  };
}