const DAY_MS = 86_400_000

const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

export function toISODate(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  return Number.isNaN(date.getTime()) ? null : date
}

/** Whole-day difference between two yyyy-mm-dd strings (to - from). */
export function diffInDays(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO)
  const to = parseISODate(toISO)
  if (!from || !to) return 0
  return Math.round((to.getTime() - from.getTime()) / DAY_MS)
}

export type DueTone = 'overdue' | 'today' | 'soon' | 'later' | 'done' | 'none'

export interface DueInfo {
  text: string
  tone: DueTone
}

export function describeDue(dueDate: string | null, completed: boolean): DueInfo {
  if (!dueDate) return { text: '', tone: 'none' }
  if (completed) return { text: formatDate(dueDate), tone: 'done' }

  const remaining = diffInDays(todayISO(), dueDate)
  if (remaining < 0) {
    const late = Math.abs(remaining)
    return { text: late === 1 ? 'Telat 1 hari' : `Telat ${late} hari`, tone: 'overdue' }
  }
  if (remaining === 0) return { text: 'Jatuh tempo hari ini', tone: 'today' }
  if (remaining === 1) return { text: 'Jatuh tempo besok', tone: 'soon' }
  if (remaining <= 3) return { text: `${remaining} hari lagi`, tone: 'soon' }
  return { text: formatDate(dueDate), tone: 'later' }
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false
  return diffInDays(todayISO(), dueDate) < 0
}

export function formatDate(value: string): string {
  const date = parseISODate(value)
  if (!date) return value
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function formatClock(timestamp: number): string {
  const date = new Date(timestamp)
  const hour = `${date.getHours()}`.padStart(2, '0')
  const minute = `${date.getMinutes()}`.padStart(2, '0')
  return `${hour}:${minute}`
}