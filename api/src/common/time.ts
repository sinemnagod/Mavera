const TIME_ZONE = 'Europe/Istanbul';

// The date and minutes-since-midnight in Istanbul, wherever the server runs.
export function istanbulNow(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

// Turkey is UTC+3 all year, so the start of the Istanbul day is a fixed offset.
export function startOfIstanbulDay(now = new Date()): Date {
  return new Date(`${istanbulNow(now).date}T00:00:00+03:00`);
}

export function minutesFromClock(clock: string): number {
  const [hours, minutes] = clock.split(':').map(Number);
  return hours * 60 + minutes;
}
