import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Button, PageHeader } from '../components/ui'
import Board from '../components/Board'
import { DispatchModal, ReceiveModal } from '../components/StageForms'

export default function WarehousePage() {
  const { shipments } = useApp()
  const [modal, setModal] = useState(null)
  const target = shipments.find((s) => s.id === modal?.id)

  return (
    <>
      <PageHeader title="China Warehouse & Dispatch" subtitle="Receive goods, log condition and photos, generate delivery notes and hand over to shipping partners." />
      <Board
        columns={[
          {
            title: 'Expected', dot: 'bg-slate-400', statuses: ['Booked'],
            meta: (s) => `${s.grossWeight} kg · ${s.volume} CBM expected`,
            action: (s) => <Button size="sm" className="mt-3 w-full" onClick={() => setModal({ type: 'receive', id: s.id })}>Record receiving</Button>,
          },
          {
            title: 'Received · ready to dispatch', dot: 'bg-amber-500', statuses: ['Received at China Warehouse'],
            meta: (s) => `${s.warehouse?.packages} pkgs · ${s.warehouse?.actualWeight} kg · ${s.warehouse?.condition}`,
            action: (s) => <Button size="sm" className="mt-3 w-full" onClick={() => setModal({ type: 'dispatch', id: s.id })}>Generate DN & dispatch</Button>,
          },
          { title: 'Dispatched', dot: 'bg-sky-500', statuses: ['Dispatched from China'], meta: (s) => `${s.dispatch?.note} · ${s.dispatch?.partner}` },
          { title: 'In transit to India', dot: 'bg-teal-500', statuses: ['In Transit'], meta: (s) => `Ref ${s.dispatch?.tracking} · ETA ${s.eta}` },
        ]}
      />
      {modal?.type === 'receive' && target && <ReceiveModal shipment={target} onClose={() => setModal(null)} />}
      {modal?.type === 'dispatch' && target && <DispatchModal shipment={target} onClose={() => setModal(null)} />}
    </>
  )
}
