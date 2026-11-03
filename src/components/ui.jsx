import { useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import Select from './Select'

export const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

// Compact Indian notation: ₹4.2L, ₹1.3Cr
export const inrShort = (n) => {
  const v = Number(n || 0)
  if (Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`
  if (Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`
  if (Math.abs(v) >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`
  return `₹${v}`
}

const cx = (...c) => c.filter(Boolean).join(' ')

export function Button({ variant = 'primary', size = 'md', className, children, ...props }) {
  const variants = {
    primary: 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 hover:brightness-110',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
    ghost: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
    success: 'bg-emerald-600 text-white hover:bg-emerald-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }
  const sizes = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  return (
    <button
      className={cx('inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[.98] disabled:opacity-50', variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}

const STATUS_TONES = {
  Booked: 'slate',
  'Received at China Warehouse': 'amber',
  'Dispatched from China': 'sky',
  'In Transit': 'indigo',
  'Arrived in India': 'cyan',
  'Awaiting Client Instructions': 'orange',
  'Out for Delivery': 'violet',
  Delivered: 'emerald',
  Closed: 'zinc',
  Pending: 'amber',
  Quoted: 'sky',
  Sent: 'sky',
  Accepted: 'emerald',
  Converted: 'violet',
  Rejected: 'rose',
  Superseded: 'zinc',
  Expired: 'zinc',
  Completed: 'emerald',
  Active: 'emerald',
  Inactive: 'zinc',
  Suspended: 'rose',
  Good: 'emerald',
  'Minor damage': 'orange',
}

const TONE_CLASSES = {
  slate: 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/20',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/20',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-500/20',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/20',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/20',
}

export function Badge({ children, tone }) {
  const t = tone || STATUS_TONES[children] || 'slate'
  return (
    <span className={cx('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', TONE_CLASSES[t])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  )
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const TILE_TONES = {
  indigo: { tile: 'from-teal-500/10 via-cyan-500/5 to-transparent', icon: 'from-teal-500 to-cyan-600 shadow-teal-500/30', ring: 'ring-teal-500/10' },
  amber: { tile: 'from-amber-500/10 via-orange-500/5 to-transparent', icon: 'from-amber-400 to-orange-500 shadow-orange-500/30', ring: 'ring-amber-500/10' },
  rose: { tile: 'from-rose-500/10 via-orange-500/5 to-transparent', icon: 'from-rose-500 to-orange-500 shadow-rose-500/30', ring: 'ring-rose-500/10' },
  emerald: { tile: 'from-emerald-500/10 via-teal-500/5 to-transparent', icon: 'from-emerald-400 to-teal-500 shadow-emerald-500/30', ring: 'ring-emerald-500/10' },
  cyan: { tile: 'from-cyan-500/10 via-sky-500/5 to-transparent', icon: 'from-cyan-400 to-sky-500 shadow-sky-500/30', ring: 'ring-cyan-500/10' },
  fuchsia: { tile: 'from-sky-500/10 via-blue-500/5 to-transparent', icon: 'from-sky-500 to-blue-600 shadow-sky-500/30', ring: 'ring-sky-500/10' },
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'indigo', delta, goodWhenDown, children }) {
  const t = TILE_TONES[tone]
  const good = delta != null && (delta >= 0) !== !!goodWhenDown
  return (
    <div className={cx('card group relative overflow-hidden p-5 ring-1 ring-inset transition hover:-translate-y-0.5 hover:shadow-lg', t.ring)}>
      <div className={cx('pointer-events-none absolute inset-0 bg-gradient-to-br', t.tile)} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900 dark:text-white">{value}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {delta != null && (
              <span className={cx('rounded-full px-1.5 py-0.5 font-semibold', good ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400')}>
                {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
              </span>
            )}
            {hint && <span className="text-slate-500 dark:text-slate-400">{hint}</span>}
          </div>
        </div>
        <div className={cx('grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg', t.icon)}>
          <Icon size={20} />
        </div>
      </div>
      {children && <div className="relative mt-3">{children}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer, wide }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cx('card animate-fade-up relative flex max-h-[90vh] w-full flex-col', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="scroll-thin overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4 dark:border-slate-800">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

export function Field({ label, children, className }) {
  return (
    <label className={cx('block', className)}>
      <span className="label">{label}</span>
      {children}
    </label>
  )
}

export const PAGE_SIZES = [5, 10, 20, 50]

export function usePagination(rows, initialSize = 10) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(initialSize)
  const pages = Math.max(1, Math.ceil(rows.length / size))
  const current = Math.min(page, pages) // clamp when filters shrink the list
  return {
    rows: rows.slice((current - 1) * size, current * size),
    page: current, pages, size, total: rows.length,
    setPage, setSize: (n) => { setSize(n); setPage(1) },
  }
}

function pageList(page, pages) {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const set = [1, page - 1, page, page + 1, pages].filter((p) => p >= 1 && p <= pages)
  const out = []
  ;[...new Set(set)].sort((a, b) => a - b).forEach((p, i, arr) => {
    if (i && p - arr[i - 1] > 1) out.push('…' + p)
    out.push(p)
  })
  return out
}

export function Pagination({ page, pages, size, total, setPage, setSize, label = 'records', sizes = PAGE_SIZES }) {
  const from = total ? (page - 1) * size + 1 : 0
  const to = Math.min(page * size, total)
  const btn = 'grid h-8 min-w-8 place-items-center rounded-lg px-2 text-xs font-medium transition disabled:pointer-events-none disabled:opacity-40'
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
      <div className="flex items-center gap-2">
        <span>Rows per page</span>
        <Select size="sm" className="w-16" value={size} onChange={setSize} options={sizes} />
        <span className="hidden sm:inline">
          Showing <b className="text-slate-700 dark:text-slate-200">{from}–{to}</b> of <b className="text-slate-700 dark:text-slate-200">{total}</b> {label}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button className={cx(btn, 'hover:bg-slate-100 dark:hover:bg-slate-800')} disabled={page === 1} onClick={() => setPage(1)} title="First"><ChevronsLeft size={14} /></button>
        <button className={cx(btn, 'hover:bg-slate-100 dark:hover:bg-slate-800')} disabled={page === 1} onClick={() => setPage(page - 1)} title="Previous"><ChevronLeft size={14} /></button>
        {pageList(page, pages).map((p) =>
          typeof p === 'string' ? (
            <span key={p} className="px-1">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cx(btn, p === page ? 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white shadow-md shadow-brand-500/25' : 'hover:bg-slate-100 dark:hover:bg-slate-800')}
            >
              {p}
            </button>
          ),
        )}
        <button className={cx(btn, 'hover:bg-slate-100 dark:hover:bg-slate-800')} disabled={page === pages} onClick={() => setPage(page + 1)} title="Next"><ChevronRight size={14} /></button>
        <button className={cx(btn, 'hover:bg-slate-100 dark:hover:bg-slate-800')} disabled={page === pages} onClick={() => setPage(pages)} title="Last"><ChevronsRight size={14} /></button>
      </div>
    </div>
  )
}

export function Table({ columns, rows, onRowClick, empty = 'No records found', paginate = true, pageSize = 10, label }) {
  const pg = usePagination(rows, pageSize)
  const visible = paginate ? pg.rows : rows
  return (
    <div>
      <div className="scroll-thin overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/30 dark:text-slate-400">
              {columns.map((c) => (
                <th key={c.key} className={cx('whitespace-nowrap px-4 py-3 font-semibold first:pl-6 last:pr-6', c.className)}>
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400">
                  {empty}
                </td>
              </tr>
            )}
            {visible.map((r, i) => (
              <tr
                key={r.id ?? i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={cx('border-b border-slate-100/80 last:border-0 dark:border-slate-800/60', onRowClick && 'cursor-pointer transition hover:bg-brand-50/60 dark:hover:bg-brand-500/5')}
              >
                {columns.map((c) => (
                  <td key={c.key} className={cx('whitespace-nowrap px-4 py-3 first:pl-6 last:pr-6', c.className)}>
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {paginate && rows.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <Pagination {...pg} label={label} />
        </div>
      )}
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return <input className="input max-w-xs" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={cx(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition',
            value === t ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400',
          )}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

export function UploadBox({ label = 'Drop files or click to upload', files = [], onAdd }) {
  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center text-xs text-slate-500 transition hover:border-brand-300 hover:bg-brand-50/40 dark:border-slate-700 dark:bg-slate-800/40">
        <span className="font-medium text-brand-600 dark:text-brand-400">{label}</span>
        <span>PDF, XLSX, JPG, PNG</span>
        <input type="file" multiple className="hidden" onChange={(e) => onAdd?.([...e.target.files].map((f) => f.name))} />
      </label>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {files.map((f) => (
            <span key={f} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              📎 {f}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
