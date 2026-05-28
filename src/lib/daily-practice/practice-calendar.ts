export interface CalendarDay {
  date: string;
  completed: boolean;
  practiceType?: string;
}

export interface CalendarView {
  days: CalendarDay[];
  currentMonth: string;
}

export function getCalendar(): CalendarView {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
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

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return {
    days,
    currentMonth: `${monthNames[month]} ${year}`,
  };
}