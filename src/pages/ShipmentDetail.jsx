import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Camera, Check, FileText, Lock, Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { SHIPMENT_STATUSES } from '../data/mock'
import { Badge, Button, inr } from '../components/ui'
import { DeliveryModal, DispatchModal, ReceiveModal } from '../components/StageForms'

const can = (role, ...roles) => role === 'Admin' || role === 'Management' || roles.includes(role)

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value ?? '—'}</p>
    </div>
  )
}

function Panel({ icon: Icon, title, tone, action, children, empty }) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon size={18} /></div>
        <h3 className="font-semibold">{title}</h3>
        <div className="ml-auto">{action}</div>
      </div>
      {children ?? <p className="text-sm text-slate-400">{empty}</p>}
    </div>
  )
}

export default function ShipmentDetail() {
  const { id } = useParams()
  const { shipments, clientById, inquiries, user, updateShipment } = useApp()
  const [modal, setModal] = useState(null)
  const s = shipments.find((x) => x.id === id)
  if (!s) return <p>Shipment not found. <Link to="/shipments" className="text-brand-600">Back</Link></p>

  const c = clientById(s.clientId)
  const inq = inquiries.find((i) => i.id === s.inquiryId)
  const idx = SHIPMENT_STATUSES.indexOf(s.status)
  const role = user.role

  const docs = [
    ...(inq?.docs ?? []).map((d) => ({ name: d, type: 'Packing list / Invoice' })),
    ...(inq?.quotes ?? []).filter((q) => q.status === 'Accepted').map((q) => ({ name: `Quotation_${inq.id}_v${q.version}.pdf`, type: 'Quotation' })),
    ...(s.dispatch ? [{ name: `${s.dispatch.note}.pdf`, type: 'Delivery note' }] : []),
    ...(s.dispatch?.proof ? [{ name: `Handover_${s.dispatch.note}.jpg`, type: 'Handover proof' }] : []),
    ...(s.delivery?.proof ? [{ name: `POD_${s.id}.pdf`, type: 'Proof of delivery' }] : []),
  ]

  const quick = {
    'Dispatched from China': can(role, 'China Operations') && { label: 'Mark in transit', to: 'In Transit' },
    'In Transit': can(role, 'India Operations') && { label: 'Mark arrived in India', to: 'Arrived in India' },
    'Arrived in India': can(role, 'India Operations') && { label: 'Request client instructions', to: 'Awaiting Client Instructions' },
    Delivered: can(role) && { label: 'Close shipment', to: 'Closed', icon: Lock },
  }[s.status]

  return (
    <>
      <Link to="/shipments" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white">
        <ArrowLeft size={16} /> All shipments
      </Link>

      <div className="card relative overflow-hidden p-6">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-brand-500/20 to-cyan-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-600 text-white shadow-lg shadow-brand-500/30">
            {s.mode === 'Air' ? <Plane size={26} /> : <Ship size={26} />}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{s.id}</h1>
              <Badge>{s.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {c?.company} · <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{c?.mark}</span> · from {s.inquiryId}
            </p>
          </div>
          {quick && (
            <Button onClick={() => updateShipment(s.id, {}, quick.to)}>
              {quick.icon ? <quick.icon size={16} /> : <Check size={16} />} {quick.label}
            </Button>
          )}
        </div>

        {/* Lifecycle stepper */}
        <div className="scroll-thin relative mt-8 overflow-x-auto pb-2">
          <div className="flex min-w-[760px] items-start">
            {SHIPMENT_STATUSES.map((st, i) => (
              <div key={st} className="relative flex flex-1 flex-col items-center text-center">
                {i > 0 && <div className={`absolute right-1/2 top-4 h-0.5 w-full ${i <= idx ? 'bg-gradient-to-r from-brand-500 to-cyan-500' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                <div
                  className={`relative z-10 grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition ${
                    i < idx ? 'bg-brand-600 text-white' : i === idx ? 'bg-white text-brand-600 ring-4 ring-brand-500 dark:bg-slate-900' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}
                >
                  {i < idx ? <Check size={14} /> : i + 1}
                </div>
                <p className={`mt-2 px-1 text-[11px] leading-tight ${i <= idx ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>{st}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-4 lg:grid-cols-7">
          <Info label="Mode" value={s.mode} />
          <Info label="Packages" value={s.packages || '—'} />
          <Info label="Gross weight" value={`${s.grossWeight} kg`} />
          <Info label="Volume" value={`${s.volume} CBM`} />
          <Info label="Created" value={s.created} />
          <Info label="ETA" value={s.eta} />
          <Info label="Responsible team" value={s.team} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Panel
            icon={Warehouse}
            title="China warehouse receiving"
            tone="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            empty="Goods not yet received at China warehouse."
            action={s.status === 'Booked' && can(role, 'China Operations') && <Button size="sm" onClick={() => setModal('receive')}>Record receiving</Button>}
          >
            {s.warehouse && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <Info label="Received on" value={s.warehouse.receivedOn} />
                  <Info label="Packages" value={s.warehouse.packages} />
                  <Info label="Actual weight" value={`${s.warehouse.actualWeight} kg`} />
                  <Info label="Actual volume" value={`${s.warehouse.actualVolume} CBM`} />
                  <Info label="Condition" value={<Badge>{s.warehouse.condition}</Badge>} />
                  <Info label="Staff" value={s.warehouse.staff} />
                  <Info label="Discrepancy" value={s.warehouse.discrepancy || 'None'} />
                </div>
                <div className="mt-4 flex gap-2">
                  {Array.from({ length: Math.min(s.warehouse.photos || 0, 6) }).map((_, i) => (
                    <div key={i} className="grid h-14 w-14 place-items-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-slate-800 dark:to-slate-700">
                      <Camera size={16} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </Panel>

          <Panel
            icon={Ship}
            title="Dispatch to shipping partner"
            tone="bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400"
            empty="Not yet dispatched."
            action={s.status === 'Received at China Warehouse' && can(role, 'China Operations') && <Button size="sm" onClick={() => setModal('dispatch')}>Generate DN & dispatch</Button>}
          >
            {s.dispatch && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Info label="Delivery note" value={<span className="font-mono">{s.dispatch.note}</span>} />
                <Info label="Partner warehouse" value={s.dispatch.partner} />
                <Info label="Dispatch date" value={s.dispatch.date} />
                <Info label="Packages" value={s.dispatch.packages} />
                <Info label="Tracking / ref" value={<span className="font-mono">{s.dispatch.tracking}</span>} />
                <Info label="Handover" value={s.dispatch.handover} />
                <Info label="Proof" value={s.dispatch.proof ? '✓ Attached' : 'Not attached'} />
              </div>
            )}
          </Panel>

          <Panel
            icon={Truck}
            title="Final delivery (India)"
            tone="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400"
            empty="Delivery details will be recorded after arrival in India."
            action={
              ['Arrived in India', 'Awaiting Client Instructions', 'Out for Delivery'].includes(s.status) &&
              can(role, 'India Operations') && <Button size="sm" onClick={() => setModal('delivery')}>{s.delivery ? 'Update delivery' : 'Record delivery'}</Button>
            }
          >
            {s.delivery && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Info label="Method" value={s.delivery.method} />
                <Info label="Destination" value={s.delivery.destination} />
                <Info label="Charges" value={inr(s.delivery.charges)} />
                <Info label="Tracking / LR" value={<span className="font-mono">{s.delivery.tracking}</span>} />
                <Info label="Delivery status" value={<Badge>{s.delivery.status}</Badge>} />
                <Info label="POD" value={s.delivery.proof ? '✓ Uploaded' : 'Pending'} />
                <div className="col-span-2"><Info label="Client instructions" value={s.delivery.instructions} /></div>
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 font-semibold">Status history</h3>
            <ol className="relative space-y-5 border-l-2 border-slate-100 pl-5 dark:border-slate-800">
              {[...s.history].reverse().map((h, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[27px] top-0.5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-slate-900 ${i === 0 ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <p className="text-sm font-medium">{h.status}</p>
                  <p className="text-xs text-slate-500">{h.at} · {h.by}</p>
                  {h.note && <p className="mt-1 rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{h.note}</p>}
                </li>
              ))}
            </ol>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-semibold">Linked documents</h3>
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><FileText size={16} /></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-slate-500">{d.type}</p>
                  </div>
                </div>
              ))}
              {docs.length === 0 && <p className="text-sm text-slate-400">No documents yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {modal === 'receive' && <ReceiveModal shipment={s} onClose={() => setModal(null)} />}
      {modal === 'dispatch' && <DispatchModal shipment={s} onClose={() => setModal(null)} />}
      {modal === 'delivery' && <DeliveryModal shipment={s} onClose={() => setModal(null)} />}
    </>
  )
}
