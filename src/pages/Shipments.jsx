import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plane, Ship } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SHIPMENT_STATUSES } from '../data/mock'
import { Badge, PageHeader, SearchInput, Table, Tabs } from '../components/ui'
import Select from '../components/Select'

export default function Shipments() {
  const { shipments, clientById } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('')
  const [mode, setMode] = useState('All')

  const list = shipments.filter((s) => {
    const c = clientById(s.clientId)
    return (
      (!status || s.status === status) &&
      (mode === 'All' || s.mode === mode) &&
      `${s.id} ${c?.company} ${c?.mark} ${s.inquiryId}`.toLowerCase().includes(q.toLowerCase())
    )
  })

  const stepIndex = (s) => SHIPMENT_STATUSES.indexOf(s.status)

  return (
    <>
      <PageHeader title="Shipments" subtitle="Centralized shipment records visible to all authorized departments. New shipments are created from accepted quotations." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Shipment ID, client, mark…" />
        <Select className="w-64" value={status} onChange={setStatus} options={[{ value: '', label: 'All statuses' }, ...SHIPMENT_STATUSES]} />
        <Tabs tabs={['All', 'Sea', 'Air']} value={mode} onChange={setMode} />
      </div>

      <div className="card">
        <Table
          rows={list}
          onRowClick={(s) => navigate(`/shipments/${s.id}`)}
          columns={[
            { key: 'id', label: 'Shipment ID', render: (s) => <span className="font-semibold text-slate-900 dark:text-white">{s.id}</span> },
            {
              key: 'client', label: 'Client / Mark', render: (s) => (
                <div>
                  <p>{clientById(s.clientId)?.company}</p>
                  <p className="font-mono text-xs text-slate-400">{clientById(s.clientId)?.mark}</p>
                </div>
              ),
            },
            { key: 'mode', label: 'Mode', render: (s) => <span className="flex items-center gap-1.5">{s.mode === 'Air' ? <Plane size={14} className="text-cyan-500" /> : <Ship size={14} className="text-brand-500" />}{s.mode}</span> },
            { key: 'pk', label: 'Pkgs / Wt / Vol', render: (s) => <span className="text-slate-500">{s.packages || '—'} · {s.grossWeight} kg · {s.volume} CBM</span> },
            {
              key: 'progress', label: 'Progress', render: (s) => (
                <div className="flex w-32 gap-0.5">
                  {SHIPMENT_STATUSES.map((st, i) => (
                    <span key={st} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex(s) ? 'bg-gradient-to-r from-brand-500 to-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  ))}
                </div>
              ),
            },
            { key: 'status', label: 'Status', render: (s) => <Badge>{s.status}</Badge> },
            { key: 'team', label: 'Responsible', render: (s) => <span className="text-slate-500">{s.team}</span> },
            { key: 'eta', label: 'ETA' },
          ]}
        />
      </div>
    </>
  )
}
