const rtf = new Intl.RelativeTimeFormat('de', { numeric: 'auto' })

/** "vor 3 Stunden" style label for an ISO timestamp. */
export function timeAgo(iso: string, now = Date.now()): string {
  const diff = (new Date(iso).getTime() - now) / 1000
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, seconds] of steps) {
    if (Math.abs(diff) >= seconds) return rtf.format(Math.round(diff / seconds), unit)
  }
  return 'gerade eben'
}

export function memberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  })
}
