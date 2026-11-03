import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Button, PageHeader } from '../components/ui'
import Board from '../components/Board'
import { DeliveryModal } from '../components/StageForms'

export default function Delivery() {
  const { shipments, updateShipment } = useApp()
  const [id, setId] = useState(null)
  const target = shipments.find((s) => s.id === id)

  return (
    <>
      <PageHeader title="Final Delivery Management" subtitle="Collect client instructions, assign courier / transport / pickup, and upload proof of delivery." />
      <Board
        columns={[
          {
            title: 'Arrived in India', dot: 'bg-cyan-500', statuses: ['Arrived in India', 'In Transit'],
            meta: (s) => (s.status === 'In Transit' ? `In transit · ETA ${s.eta}` : 'Arrived — contact client'),
            action: (s) =>
              s.status === 'Arrived in India' && (
                <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => updateShipment(s.id, {}, 'Awaiting Client Instructions')}>
                  Request instructions
                </Button>
              ),
          },
          {
            title: 'Awaiting client instructions', dot: 'bg-orange-500', statuses: ['Awaiting Client Instructions'],
            meta: (s) => `${s.packages} pkgs · ${s.grossWeight} kg`,
            action: (s) => <Button size="sm" className="mt-3 w-full" onClick={() => setId(s.id)}>Record instructions</Button>,
          },
          {
            title: 'Out for delivery', dot: 'bg-cyan-500', statuses: ['Out for Delivery'],
            meta: (s) => `${s.delivery?.method} · ${s.delivery?.tracking}`,
            action: (s) => <Button size="sm" variant="success" className="mt-3 w-full" onClick={() => setId(s.id)}>Update / upload POD</Button>,
          },
          { title: 'Delivered', dot: 'bg-emerald-500', statuses: ['Delivered', 'Closed'], meta: (s) => `${s.delivery?.method ?? ''} · ${s.status}` },
        ]}
      />
      {target && <DeliveryModal shipment={target} onClose={() => setId(null)} />}
    </>
  )
}
