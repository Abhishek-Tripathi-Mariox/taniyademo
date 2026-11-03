import { Link, useNavigate } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertCircle, ArrowRight, Boxes, Clock, IndianRupee, PackageCheck, Ship } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SHIPMENT_STATUSES, TODAY } from '../data/mock'
import { Badge, Pagination, StatCard, Table, inrShort, usePagination } from '../components/ui'
import { ChartCard, ChartTooltip, RankedBars, axisProps, useChartTheme } from '../components/charts'
import { lastMonths, monthKey, monthLabel, pctChange, sum } from '../lib/analytics'

export default function Dashboard() {
  const { user, shipments, inquiries, clientById } = useApp()
  const navigate = useNavigate()
  const t = useChartTheme()

  const active = shipments.filter((s) => !['Delivered', 'Closed'].includes(s.status))
  const awaiting = shipments.filter((s) => s.status === 'Awaiting Client Instructions')
  const inChina = shipments.filter((s) => ['Booked', 'Received at China Warehouse'].includes(s.status))

  const months = lastMonths(7).slice(0, 6) // last six complete months
  const volume = months.map((m) => {
    const ms = shipments.filter((s) => monthKey(s.created) === m)
    return { month: monthLabel(m), sea: ms.filter((s) => s.mode === 'Sea').length, air: ms.filter((s) => s.mode === 'Air').length, revenue: sum(ms, (s) => s.revenue) }
  })
  const lastRev = volume.at(-1).revenue
  const prevRev = volume.at(-2).revenue

  // Live pipeline: every open stage, in lifecycle order
  const openStages = SHIPMENT_STATUSES.slice(0, 7)
  const pipeline = openStages.map((st) => ({ label: st, value: shipments.filter((s) => s.status === st).length }))

  const pending = [
    ...awaiting.map((s) => ({ id: s.id, what: 'Awaiting client instructions', who: clientById(s.clientId)?.company, to: `/shipments/${s.id}`, team: 'India Ops', urgent: true })),
    ...inquiries.filter((i) => i.status === 'Pending').map((i) => ({ id: i.id, what: 'Prepare quotation', who: clientById(i.clientId)?.company, to: '/inquiries', team: 'Sales' })),
    ...inquiries.filter((i) => i.status === 'Quoted').map((i) => ({ id: i.id, what: 'Follow up on quotation', who: clientById(i.clientId)?.company, to: '/inquiries', team: 'Sales' })),
    ...shipments.filter((s) => s.status === 'Booked').map((s) => ({ id: s.id, what: 'Receive goods at warehouse', who: clientById(s.clientId)?.company, to: `/shipments/${s.id}`, team: 'China Ops' })),
    ...shipments.filter((s) => s.status === 'Received at China Warehouse').map((s) => ({ id: s.id, what: 'Generate delivery note & dispatch', who: clientById(s.clientId)?.company, to: `/shipments/${s.id}`, team: 'China Ops' })),
    ...shipments.filter((s) => s.status === 'Arrived in India').map((s) => ({ id: s.id, what: 'Request delivery instructions', who: clientById(s.clientId)?.company, to: `/shipments/${s.id}`, team: 'India Ops' })),
  ]
  const pg = usePagination(pending, 5)

  return (
    <>
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-cyan-600 to-sky-700 p-6 text-white shadow-xl shadow-teal-500/20 sm:p-8">
        <div className="absolute -right-10 -top-16 h-64 w-64 rounded-full bg-cyan-300/30 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-amber-300/40 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-white/70">{new Date(TODAY).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Good morning, {user.name.split(' ')[0]} 👋</h1>
            <p className="mt-1 text-sm text-white/80">{active.length} shipments are moving across the China → India corridor right now.</p>
          </div>
          <div className="flex gap-3">
            {[['Open inquiries', inquiries.filter((i) => ['Pending', 'Quoted'].includes(i.status)).length], ['Needs action', pending.length]].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-white/15 px-4 py-3 ring-1 ring-white/20 backdrop-blur">
                <p className="text-2xl font-bold">{v}</p>
                <p className="text-xs text-white/75">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} tone="indigo" label="Active shipments" value={active.length} hint={`${shipments.length} on record`} />
        <StatCard icon={Ship} tone="amber" label="At China warehouse" value={inChina.length} hint="Booked or received" />
        <StatCard icon={AlertCircle} tone="rose" label="Awaiting instructions" value={awaiting.length} hint="Client action needed" />
        <StatCard icon={IndianRupee} tone="emerald" label={`Revenue · ${volume.at(-1).month}`} value={inrShort(lastRev)} delta={pctChange(lastRev, prevRev)} hint="vs previous month" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Shipment volume"
          subtitle="Bookings per month, last six months"
          legend={[{ label: 'Sea', color: t.series[0], line: true }, { label: 'Air', color: t.series[1], line: true }]}
          actions={<Link to="/analytics" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Analytics <ArrowRight size={14} /></Link>}
        >
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={volume} margin={{ left: -24, right: 8, top: 8 }}>
                <CartesianGrid stroke={t.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps(t)} />
                <YAxis allowDecimals={false} {...axisProps(t)} />
                <Tooltip cursor={{ stroke: t.axis, strokeWidth: 1 }} content={<ChartTooltip />} />
                <Area type="monotone" dataKey="sea" name="Sea" stroke={t.series[0]} strokeWidth={2} fill={t.series[0]} fillOpacity={0.1} dot={{ r: 4, fill: t.series[0], stroke: t.surface, strokeWidth: 2 }} />
                <Area type="monotone" dataKey="air" name="Air" stroke={t.series[1]} strokeWidth={2} fill={t.series[1]} fillOpacity={0.1} dot={{ r: 4, fill: t.series[1], stroke: t.surface, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Live pipeline" subtitle="Open shipments by lifecycle stage">
          <RankedBars items={pipeline} colors={t.ordinal(pipeline.length)} />
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <div className="card xl:col-span-3">
          <div className="flex items-center justify-between px-6 pb-3 pt-5">
            <h3 className="font-semibold">Recent shipments</h3>
            <Link to="/shipments" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <Table
            pageSize={5}
            label="shipments"
            onRowClick={(s) => navigate(`/shipments/${s.id}`)}
            rows={shipments}
            columns={[
              { key: 'id', label: 'Shipment', render: (s) => <span className="font-semibold text-slate-900 dark:text-white">{s.id}</span> },
              { key: 'client', label: 'Client', render: (s) => clientById(s.clientId)?.company },
              { key: 'mode', label: 'Mode' },
              { key: 'status', label: 'Status', render: (s) => <Badge>{s.status}</Badge> },
            ]}
          />
        </div>

        <div className="card flex flex-col xl:col-span-2">
          <div className="flex items-center gap-2 px-6 pb-3 pt-5">
            <Clock size={16} className="text-amber-500" />
            <h3 className="font-semibold">Pending activities</h3>
            <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{pending.length}</span>
          </div>
          <div className="flex-1 space-y-2 px-5">
            {pg.rows.map((p) => (
              <Link
                key={p.id + p.what}
                to={p.to}
                className={`flex items-center gap-3 rounded-xl border p-3 transition hover:shadow-sm ${p.urgent ? 'border-rose-200 bg-rose-50/60 dark:border-rose-500/20 dark:bg-rose-500/5' : 'border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 dark:border-slate-800 dark:hover:bg-slate-800/50'}`}
              >
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${p.urgent ? 'text-rose-700 dark:text-rose-300' : ''}`}>{p.what}</p>
                  <p className="truncate text-xs text-slate-500">{p.id} · {p.who}</p>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-800">{p.team}</span>
              </Link>
            ))}
            {pending.length === 0 && (
              <p className="flex items-center gap-2 py-8 text-sm text-slate-400"><PackageCheck size={16} /> All caught up</p>
            )}
          </div>
          {pending.length > 0 && (
            <div className="mt-2 border-t border-slate-100 dark:border-slate-800">
              <Pagination {...pg} label="tasks" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
