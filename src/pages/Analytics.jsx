import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Boxes, Download, IndianRupee, Percent, Target, Timer, TrendingUp, Trophy } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button, PageHeader, StatCard, Table, Tabs, inr, inrShort } from '../components/ui'
import { ChartCard, ChartTooltip, RankedBars, Sparkline, axisProps, useChartTheme } from '../components/charts'
import { TODAY } from '../data/mock'
import { avg, downloadCSV, isOnTime, lastMonths, monthKey, monthLabel, pctChange, sum, transitDays } from '../lib/analytics'
import Select from '../components/Select'

const RANGES = { '3M': 3, '6M': 6, '12M': 12 }
const DECIDED = ['Accepted', 'Converted', 'Rejected', 'Expired']

function summarize(ships, inqs) {
  const revenue = sum(ships, (s) => s.revenue)
  const cost = sum(ships, (s) => s.cost)
  const delivered = ships.map(isOnTime).filter((v) => v !== null)
  const decided = inqs.filter((i) => DECIDED.includes(i.status))
  return {
    revenue, cost, margin: revenue - cost,
    marginPct: revenue ? ((revenue - cost) / revenue) * 100 : 0,
    count: ships.length,
    transit: avg(ships.map(transitDays).filter((v) => v !== null)),
    winRate: decided.length ? (decided.filter((i) => ['Accepted', 'Converted'].includes(i.status)).length / decided.length) * 100 : 0,
    onTime: delivered.length ? (delivered.filter(Boolean).length / delivered.length) * 100 : 0,
  }
}

export default function Analytics() {
  const { shipments, inquiries, clients, clientById } = useApp()
  const t = useChartTheme()
  const [range, setRange] = useState('12M')
  const [mode, setMode] = useState('All')
  const [client, setClient] = useState('')

  const n = RANGES[range]
  // Complete months only; the running month would read as a drop
  const months = lastMonths(n + 1).slice(0, n)
  const prevMonths = lastMonths(n * 2 + 1).slice(0, n)
  const firstMonth = monthKey(shipments.at(-1)?.created ?? TODAY)
  const comparable = prevMonths[0] >= firstMonth
  const delta = (a, b) => (comparable ? pctChange(a, b) : null)
  const vsHint = comparable ? 'vs prev. period' : 'no prior period'

  const match = (x) => (mode === 'All' || x.mode === mode) && (!client || x.clientId === client)
  const inPeriod = (list, ms, dateKey) => list.filter((x) => match(x) && ms.includes(monthKey(x[dateKey])))

  const cur = inPeriod(shipments, months, 'created')
  const prev = inPeriod(shipments, prevMonths, 'created')
  const curInq = inPeriod(inquiries, months, 'date')
  const prevInq = inPeriod(inquiries, prevMonths, 'date')
  const k = summarize(cur, curInq)
  const kp = summarize(prev, prevInq)

  const monthly = useMemo(
    () =>
      months.map((m) => {
        const ms = cur.filter((s) => monthKey(s.created) === m)
        const revenue = sum(ms, (s) => s.revenue)
        const cost = sum(ms, (s) => s.cost)
        const tSea = ms.filter((s) => s.mode === 'Sea').map(transitDays).filter((v) => v !== null)
        const tAir = ms.filter((s) => s.mode === 'Air').map(transitDays).filter((v) => v !== null)
        return {
          month: monthLabel(m), revenue, cost, margin: revenue - cost, count: ms.length,
          sea: ms.filter((s) => s.mode === 'Sea').length, air: ms.filter((s) => s.mode === 'Air').length,
          transitSea: tSea.length ? +avg(tSea).toFixed(1) : null, transitAir: tAir.length ? +avg(tAir).toFixed(1) : null,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [range, mode, client, shipments],
  )

  const funnel = [
    { label: 'Inquiries received', value: curInq.length },
    { label: 'Quotations issued', value: curInq.filter((i) => i.quotes.length).length },
    { label: 'Quotes accepted', value: curInq.filter((i) => ['Accepted', 'Converted'].includes(i.status)).length },
    { label: 'Converted to shipment', value: curInq.filter((i) => i.status === 'Converted').length },
  ]

  const topClients = Object.entries(
    cur.reduce((acc, s) => ({ ...acc, [s.clientId]: (acc[s.clientId] || 0) + s.revenue }), {}),
  )
    .map(([id, value]) => ({ label: clientById(id)?.company ?? id, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)

  const withDelivery = cur.filter((s) => s.delivery)
  const methods = Object.entries(withDelivery.reduce((acc, s) => ({ ...acc, [s.delivery.method]: (acc[s.delivery.method] || 0) + 1 }), {}))
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)

  const group = (key) =>
    Object.values(
      cur.reduce((acc, s) => {
        const g = key(s)
        ;(acc[g] ||= { id: g, items: [] }).items.push(s)
        return acc
      }, {}),
    )

  const partners = group((s) => s.partner)
    .map(({ id, items }) => {
      const onTime = items.map(isOnTime).filter((v) => v !== null)
      return {
        id, shipments: items.length, revenue: sum(items, (s) => s.revenue),
        costPerKg: sum(items, (s) => s.cost) / Math.max(sum(items, (s) => s.grossWeight), 1),
        transit: avg(items.map(transitDays).filter((v) => v !== null)),
        onTime: onTime.length ? (onTime.filter(Boolean).length / onTime.length) * 100 : null,
        damage: (items.filter((s) => s.warehouse && s.warehouse.condition !== 'Good').length / items.length) * 100,
      }
    })
    .sort((a, b) => b.shipments - a.shipments)

  const lanes = group((s) => `${s.origin} → ${s.destination}`)
    .map(({ id, items }) => {
      const revenue = sum(items, (s) => s.revenue)
      return { id, shipments: items.length, cbm: sum(items, (s) => s.volume), revenue, margin: revenue ? ((revenue - sum(items, (s) => s.cost)) / revenue) * 100 : 0 }
    })
    .sort((a, b) => b.revenue - a.revenue)

  const maxLane = Math.max(...lanes.map((l) => l.revenue), 1)
  const spark = (key) => monthly.map((m) => ({ v: m[key] }))

  const exportMonthly = () =>
    downloadCSV(`shipflow-analytics-${range}.csv`, [
      { label: 'Month', csv: (r) => r.month },
      { label: 'Shipments', csv: (r) => r.count },
      { label: 'Sea', csv: (r) => r.sea },
      { label: 'Air', csv: (r) => r.air },
      { label: 'Revenue (INR)', csv: (r) => r.revenue },
      { label: 'Partner cost (INR)', csv: (r) => r.cost },
      { label: 'Gross margin (INR)', csv: (r) => r.margin },
      { label: 'Avg sea transit (days)', csv: (r) => r.transitSea ?? '' },
      { label: 'Avg air transit (days)', csv: (r) => r.transitAir ?? '' },
    ], monthly)

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Commercial performance, conversion and operational efficiency across the China → India corridor."
        actions={<Button variant="secondary" onClick={exportMonthly}><Download size={16} /> Export data</Button>}
      />

      {/* Filters: one row, above every chart */}
      <div className="card mb-6 flex flex-wrap items-center gap-3 p-3">
        <Tabs tabs={Object.keys(RANGES)} value={range} onChange={setRange} />
        <Tabs tabs={['All', 'Sea', 'Air']} value={mode} onChange={setMode} />
        <Select className="w-72" value={client} onChange={setClient} options={[{ value: '', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.company, hint: c.mark }))]} />
        <span className="ml-auto text-xs text-slate-500">
          {monthLabel(months[0])} – {monthLabel(months.at(-1))} · {comparable ? `compared with previous ${n} months` : 'full history'}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={IndianRupee} tone="indigo" label="Revenue" value={inrShort(k.revenue)} delta={delta(k.revenue, kp.revenue)} hint={vsHint}>
          <Sparkline data={spark('revenue')} color={t.series[0]} />
        </StatCard>
        <StatCard icon={TrendingUp} tone="emerald" label="Gross margin" value={inrShort(k.margin)} delta={delta(k.margin, kp.margin)} hint={`${k.marginPct.toFixed(1)}% of revenue`}>
          <Sparkline data={spark('margin')} color={t.series[2]} />
        </StatCard>
        <StatCard icon={Boxes} tone="cyan" label="Shipments booked" value={k.count} delta={delta(k.count, kp.count)} hint={vsHint}>
          <Sparkline data={spark('count')} color={t.series[0]} />
        </StatCard>
        <StatCard icon={Timer} tone="amber" label="Avg transit time" value={`${k.transit.toFixed(1)} days`} delta={delta(k.transit, kp.transit)} goodWhenDown hint="dispatch → arrival" />
        <StatCard icon={Target} tone="fuchsia" label="Quote win rate" value={`${k.winRate.toFixed(0)}%`} delta={delta(k.winRate, kp.winRate)} hint="of decided quotations" />
        <StatCard icon={Percent} tone="rose" label="On-time delivery" value={`${k.onTime.toFixed(0)}%`} delta={delta(k.onTime, kp.onTime)} hint="delivered by ETA" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <ChartCard
          className="xl:col-span-2"
          title="Revenue, cost & margin"
          subtitle="Monthly revenue split into shipping-partner cost and gross margin"
          legend={[{ label: 'Partner cost', color: t.series[0] }, { label: 'Gross margin', color: t.series[2] }]}
        >
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ left: -6, right: 4, top: 4 }} barCategoryGap="28%">
                <CartesianGrid stroke={t.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps(t)} />
                <YAxis {...axisProps(t)} tickFormatter={inrShort} width={60} />
                <Tooltip cursor={{ fill: t.grid, opacity: 0.4 }} content={<ChartTooltip format={inr} total="Revenue" />} />
                <Bar dataKey="cost" name="Partner cost" stackId="a" fill={t.series[0]} maxBarSize={24} stroke={t.surface} strokeWidth={1} />
                <Bar dataKey="margin" name="Gross margin" stackId="a" fill={t.series[2]} maxBarSize={24} radius={[4, 4, 0, 0]} stroke={t.surface} strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Quotation funnel" subtitle="From inquiry to booked shipment">
          <div className="space-y-4 pt-1">
            {funnel.map((f, i) => {
              const pct = funnel[0].value ? (f.value / funnel[0].value) * 100 : 0
              return (
                <div key={f.label}>
                  <div className="mb-1.5 flex items-baseline justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{f.label}</span>
                    <span className="tabular-nums text-slate-500">
                      <b className="text-sm text-slate-900 dark:text-white">{f.value}</b> · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-8 rounded-lg bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-lg transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%`, background: t.ordinal(4)[i] }} />
                  </div>
                </div>
              )
            })}
            <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-cyan-500/10 p-3 text-xs text-slate-600 dark:text-slate-300">
              <Trophy size={16} className="text-amber-500" />
              <span>
                Overall conversion <b className="text-slate-900 dark:text-white">{funnel[0].value ? ((funnel[3].value / funnel[0].value) * 100).toFixed(1) : 0}%</b> of inquiries became shipments
              </span>
            </div>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Shipments by mode"
          subtitle="Bookings per month, sea vs air"
          legend={[{ label: 'Sea', color: t.series[0] }, { label: 'Air', color: t.series[1] }]}
        >
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={monthly} margin={{ left: -24, right: 4, top: 4 }} barCategoryGap="28%">
                <CartesianGrid stroke={t.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps(t)} />
                <YAxis allowDecimals={false} {...axisProps(t)} />
                <Tooltip cursor={{ fill: t.grid, opacity: 0.4 }} content={<ChartTooltip total="Total" />} />
                <Bar dataKey="sea" name="Sea" stackId="m" fill={t.series[0]} maxBarSize={24} stroke={t.surface} strokeWidth={1} />
                <Bar dataKey="air" name="Air" stackId="m" fill={t.series[1]} maxBarSize={24} radius={[4, 4, 0, 0]} stroke={t.surface} strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Average transit time"
          subtitle="Days from China dispatch to India arrival, by booking month"
          legend={[{ label: 'Sea', color: t.series[0], line: true }, { label: 'Air', color: t.series[1], line: true }]}
        >
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly} margin={{ left: -24, right: 8, top: 8 }}>
                <CartesianGrid stroke={t.grid} vertical={false} />
                <XAxis dataKey="month" {...axisProps(t)} />
                <YAxis {...axisProps(t)} />
                <Tooltip cursor={{ stroke: t.axis, strokeWidth: 1 }} content={<ChartTooltip format={(v) => `${v} days`} />} />
                {[['transitSea', 'Sea', t.series[0]], ['transitAir', 'Air', t.series[1]]].map(([key, name, color]) => (
                  <Line
                    key={key} type="monotone" dataKey={key} name={name} stroke={color} strokeWidth={2} connectNulls
                    dot={{ r: 4, fill: color, stroke: t.surface, strokeWidth: 2 }} activeDot={{ r: 6, stroke: t.surface, strokeWidth: 2 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top clients by revenue" subtitle={`Top ${topClients.length} in the selected period`}>
          {topClients.length ? <RankedBars items={topClients} format={inrShort} color={t.series[0]} /> : <p className="text-sm text-slate-400">No data</p>}
        </ChartCard>
        <ChartCard title="Final delivery method mix" subtitle={`${withDelivery.length} shipments with delivery recorded`}>
          {methods.length ? (
            <RankedBars items={methods} color={t.series[2]} sub={(i) => `(${((i.value / withDelivery.length) * 100).toFixed(0)}%)`} />
          ) : (
            <p className="text-sm text-slate-400">No data</p>
          )}
        </ChartCard>
      </div>

      <div className="mt-6 grid gap-6 2xl:grid-cols-5">
        <div className="card 2xl:col-span-3">
          <div className="px-6 pb-2 pt-5">
            <h3 className="font-semibold">Shipping partner scorecard</h3>
            <p className="text-xs text-slate-500">Cost, speed, reliability and cargo condition per partner</p>
          </div>
          <Table
            paginate={false}
            rows={partners}
            columns={[
              { key: 'id', label: 'Partner', render: (p) => <span className="font-semibold">{p.id}</span> },
              { key: 'shipments', label: 'Shipments', className: 'text-right tabular-nums' },
              { key: 'revenue', label: 'Revenue', className: 'text-right tabular-nums', render: (p) => inrShort(p.revenue) },
              { key: 'cpk', label: 'Cost / kg', className: 'text-right tabular-nums', render: (p) => inr(Math.round(p.costPerKg)) },
              { key: 'transit', label: 'Avg transit', className: 'text-right tabular-nums', render: (p) => (p.transit ? `${p.transit.toFixed(1)} d` : '—') },
              {
                key: 'onTime', label: 'On-time', render: (p) =>
                  p.onTime == null ? '—' : (
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-full rounded-full" style={{ width: `${p.onTime}%`, background: t.series[2] }} />
                      </div>
                      <span className="tabular-nums text-xs">{p.onTime.toFixed(0)}%</span>
                    </div>
                  ),
              },
              { key: 'damage', label: 'Damage', className: 'text-right tabular-nums', render: (p) => `${p.damage.toFixed(0)}%` },
            ]}
          />
        </div>

        <div className="card 2xl:col-span-2">
          <div className="px-6 pb-2 pt-5">
            <h3 className="font-semibold">Top trade lanes</h3>
            <p className="text-xs text-slate-500">Origin → destination by revenue</p>
          </div>
          <Table
            pageSize={5}
            label="lanes"
            rows={lanes}
            columns={[
              {
                key: 'id', label: 'Lane', render: (l) => (
                  <div className="w-44">
                    <p className="truncate text-sm font-medium">{l.id}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div className="h-full rounded-full" style={{ width: `${(l.revenue / maxLane) * 100}%`, background: t.series[0] }} />
                    </div>
                  </div>
                ),
              },
              { key: 'shipments', label: 'Ships', className: 'text-right tabular-nums' },
              { key: 'revenue', label: 'Revenue', className: 'text-right tabular-nums', render: (l) => inrShort(l.revenue) },
              { key: 'margin', label: 'Margin', className: 'text-right tabular-nums', render: (l) => `${l.margin.toFixed(1)}%` },
            ]}
          />
        </div>
      </div>
    </>
  )
}
