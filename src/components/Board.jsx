import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plane, Ship } from 'lucide-react'
import { useApp } from '../context/AppContext'

const PAGE = 4

// Kanban-style board: columns of shipments grouped by status, with an optional action per card
export default function Board({ columns }) {
  const { shipments, clientById } = useApp()
  const [limits, setLimits] = useState({})
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {columns.map((col) => {
        const items = shipments.filter((s) => col.statuses.includes(s.status))
        const limit = limits[col.title] ?? PAGE
        return (
          <div key={col.title} className="rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-900/60">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="ml-auto rounded-full bg-white px-2 text-xs font-semibold text-slate-500 dark:bg-slate-800">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.slice(0, limit).map((s) => {
                const c = clientById(s.clientId)
                return (
                  <div key={s.id} className="card p-4 transition hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <Link to={`/shipments/${s.id}`} className="text-sm font-semibold hover:text-brand-600">{s.id}</Link>
                      {s.mode === 'Air' ? <Plane size={14} className="text-cyan-500" /> : <Ship size={14} className="text-brand-500" />}
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-500">{c?.company}</p>
                    <span className="mt-2 inline-block rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] font-bold text-white dark:bg-white dark:text-slate-900">{c?.mark}</span>
                    {col.meta && <p className="mt-2 text-xs text-slate-500">{col.meta(s)}</p>}
                    {col.action && col.action(s)}
                  </div>
                )
              })}
              {items.length === 0 && <p className="py-6 text-center text-xs text-slate-400">Nothing here</p>}
              {items.length > PAGE && (
                <div className="flex items-center justify-between px-1 pt-1 text-xs">
                  <span className="text-slate-500">Showing {Math.min(limit, items.length)} of {items.length}</span>
                  {limit < items.length ? (
                    <button onClick={() => setLimits((l) => ({ ...l, [col.title]: limit + PAGE }))} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                      Load {Math.min(PAGE, items.length - limit)} more
                    </button>
                  ) : (
                    <button onClick={() => setLimits((l) => ({ ...l, [col.title]: PAGE }))} className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
                      Show less
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
