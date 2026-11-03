import { useState } from 'react'
import { Building2, Mail, MapPin, Pencil, Phone, Plus, Tag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge, Button, Field, Modal, PageHeader, Pagination, SearchInput, Tabs, usePagination } from '../components/ui'
import Select from '../components/Select'

const EMPTY = { company: '', contact: '', phone: '', email: '', city: '', address: '', mark: '', active: true }

export default function Clients() {
  const { clients, shipments, saveClient } = useApp()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const [editing, setEditing] = useState(null)

  const list = clients.filter(
    (c) =>
      (tab === 'All' || (tab === 'Active') === c.active) &&
      `${c.company} ${c.contact} ${c.mark} ${c.city}`.toLowerCase().includes(q.toLowerCase()),
  )

  const pg = usePagination(list, 9)
  const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }))

  return (
    <>
      <PageHeader
        title="Clients"
        subtitle="Client profiles with permanent shipping marks reused across all shipments."
        actions={<Button onClick={() => setEditing(EMPTY)}><Plus size={16} /> New client</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search company, mark, city…" />
        <Tabs tabs={['All', 'Active', 'Inactive']} value={tab} onChange={setTab} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {pg.rows.map((c) => {
          const count = shipments.filter((s) => s.clientId === c.id).length
          return (
            <div key={c.id} className="card group p-5 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-100 to-cyan-100 text-brand-700 dark:from-brand-500/20 dark:to-cyan-500/20 dark:text-brand-300">
                  <Building2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900 dark:text-white">{c.company}</p>
                  <p className="text-xs text-slate-500">{c.id} · since {c.since}</p>
                </div>
                <Badge>{c.active ? 'Active' : 'Inactive'}</Badge>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-white dark:bg-white dark:text-slate-900">
                <Tag size={14} /> {c.mark}
              </div>

              <div className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-2"><span className="w-4 text-slate-400">👤</span>{c.contact}</p>
                <p className="flex items-center gap-2"><Phone size={14} className="text-slate-400" />{c.phone}</p>
                <p className="flex items-center gap-2"><Mail size={14} className="text-slate-400" />{c.email}</p>
                <p className="flex items-start gap-2"><MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" /><span className="line-clamp-1">{c.address}</span></p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                <span className="text-xs text-slate-500"><b className="text-slate-800 dark:text-slate-100">{count}</b> shipments</span>
                <Button variant="ghost" size="sm" onClick={() => setEditing(c)}><Pencil size={14} /> Edit</Button>
              </div>
            </div>
          )
        })}
      </div>

      {list.length > 0 && (
        <div className="card mt-6">
          <Pagination {...pg} label="clients" sizes={[6, 9, 18, 36]} />
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? `Edit ${editing.company}` : 'New client'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              disabled={!editing?.company || !editing?.mark}
              onClick={() => {
                saveClient(editing)
                setEditing(null)
              }}
            >
              Save client
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" className="sm:col-span-2"><input className="input" value={editing.company} onChange={(e) => set('company', e.target.value)} /></Field>
            <Field label="Contact person"><input className="input" value={editing.contact} onChange={(e) => set('contact', e.target.value)} /></Field>
            <Field label="Phone"><input className="input" value={editing.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="Email"><input className="input" value={editing.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="City"><input className="input" value={editing.city} onChange={(e) => set('city', e.target.value)} /></Field>
            <Field label="Address" className="sm:col-span-2"><textarea rows={2} className="input" value={editing.address} onChange={(e) => set('address', e.target.value)} /></Field>
            <Field label="Permanent shipping mark">
              <input
                className="input font-mono uppercase disabled:opacity-60"
                disabled={!!editing.id}
                value={editing.mark}
                placeholder="e.g. ABC-MUM"
                onChange={(e) => set('mark', e.target.value.toUpperCase())}
              />
              {editing.id && <span className="mt-1 block text-[11px] text-slate-400">Mark is permanent once assigned</span>}
            </Field>
            <Field label="Status">
              <Select value={editing.active ? '1' : '0'} onChange={(v) => set('active', v === '1')} options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Inactive' }]} />
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
