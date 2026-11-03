import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, Download, FileSpreadsheet, History, Package, RotateCcw, Truck, Users, Warehouse } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SHIPMENT_STATUSES } from '../data/mock'
import { Badge, Button, PageHeader, Table, inr, inrShort } from '../components/ui'
import { deliveredOn, downloadCSV, isOnTime, sum, transitDays } from '../lib/analytics'
import Select from '../components/Select'

const REPORTS = [
  { key: 'shipments', label: 'Shipment register', icon: Package, tone: 'from-teal-500 to-cyan-600' },
  { key: 'quotations', label: 'Quotations', icon: ClipboardList, tone: 'from-amber-500 to-sky-600' },
  { key: 'warehouse', label: 'Warehouse receiving', icon: Warehouse, tone: 'from-amber-400 to-orange-500' },
  { key: 'deliveries', label: 'Final deliveries', icon: Truck, tone: 'from-emerald-400 to-teal-500' },
  { key: 'clients', label: 'Client summary', icon: Users, tone: 'from-cyan-400 to-sky-500' },
  { key: 'audit', label: 'Audit trail', icon: History, tone: 'from-rose-500 to-orange-500' },
]

const EMPTY_FILTERS = { q: '', client: '', status: '', mode: '', from: '', to: '' }

export default function Reports() {
  const { shipments, inquiries, clients, clientById, audit, notify } = useApp()
  const navigate = useNavigate()
  const [tab, setTab] = useState('shipments')
  const [f, setF] = useState(EMPTY_FILTERS)
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const text = (...parts) => parts.join(' ').toLowerCase().includes(f.q.toLowerCase())
  const inDates = (d) => (!f.from || d >= f.from) && (!f.to || d <= f.to)
  const company = (id) => clientById(id)?.company ?? id

  // Each report: filtered rows, table columns (with CSV accessors), summary tiles
  const reports = {
    shipments: () => {
      const rows = shipments.filter(
        (s) => text(s.id, company(s.clientId), clientById(s.clientId)?.mark, s.partner) && (!f.client || s.clientId === f.client) &&
          (!f.status || s.status === f.status) && (!f.mode || s.mode === f.mode) && inDates(s.created),
      )
      return {
        rows, onRowClick: (s) => navigate(`/shipments/${s.id}`),
        summary: [['Shipments', rows.length], ['Revenue', inrShort(sum(rows, (s) => s.revenue))], ['Gross weight', `${(sum(rows, (s) => s.grossWeight) / 1000).toFixed(1)} t`], ['Volume', `${sum(rows, (s) => s.volume).toFixed(0)} CBM`]],
        columns: [
          { key: 'id', label: 'Shipment', csv: (s) => s.id, render: (s) => <span className="font-semibold">{s.id}</span> },
          { key: 'created', label: 'Created', csv: (s) => s.created },
          { key: 'client', label: 'Client / mark', csv: (s) => company(s.clientId), render: (s) => <div><p>{company(s.clientId)}</p><p className="font-mono text-[11px] text-slate-400">{clientById(s.clientId)?.mark}</p></div> },
          { key: 'mark', label: 'Mark', className: 'hidden', csv: (s) => clientById(s.clientId)?.mark, render: () => null },
          { key: 'lane', label: 'Lane', csv: (s) => `${s.origin} > ${s.destination}`, render: (s) => <span className="text-slate-500">{s.origin} → {s.destination}</span> },
          { key: 'mode', label: 'Mode', csv: (s) => s.mode },
          { key: 'grossWeight', label: 'Weight', className: 'text-right tabular-nums', csv: (s) => s.grossWeight, render: (s) => `${s.grossWeight.toLocaleString('en-IN')} kg` },
          { key: 'revenue', label: 'Revenue', className: 'text-right tabular-nums', csv: (s) => s.revenue, render: (s) => inr(s.revenue) },
          { key: 'status', label: 'Status', csv: (s) => s.status, render: (s) => <Badge>{s.status}</Badge> },
        ],
      }
    },
    quotations: () => {
      const rows = inquiries
        .flatMap((i) => i.quotes.map((q) => ({ ...q, id: `${i.id}-v${q.version}`, inq: i, best: Math.min(...i.rates.map((r) => r.rate)) })))
        .filter((q) => text(q.inq.id, company(q.inq.clientId), q.inq.goods) && (!f.client || q.inq.clientId === f.client) && (!f.mode || q.inq.mode === f.mode) && inDates(q.inq.date))
      return {
        rows,
        summary: [['Quotations', rows.length], ['Quoted value', inrShort(sum(rows, (q) => q.amount))], ['Accepted', rows.filter((q) => q.status === 'Accepted').length], ['Rejected / expired', rows.filter((q) => ['Rejected', 'Expired'].includes(q.status)).length]],
        columns: [
          { key: 'inq', label: 'Inquiry', csv: (q) => q.inq.id, render: (q) => <span className="font-semibold">{q.inq.id}</span> },
          { key: 'version', label: 'Ver.', csv: (q) => q.version, render: (q) => `v${q.version}` },
          { key: 'date', label: 'Date', csv: (q) => q.inq.date, render: (q) => q.inq.date },
          { key: 'client', label: 'Client', csv: (q) => company(q.inq.clientId), render: (q) => company(q.inq.clientId) },
          { key: 'goods', label: 'Goods', csv: (q) => q.inq.goods, render: (q) => q.inq.goods },
          { key: 'amount', label: 'Amount', className: 'text-right tabular-nums', csv: (q) => q.amount, render: (q) => inr(q.amount) },
          { key: 'margin', label: 'Margin', className: 'text-right tabular-nums', csv: (q) => q.amount - q.best, render: (q) => <span className="text-emerald-600 dark:text-emerald-400">{(((q.amount - q.best) / q.amount) * 100).toFixed(1)}%</span> },
          { key: 'validity', label: 'Valid till', csv: (q) => q.validity },
          { key: 'status', label: 'Status', csv: (q) => q.status, render: (q) => <Badge>{q.status}</Badge> },
        ],
      }
    },
    warehouse: () => {
      const rows = shipments
        .filter((s) => s.warehouse)
        .filter((s) => text(s.id, company(s.clientId), s.warehouse.staff) && (!f.client || s.clientId === f.client) && (!f.mode || s.mode === f.mode) && inDates(s.warehouse.receivedOn))
      return {
        rows, onRowClick: (s) => navigate(`/shipments/${s.id}`),
        summary: [['Receipts', rows.length], ['Packages', sum(rows, (s) => s.warehouse.packages).toLocaleString('en-IN')], ['With discrepancy', rows.filter((s) => s.warehouse.condition !== 'Good').length], ['Dispatched', rows.filter((s) => s.dispatch).length]],
        columns: [
          { key: 'id', label: 'Shipment', csv: (s) => s.id, render: (s) => <span className="font-semibold">{s.id}</span> },
          { key: 'receivedOn', label: 'Received', csv: (s) => s.warehouse.receivedOn, render: (s) => s.warehouse.receivedOn },
          { key: 'client', label: 'Client', csv: (s) => company(s.clientId), render: (s) => company(s.clientId) },
          { key: 'pk', label: 'Pkgs', className: 'text-right tabular-nums', csv: (s) => s.warehouse.packages, render: (s) => s.warehouse.packages },
          { key: 'wt', label: 'Actual wt', className: 'text-right tabular-nums', csv: (s) => s.warehouse.actualWeight, render: (s) => `${s.warehouse.actualWeight} kg` },
          { key: 'cond', label: 'Condition', csv: (s) => s.warehouse.condition, render: (s) => <Badge>{s.warehouse.condition}</Badge> },
          { key: 'staff', label: 'Staff', csv: (s) => s.warehouse.staff, render: (s) => s.warehouse.staff },
          { key: 'dn', label: 'Delivery note', csv: (s) => s.dispatch?.note ?? '', render: (s) => <span className="font-mono text-xs">{s.dispatch?.note ?? '—'}</span> },
          { key: 'partner', label: 'Partner', csv: (s) => s.dispatch?.partner ?? '', render: (s) => s.dispatch?.partner ?? '—' },
        ],
      }
    },
    deliveries: () => {
      const rows = shipments
        .filter((s) => s.delivery)
        .map((s) => ({ ...s, deliveredOn: deliveredOn(s), onTime: isOnTime(s), transit: transitDays(s) }))
        .filter((s) => text(s.id, company(s.clientId), s.delivery.tracking) && (!f.client || s.clientId === f.client) && (!f.mode || s.mode === f.mode) && inDates(s.deliveredOn ?? s.created))
      const known = rows.filter((r) => r.onTime !== null)
      return {
        rows, onRowClick: (s) => navigate(`/shipments/${s.id}`),
        summary: [['Deliveries', rows.length], ['Delivery charges', inrShort(sum(rows, (s) => s.delivery.charges))], ['On-time', `${known.length ? ((known.filter((r) => r.onTime).length / known.length) * 100).toFixed(0) : 0}%`], ['POD uploaded', rows.filter((s) => s.delivery.proof).length]],
        columns: [
          { key: 'id', label: 'Shipment', csv: (s) => s.id, render: (s) => <span className="font-semibold">{s.id}</span> },
          { key: 'client', label: 'Client', csv: (s) => company(s.clientId), render: (s) => company(s.clientId) },
          { key: 'method', label: 'Method', csv: (s) => s.delivery.method, render: (s) => s.delivery.method },
          { key: 'charges', label: 'Charges', className: 'text-right tabular-nums', csv: (s) => s.delivery.charges, render: (s) => inr(s.delivery.charges) },
          { key: 'tracking', label: 'Tracking / LR', csv: (s) => s.delivery.tracking, render: (s) => <span className="font-mono text-xs">{s.delivery.tracking}</span> },
          { key: 'deliveredOn', label: 'Delivered', csv: (s) => s.deliveredOn ?? '', render: (s) => s.deliveredOn ?? '—' },
          { key: 'onTime', label: 'On time', csv: (s) => (s.onTime == null ? '' : s.onTime ? 'Yes' : 'No'), render: (s) => (s.onTime == null ? '—' : <Badge tone={s.onTime ? 'emerald' : 'rose'}>{s.onTime ? 'On time' : 'Late'}</Badge>) },
          { key: 'status', label: 'Status', csv: (s) => s.delivery.status, render: (s) => <Badge>{s.delivery.status}</Badge> },
          { key: 'proof', label: 'POD', csv: (s) => (s.delivery.proof ? 'Yes' : 'No'), render: (s) => (s.delivery.proof ? '✓' : '—') },
        ],
      }
    },
    clients: () => {
      const rows = clients
        .filter((c) => text(c.company, c.mark, c.city) && (!f.client || c.id === f.client))
        .map((c) => {
          const ss = shipments.filter((s) => s.clientId === c.id && (!f.mode || s.mode === f.mode) && inDates(s.created))
          const rev = sum(ss, (s) => s.revenue)
          return { ...c, count: ss.length, revenue: rev, margin: rev ? ((rev - sum(ss, (s) => s.cost)) / rev) * 100 : 0, active: ss.filter((s) => !['Delivered', 'Closed'].includes(s.status)).length, last: ss[0]?.created ?? '—' }
        })
        .sort((a, b) => b.revenue - a.revenue)
      return {
        rows,
        summary: [['Clients', rows.length], ['With shipments', rows.filter((r) => r.count).length], ['Total revenue', inrShort(sum(rows, (r) => r.revenue))], ['Open shipments', sum(rows, (r) => r.active)]],
        columns: [
          { key: 'company', label: 'Client', csv: (c) => c.company, render: (c) => <span className="font-semibold">{c.company}</span> },
          { key: 'mark', label: 'Mark', csv: (c) => c.mark, render: (c) => <span className="font-mono text-xs">{c.mark}</span> },
          { key: 'city', label: 'City', csv: (c) => c.city },
          { key: 'count', label: 'Shipments', className: 'text-right tabular-nums', csv: (c) => c.count },
          { key: 'active', label: 'Open', className: 'text-right tabular-nums', csv: (c) => c.active },
          { key: 'revenue', label: 'Revenue', className: 'text-right tabular-nums', csv: (c) => c.revenue, render: (c) => inr(c.revenue) },
          { key: 'margin', label: 'Margin', className: 'text-right tabular-nums', csv: (c) => c.margin.toFixed(1), render: (c) => `${c.margin.toFixed(1)}%` },
          { key: 'last', label: 'Last booking', csv: (c) => c.last },
        ],
      }
    },
    audit: () => {
      const rows = audit.map((a, i) => ({ ...a, id: i })).filter((a) => text(a.user, a.action, a.ref, a.to) && inDates(a.at.slice(0, 10)))
      return {
        rows,
        summary: [['Events', rows.length], ['Users', new Set(rows.map((r) => r.user)).size], ['Records touched', new Set(rows.map((r) => r.ref)).size], ['Status changes', rows.filter((r) => r.field === 'status').length]],
        columns: [
          { key: 'at', label: 'Timestamp', csv: (a) => a.at, render: (a) => <span className="font-mono text-xs">{a.at}</span> },
          { key: 'user', label: 'User', csv: (a) => a.user },
          { key: 'action', label: 'Action', csv: (a) => a.action },
          { key: 'ref', label: 'Record', csv: (a) => a.ref, render: (a) => <span className="font-semibold">{a.ref}</span> },
          { key: 'field', label: 'Field', csv: (a) => a.field },
          { key: 'change', label: 'Change', csv: (a) => `${a.from} > ${a.to}`, render: (a) => <span className="text-xs"><span className="text-rose-500 line-through">{a.from}</span> → <span className="text-emerald-600 dark:text-emerald-400">{a.to}</span></span> },
        ],
      }
    },
  }

  const report = reports[tab]()
  const meta = REPORTS.find((r) => r.key === tab)
  const showStatus = tab === 'shipments'
  const showClient = tab !== 'audit'
  const showMode = tab !== 'audit'

  const exportCSV = () => {
    downloadCSV(`shipflow-${tab}-${new Date().toISOString().slice(0, 10)}.csv`, report.columns, report.rows)
    notify(`Exported ${report.rows.length} rows`)
  }

  return (
    <>
      <PageHeader
        title="Reports & Shipment History"
        subtitle="Operational registers with filters, lifecycle history and a full audit trail — export any view to CSV."
        actions={<Button onClick={exportCSV}><Download size={16} /> Export CSV</Button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {REPORTS.map((r) => (
          <button
            key={r.key}
            onClick={() => setTab(r.key)}
            className={`card flex items-center gap-3 p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${tab === r.key ? 'ring-2 ring-brand-500 dark:ring-brand-400' : ''}`}
          >
            <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-md ${r.tone}`}><r.icon size={17} /></span>
            <span className="text-sm font-semibold leading-tight">{r.label}</span>
          </button>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {report.summary.map(([label, value]) => (
          <div key={label} className="card relative overflow-hidden p-4">
            <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${meta.tone}`} />
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="mr-auto flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-brand-500" />
            <h3 className="font-semibold">{meta.label}</h3>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{report.rows.length}</span>
          </div>
          <input className="input w-48" placeholder="Search…" value={f.q} onChange={(e) => set('q', e.target.value)} />
          {showClient && (
            <Select className="w-56" value={f.client} onChange={(v) => set('client', v)} options={[{ value: '', label: 'All clients' }, ...clients.map((c) => ({ value: c.id, label: c.company, hint: c.mark }))]} />
          )}
          {showStatus && (
            <Select className="w-56" value={f.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All statuses' }, ...SHIPMENT_STATUSES]} />
          )}
          {showMode && (
            <Select className="w-32" value={f.mode} onChange={(v) => set('mode', v)} options={[{ value: '', label: 'Sea & Air' }, 'Sea', 'Air']} />
          )}
          <input type="date" className="input w-40" value={f.from} onChange={(e) => set('from', e.target.value)} title="From" />
          <input type="date" className="input w-40" value={f.to} onChange={(e) => set('to', e.target.value)} title="To" />
          <Button variant="ghost" size="sm" onClick={() => setF(EMPTY_FILTERS)} title="Reset filters"><RotateCcw size={14} /> Reset</Button>
        </div>
        <Table key={tab} rows={report.rows} columns={report.columns} onRowClick={report.onRowClick} label="records" />
      </div>
    </>
  )
}
