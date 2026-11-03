import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell, Boxes, ChartPie, ClipboardList, FileChartColumn, LayoutDashboard, LogOut, Menu, Moon, Search, Ship, ShieldCheck, Sun, Truck, Users, Warehouse,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export const NAV = [
  { key: 'dashboard', to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'analytics', to: '/analytics', label: 'Analytics', icon: ChartPie },
  { key: 'clients', to: '/clients', label: 'Clients', icon: Users },
  { key: 'inquiries', to: '/inquiries', label: 'Inquiries & Quotes', icon: ClipboardList },
  { key: 'shipments', to: '/shipments', label: 'Shipments', icon: Boxes },
  { key: 'warehouse', to: '/warehouse', label: 'China Warehouse', icon: Warehouse },
  { key: 'delivery', to: '/delivery', label: 'Final Delivery', icon: Truck },
  { key: 'reports', to: '/reports', label: 'Reports & History', icon: FileChartColumn },
  { key: 'admin', to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
]

export default function Layout() {
  const { user, setUser, dark, setDark, toast, shipments, roleAccess } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const allowed = roleAccess[user.role] ?? ['dashboard']
  const awaiting = shipments.filter((s) => s.status === 'Awaiting Client Instructions').length

  const sidebar = (
    <aside className="relative flex h-full w-64 flex-col overflow-hidden bg-gradient-to-b from-slate-950 via-teal-950 to-slate-950 text-slate-300 ring-1 ring-white/5">
      <div className="pointer-events-none absolute -left-20 top-1/3 h-60 w-60 rounded-full bg-cyan-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -right-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="relative flex items-center gap-3 px-6 py-6">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-cyan-400 shadow-lg shadow-cyan-500/40">
          <Ship size={20} className="text-white" />
        </div>
        <div>
          <p className="text-lg font-bold leading-tight text-white">ShipFlow</p>
          <p className="text-[11px] uppercase tracking-widest text-slate-500">China → India ERP</p>
        </div>
      </div>
      <p className="relative px-6 pb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Workspace</p>
      <nav className="scroll-thin relative flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.filter((n) => allowed.includes(n.key)).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-teal-500/80 text-white shadow-lg shadow-cyan-900/50 ring-1 ring-white/10' : 'hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="relative m-3 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-amber-500 text-sm font-semibold text-white">
            {user.name.split(' ').map((p) => p[0]).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.role}</p>
          </div>
          <button
            title="Log out"
            onClick={() => {
              setUser(null)
              navigate('/login')
            }}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-full">
      <div className="hidden lg:block">{sidebar}</div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setOpen(false)} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70 sm:px-6 lg:px-10 2xl:px-12">
          <button className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search shipment ID, client, shipping mark…"
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/shipments?q=${encodeURIComponent(e.target.value)}`)}
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 ring-1 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20 md:inline">
              {user.role}
            </span>
            <button className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Notifications">
              <Bell size={18} />
              {awaiting > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />}
            </button>
            <button onClick={() => setDark(!dark)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="scroll-thin flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.10),transparent_45%),radial-gradient(ellipse_at_top_left,rgba(6,182,212,0.07),transparent_40%)] px-4 py-6 sm:px-6 lg:px-10 lg:py-8 2xl:px-12">
          <div className="animate-fade-up mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>

      {toast && (
        <div className="animate-fade-up fixed bottom-6 right-6 z-[60] rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-2xl dark:bg-white dark:text-slate-900">
          ✓ {toast}
        </div>
      )}
    </div>
  )
}
