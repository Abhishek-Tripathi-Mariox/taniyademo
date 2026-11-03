import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Button, Field, Modal, UploadBox } from './ui'
import Select from './Select'

const today = () => new Date().toISOString().slice(0, 10)

export function ReceiveModal({ shipment, onClose }) {
  const { user, updateShipment } = useApp()
  const [f, setF] = useState({
    receivedOn: today(), packages: shipment.packages || '', actualWeight: shipment.grossWeight, actualVolume: shipment.volume,
    condition: 'Good', discrepancy: '', staff: user.name, photos: [],
  })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      open
      onClose={onClose}
      title={`Receive goods · ${shipment.id}`}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              updateShipment(
                shipment.id,
                { packages: Number(f.packages), warehouse: { ...f, packages: Number(f.packages), photos: f.photos.length } },
                'Received at China Warehouse',
                `${f.packages} packages received`,
              )
              onClose()
            }}
          >
            Mark received at China warehouse
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Receiving date"><input type="date" className="input" value={f.receivedOn} onChange={(e) => set('receivedOn', e.target.value)} /></Field>
        <Field label="Package count"><input type="number" className="input" value={f.packages} onChange={(e) => set('packages', e.target.value)} /></Field>
        <Field label="Responsible staff"><input className="input" value={f.staff} onChange={(e) => set('staff', e.target.value)} /></Field>
        <Field label="Actual weight (kg)"><input type="number" className="input" value={f.actualWeight} onChange={(e) => set('actualWeight', e.target.value)} /></Field>
        <Field label="Actual volume (CBM)"><input type="number" className="input" value={f.actualVolume} onChange={(e) => set('actualVolume', e.target.value)} /></Field>
        <Field label="Condition">
          <Select value={f.condition} onChange={(v) => set('condition', v)} options={['Good', 'Minor damage', 'Major damage']} />
        </Field>
        <Field label="Discrepancies" className="sm:col-span-3"><textarea rows={2} className="input" placeholder="Shortage, damage, mismatched marks…" value={f.discrepancy} onChange={(e) => set('discrepancy', e.target.value)} /></Field>
        <Field label="Goods photographs & supporting documents" className="sm:col-span-3">
          <UploadBox label="Upload photos" files={f.photos} onAdd={(p) => set('photos', [...f.photos, ...p])} />
        </Field>
      </div>
    </Modal>
  )
}

export function DispatchModal({ shipment, onClose }) {
  const { updateShipment, masters } = useApp()
  const [f, setF] = useState(() => ({
    note: `DN-${String(940 + Math.floor(Math.random() * 50)).padStart(4, '0')}`, partner: masters.partners[0], date: today(),
    packages: shipment.warehouse?.packages ?? shipment.packages, handover: '', tracking: '', proof: [],
  }))
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  return (
    <Modal
      open
      onClose={onClose}
      title={`Dispatch · ${shipment.id}`}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!f.tracking}
            onClick={() => {
              updateShipment(shipment.id, { dispatch: { ...f, packages: Number(f.packages), proof: f.proof.length > 0 } }, 'Dispatched from China', f.note)
              onClose()
            }}
          >
            Confirm dispatch
          </Button>
        </>
      }
    >
      <div className="mb-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-brand-600 to-cyan-600 p-4 text-white">
        <div>
          <p className="text-xs opacity-80">Delivery note number</p>
          <p className="font-mono text-xl font-bold">{f.note}</p>
        </div>
        <p className="text-xs opacity-80">Auto-generated</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Partner warehouse">
          <Select value={f.partner} onChange={(v) => set('partner', v)} options={masters.partners} />
        </Field>
        <Field label="Dispatch date"><input type="date" className="input" value={f.date} onChange={(e) => set('date', e.target.value)} /></Field>
        <Field label="Package count"><input type="number" className="input" value={f.packages} onChange={(e) => set('packages', e.target.value)} /></Field>
        <Field label="Tracking / reference no."><input className="input" value={f.tracking} onChange={(e) => set('tracking', e.target.value)} /></Field>
        <Field label="Handover details" className="sm:col-span-2"><input className="input" placeholder="Received by, dock, time…" value={f.handover} onChange={(e) => set('handover', e.target.value)} /></Field>
        <Field label="Proof of handover" className="sm:col-span-2"><UploadBox label="Upload handover proof" files={f.proof} onAdd={(p) => set('proof', [...f.proof, ...p])} /></Field>
      </div>
    </Modal>
  )
}

export function DeliveryModal({ shipment, onClose }) {
  const { updateShipment, clientById, masters } = useApp()
  const d = shipment.delivery
  const [f, setF] = useState({
    instructions: d?.instructions ?? '', method: d?.method ?? masters.deliveryMethods[0], destination: d?.destination ?? clientById(shipment.clientId)?.address ?? '',
    charges: d?.charges ?? '', tracking: d?.tracking ?? '', status: d?.status ?? 'Pending', proof: [],
  })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))

  const nextStatus = { Pending: 'Awaiting Client Instructions', Dispatched: 'Out for Delivery', 'In Transit': 'Out for Delivery', Completed: 'Delivered' }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Final delivery · ${shipment.id}`}
      wide
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => {
              const target = f.status === 'Pending' && f.instructions ? undefined : nextStatus[f.status]
              updateShipment(
                shipment.id,
                { delivery: { ...f, charges: Number(f.charges), proof: f.proof.length > 0 || !!d?.proof } },
                target,
                f.tracking ? `Tracking ${f.tracking}` : '',
              )
              onClose()
            }}
          >
            Save delivery
          </Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Client delivery instructions" className="sm:col-span-2">
          <textarea rows={2} className="input" value={f.instructions} onChange={(e) => set('instructions', e.target.value)} />
        </Field>
        <Field label="Delivery method" className="sm:col-span-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {masters.deliveryMethods.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set('method', m)}
                className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${f.method === m ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-slate-200 dark:border-slate-700'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Destination" className="sm:col-span-2"><input className="input" value={f.destination} onChange={(e) => set('destination', e.target.value)} /></Field>
        <Field label="Delivery charges (₹)"><input type="number" className="input" value={f.charges} onChange={(e) => set('charges', e.target.value)} /></Field>
        <Field label="Tracking / LR number"><input className="input" value={f.tracking} onChange={(e) => set('tracking', e.target.value)} /></Field>
        <Field label="Delivery status">
          <Select value={f.status} onChange={(v) => set('status', v)} options={['Pending', 'Dispatched', 'In Transit', 'Completed']} />
        </Field>
        <Field label="Proof of delivery"><UploadBox label="Upload POD" files={f.proof} onAdd={(p) => set('proof', [...f.proof, ...p])} /></Field>
      </div>
    </Modal>
  )
}
