import { TODAY, daysBetween } from '../data/mock'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const monthKey = (d) => d.slice(0, 7)
export const monthLabel = (k) => `${MONTHS[Number(k.slice(5, 7)) - 1]} ${k.slice(2, 4)}`

// Month keys for the last n months, ending with the current month
export function lastMonths(n, end = TODAY) {
  const [y, m] = end.split('-').map(Number)
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(Date.UTC(y, m - 1 - (n - 1 - i), 1))
    return d.toISOString().slice(0, 7)
  })
}

const findStep = (s, status) => s.history.find((h) => h.status === status)?.at

export const transitDays = (s) => {
  const from = findStep(s, 'Dispatched from China')
  const to = findStep(s, 'Arrived in India')
  return from && to ? daysBetween(from, to) : null
}

export const deliveredOn = (s) => findStep(s, 'Delivered')?.slice(0, 10) ?? null

export const isOnTime = (s) => {
  const d = deliveredOn(s)
  return d && s.eta !== '—' ? d <= s.eta : null
}

export const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
export const sum = (arr, f = (x) => x) => arr.reduce((a, x) => a + (Number(f(x)) || 0), 0)
export const pctChange = (cur, prev) => (prev ? ((cur - prev) / Math.abs(prev)) * 100 : null)

export function downloadCSV(filename, columns, rows) {
  const esc = (v) => {
    const s = String(v ?? '')
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [columns.map((c) => esc(c.label)).join(','), ...rows.map((r) => columns.map((c) => esc(c.csv(r))).join(','))].join('\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}
