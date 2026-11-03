import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check, FileText, Plane, Plus, Send, Ship, Trophy, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Badge, Button, Field, Modal, PageHeader, SearchInput, Table, Tabs, UploadBox, inr } from '../components/ui'
import Select from '../components/Select'

const EMPTY = { clientId: '', goods: '', origin: 'Shenzhen', destination: '', weight: '', volume: '', mode: 'Sea', docs: [], rates: [], sellingPrice: '' }

export default function Inquiries() {
  const { masters, inquiries, clients, clientById, saveInquiry, generateQuote, setQuoteDecision, createShipmentFromInquiry } = useApp()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('All')
  const [creating, setCreating] = useState(null)
  const [viewId, setViewId] = useState(null)
  const [newRate, setNewRate] = useState({ partner: masters.partners[0], rate: '' })
  const [validity, setValidity] = useState('2026-11-20')

  const view = inquiries.find((i) => i.id === viewId)
  const list = inquiries.filter(
    (i) => (tab === 'All' || i.status === tab) && `${i.id} ${i.goods} ${clientById(i.clientId)?.company}`.toLowerCase().includes(q.toLowerCase()),
  )
  const set = (k, v) => setCreating((c) => ({ ...c, [k]: v }))
  const best = view?.rates.length ? Math.min(...view.rates.map((r) => r.rate)) : 0

  return (
    <>
      <PageHeader
        title="Inquiries & Quotations"
        subtitle="Capture client inquiries, compare partner rates, and issue versioned quotations."
        actions={<Button onClick={() => setCreating({ ...EMPTY, origin: masters.origins[0] })}><Plus size={16} /> New inquiry</Button>}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput value={q} onChange={setQ} placeholder="Search inquiry, goods, client…" />
        <Tabs tabs={['All', 'Pending', 'Quoted', 'Accepted', 'Rejected', 'Converted']} value={tab} onChange={setTab} />
      </div>

      <div className="card">
        <Table
          rows={list}
          onRowClick={(i) => setViewId(i.id)}
          columns={[
            { key: 'id', label: 'Inquiry', render: (i) => <span className="font-semibold text-slate-900 dark:text-white">{i.id}</span> },
            { key: 'date', label: 'Date' },
            { key: 'client', label: 'Client', render: (i) => clientById(i.clientId)?.company },
            { key: 'goods', label: 'Goods' },
            { key: 'route', label: 'Route', render: (i) => <span className="flex items-center gap-1 text-slate-500">{i.origin} <ArrowRight size={12} /> {i.destination}</span> },
            { key: 'mode', label: 'Mode', render: (i) => <span className="flex items-center gap-1.5">{i.mode === 'Air' ? <Plane size={14} className="text-cyan-500" /> : <Ship size={14} className="text-brand-500" />}{i.mode}</span> },
            { key: 'sp', label: 'Selling price', className: 'text-right', render: (i) => <span className="font-medium">{inr(i.sellingPrice)}</span> },
            { key: 'status', label: 'Status', render: (i) => <Badge>{i.status}</Badge> },
          ]}
        />
      </div>

      {/* Inquiry detail */}
      <Modal open={!!view} onClose={() => setViewId(null)} title={view ? `${view.id} · ${clientById(view.clientId)?.company}` : ''} wide>
        {view && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Goods', view.goods],
                ['Route', `${view.origin} → ${view.destination}`],
                ['Approx. weight', `${view.weight} kg`],
                ['Approx. volume', `${view.volume} CBM`],
                ['Preference', view.mode],
                ['Shipping mark', clientById(view.clientId)?.mark],
                ['Received', view.date],
                ['Status', <Badge key="s">{view.status}</Badge>],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">{k}</p>
                  <p className="mt-0.5 text-sm font-medium">{v}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Documents</h4>
              <div className="flex flex-wrap gap-2">
                {view.docs.map((d) => (
                  <span key={d} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs dark:border-slate-700">
                    <FileText size={14} className="text-brand-500" /> {d}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Shipping partner rate comparison</h4>
              <div className="space-y-2">
                {[...view.rates].sort((a, b) => a.rate - b.rate).map((r) => (
                  <div key={r.partner} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 truncate text-sm">{r.partner}</span>
                    <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`flex h-full items-center justify-end rounded-lg px-2 text-xs font-semibold text-white ${r.rate === best ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500'}`}
                        style={{ width: `${(r.rate / Math.max(...view.rates.map((x) => x.rate))) * 100}%` }}
                      >
                        {inr(r.rate)}
                      </div>
                    </div>
                    {r.rate === best ? <Trophy size={16} className="text-emerald-500" /> : <span className="w-4" />}
                  </div>
                ))}
              </div>
              {['Pending', 'Quoted'].includes(view.status) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="w-56"><Select value={newRate.partner} onChange={(v) => setNewRate({ ...newRate, partner: v })} options={masters.partners} /></div>
                  <input className="input max-w-[140px]" type="number" placeholder="Rate ₹" value={newRate.rate} onChange={(e) => setNewRate({ ...newRate, rate: e.target.value })} />
                  <Button
                    variant="secondary"
                    disabled={!newRate.rate}
                    onClick={() => {
                      saveInquiry({ ...view, rates: [...view.rates.filter((r) => r.partner !== newRate.partner), { partner: newRate.partner, rate: Number(newRate.rate) }] })
                      setNewRate({ ...newRate, rate: '' })
                    }}
                  >
                    Record rate
                  </Button>
                </div>
              )}
            </div>

            <div className="grid gap-4 rounded-2xl bg-gradient-to-br from-brand-50 to-cyan-50 p-4 dark:from-brand-500/10 dark:to-cyan-500/10 sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Best partner cost</p>
                <p className="text-xl font-bold">{inr(best)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Company selling price</p>
                {['Pending', 'Quoted'].includes(view.status) ? (
                  <input className="input mt-1 font-bold" type="number" value={view.sellingPrice} onChange={(e) => saveInquiry({ ...view, sellingPrice: Number(e.target.value) })} />
                ) : (
                  <p className="text-xl font-bold">{inr(view.sellingPrice)}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500">Margin</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {inr(view.sellingPrice - best)} <span className="text-sm font-medium">({best ? (((view.sellingPrice - best) / view.sellingPrice) * 100).toFixed(1) : 0}%)</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold">Quotation versions</h4>
              {view.quotes.length === 0 ? (
                <p className="text-sm text-slate-400">No quotation issued yet.</p>
              ) : (
                <div className="space-y-2">
                  {view.quotes.map((qt) => (
                    <div key={qt.version} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold dark:bg-slate-800">v{qt.version}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{inr(qt.amount)}</p>
                        <p className="text-xs text-slate-500">Valid till {qt.validity}</p>
                      </div>
                      <Badge>{qt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              {['Pending', 'Quoted'].includes(view.status) && (
                <>
                  <Field label="Validity"><input type="date" className="input" value={validity} onChange={(e) => setValidity(e.target.value)} /></Field>
                  <Button className="mt-5" onClick={() => generateQuote(view.id, view.sellingPrice, validity)}>
                    <Send size={16} /> {view.quotes.length ? 'Issue revised quote' : 'Generate & share quote'}
                  </Button>
                </>
              )}
              {view.status === 'Quoted' && (
                <div className="mt-5 ml-auto flex gap-2">
                  <Button variant="danger" onClick={() => setQuoteDecision(view.id, 'Rejected')}><X size={16} /> Rejected</Button>
                  <Button variant="success" onClick={() => setQuoteDecision(view.id, 'Accepted')}><Check size={16} /> Accepted</Button>
                </div>
              )}
              {view.status === 'Accepted' && (
                <Button
                  variant="success"
                  className="ml-auto"
                  onClick={() => {
                    const id = createShipmentFromInquiry(view)
                    setViewId(null)
                    navigate(`/shipments/${id}`)
                  }}
                >
                  <Ship size={16} /> Create shipment
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* New inquiry */}
      <Modal
        open={!!creating}
        onClose={() => setCreating(null)}
        title="New inquiry"
        wide
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreating(null)}>Cancel</Button>
            <Button
              disabled={!creating?.clientId || !creating?.goods}
              onClick={() => {
                saveInquiry({ ...creating, weight: Number(creating.weight), volume: Number(creating.volume), sellingPrice: Number(creating.sellingPrice) })
                setCreating(null)
              }}
            >
              Save inquiry
            </Button>
          </>
        }
      >
        {creating && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client">
              <Select
                placeholder="Select client…"
                value={creating.clientId}
                onChange={(v) => {
                  const c = clients.find((x) => x.id === v)
                  setCreating((x) => ({ ...x, clientId: v, destination: x.destination || c?.city || '' }))
                }}
                options={clients.filter((c) => c.active).map((c) => ({ value: c.id, label: c.company, hint: c.mark }))}
              />
            </Field>
            <Field label="Shipping preference">
              <div className="flex gap-2">
                {['Sea', 'Air'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set('mode', m)}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition ${creating.mode === m ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'}`}
                  >
                    {m === 'Sea' ? <Ship size={16} /> : <Plane size={16} />} {m}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Goods description" className="sm:col-span-2"><input className="input" value={creating.goods} onChange={(e) => set('goods', e.target.value)} /></Field>
            <Field label="Origin (China)">
              <Select value={creating.origin} onChange={(v) => set('origin', v)} options={masters.origins} />
            </Field>
            <Field label="Destination (India)"><input className="input" value={creating.destination} onChange={(e) => set('destination', e.target.value)} /></Field>
            <Field label="Approx. weight (kg)"><input type="number" className="input" value={creating.weight} onChange={(e) => set('weight', e.target.value)} /></Field>
            <Field label="Approx. volume (CBM)"><input type="number" className="input" value={creating.volume} onChange={(e) => set('volume', e.target.value)} /></Field>
            <Field label="Commercial invoice & packing list" className="sm:col-span-2">
              <UploadBox files={creating.docs} onAdd={(f) => set('docs', [...creating.docs, ...f])} />
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
