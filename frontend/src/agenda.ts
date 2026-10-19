const MS_PER_DAY = 24 * 60 * 60 * 1000

// Midnight of the given date, in local time: "how many days away" is counted in
// calendar days, not in 24-hour blocks (a 9:00 appointment seen at 20:00 the night
// before is "Mañana", even though it's only 13 hours away).
function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/**
 * Tells the citizen, in words, when their appointment is relative to `now`.
 * `now` comes in as a parameter so the result doesn't depend on the clock.
 */
export function whenIs(scheduledAtIso: string, now: Date = new Date()): string {
  const scheduled = new Date(scheduledAtIso)
  if (Number.isNaN(scheduled.getTime())) {
    return ''
  }

  if (scheduled.getTime() < now.getTime()) {
    return 'Ya pasó'
  }

  const days = Math.round((startOfDay(scheduled) - startOfDay(now)) / MS_PER_DAY)
  if (days === 0) {
    return 'Hoy'
  }
  if (days === 1) {
    return 'Mañana'
  }
  if (days < 7) {
    return `En ${days} días`
  }

  const weeks = Math.floor(days / 7)
  return weeks === 1 ? 'En una semana' : `En ${weeks} semanas`
}
