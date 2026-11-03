import { useState } from 'react'
import { Ban, Check, Lock, Minus, Pencil, Plus, RotateCcw, Trash2, UserCheck, X } from 'lucide-react'
import { LOCKED_PERMISSIONS, useApp } from '../context/AppContext'
import { ROLES, SHIPMENT_STATUSES } from '../data/mock'
import { NAV } from '../components/Layout'
import { Badge, Button, Field, Modal, PageHeader, Table, Tabs } from '../components/ui'
import Select from '../components/Select'

const EMPTY = { name: '', email: '', password: '', role: 'Sales', active: true }

const MASTER_LISTS = [
  { key: 'partners', title: 'Shipping partners', hint: 'Used in rate comparison and dispatch', usage: (s, v) => s.partner === v },
  { key: 'deliveryMethods', title: 'Delivery methods', hint: 'Used in final delivery', usage: (s, v) => s.delivery?.method === v },
  { key: 'origins', title: 'China origin cities', hint: 'Used in new inquiries', usage: (s, v) => s.origin === v },
]

function MasterCard({ list }) {
  const { masters, shipments, addMaster, updateMaster, removeMaster } = useApp()
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const items = masters[list.key]

  const submitAdd = () => {
    if (addMaster(list.key, draft, list.title)) {
      setDraft('')
      setAdding(false)
    }
  }
  const submitEdit = () => {
    if (updateMaster(list.key, editing, editValue, list.title)) setEditing(null)
  }

  return (
    <div className="card flex flex-col p-5">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="font-semibold">{list.title}</h3>
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">{items.length}</span>
        <Button size="sm" variant={adding ? 'secondary' : 'primary'} className="ml-auto" onClick={() => setAdding(!adding)} title="Add entry">
          {adding ? <X size={14} /> : <Plus size={14} />}
        </Button>
      </div>
      <p className="mb-3 text-xs text-slate-500">{list.hint}</p>

      {adding && (
        <form className="mb-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); submitAdd() }}>
          <input autoFocus className="input" placeholder={`New ${list.title.toLowerCase().replace(/s$/, '')}…`} value={draft} onChange={(e) => setDraft(e.target.value)} />
          <Button size="sm" disabled={!draft.trim()}>Add</Button>
        </form>
      )}

      <ul className="space-y-1.5">
        {items.map((i) => {
          const used = shipments.filter((s) => list.usage(s, i)).length
          return (
            <li key={i} className="group flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
              {editing === i ? (
                <form className="flex flex-1 gap-1.5" onSubmit={(e) => { e.preventDefault(); submitEdit() }}>
                  <input autoFocus className="input py-1" value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === 'Escape' && setEditing(null)} />
                  <button className="rounded-md p-1 text-emerald-600 hover:bg-emerald-500/10" title="Save"><Check size={15} /></button>
                  <button type="button" className="rounded-md p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700" title="Cancel" onClick={() => setEditing(null)}><X size={15} /></button>
                </form>
              ) : (
                <>
                  <span className="flex-1 truncate">{i}</span>
                  {used > 0 && <span className="text-[11px] text-slate-400">{used} used</span>}
                  <button className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-slate-200 hover:text-slate-700 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-white" title="Rename" onClick={() => { setEditing(i); setEditValue(i) }}>
                    <Pencil size={13} />
                  </button>
                  <button className="rounded-md p-1 text-slate-400 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-600 group-hover:opacity-100 disabled:hidden" title="Remove" disabled={items.length <= 1} onClick={() => removeMaster(list.key, i, list.title)}>
                    <Trash2 size={13} />
                  </button>
                </>
              )}
            </li>
          )
        })}
      </ul>
      <p className="mt-auto pt-3 text-[11px] text-slate-400">Changes apply to new entries; existing records keep their saved values.</p>
    </div>
  )
}

export default function Admin() {
  const { user: me, users, saveUser, toggleUserActive, roleAccess, togglePermission, resetPermissions } = useApp()
  const [tab, setTab] = useState('Users')
  const [editing, setEditing] = useState(null)
  const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }))

  return (
    <>
      <PageHeader
        title="Admin Panel"
        subtitle="Manage users, department role permissions and master data."
        actions={
          (tab === 'Users' && <Button onClick={() => setEditing(EMPTY)}><Plus size={16} /> Add user</Button>) ||
          (tab === 'Role permissions' && <Button variant="secondary" onClick={resetPermissions}><RotateCcw size={16} /> Reset to defaults</Button>)
        }
      />
      <div className="mb-4">
        <Tabs tabs={['Users', 'Role permissions', 'Master data']} value={tab} onChange={setTab} />
      </div>

      {tab === 'Users' && (
        <div className="card">
          <Table
            rows={users}
            columns={[
              {
                key: 'name', label: 'User', render: (u) => (
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 text-xs font-semibold text-white">
                      {u.name.split(' ').map((p) => p[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                  </div>
                ),
              },
              { key: 'role', label: 'Department / role', render: (u) => <Badge tone="indigo">{u.role}</Badge> },
              { key: 'active', label: 'Status', render: (u) => <Badge>{u.active ? 'Active' : 'Suspended'}</Badge> },
              { key: 'lastLogin', label: 'Last login', render: (u) => <span className="text-slate-500">{u.lastLogin}</span> },
              {
                key: 'actions', label: 'Actions', className: 'text-right', render: (u) => {
                  const self = u.id === me.id
                  return (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(u)} title="Edit user"><Pencil size={14} /> Edit</Button>
                      <button
                        disabled={self}
                        onClick={() => toggleUserActive(u.id)}
                        title={self ? "You can't suspend your own account" : u.active ? `Suspend ${u.name}` : `Reactivate ${u.name}`}
                        className={`inline-flex w-[104px] items-center justify-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 ${
                          u.active
                            ? 'text-rose-600 ring-rose-200 hover:bg-rose-50 dark:text-rose-400 dark:ring-rose-500/30 dark:hover:bg-rose-500/10'
                            : 'text-emerald-600 ring-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:ring-emerald-500/30 dark:hover:bg-emerald-500/10'
                        }`}
                      >
                        {u.active ? <><Ban size={14} /> Suspend</> : <><UserCheck size={14} /> Activate</>}
                      </button>
                    </div>
                  )
                },
              },
            ]}
          />
        </div>
      )}

      {tab === 'Role permissions' && (
        <div className="card">
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-4 py-3 text-left">Module</th>
                  {ROLES.map((r) => <th key={r} className="px-4 py-3 text-center">{r}</th>)}
                </tr>
              </thead>
              <tbody>
                {NAV.map((n) => (
                  <tr key={n.key} className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                    <td className="flex items-center gap-2 px-4 py-3 font-medium"><n.icon size={16} className="text-slate-400" />{n.label}</td>
                    {ROLES.map((r) => {
                      const on = roleAccess[r]?.includes(n.key)
                      const locked = LOCKED_PERMISSIONS(r, n.key)
                      return (
                        <td key={r} className="px-4 py-2 text-center">
                          <button
                            disabled={locked}
                            onClick={() => togglePermission(r, n.key, n.label)}
                            title={locked ? 'Required — cannot be changed' : `${on ? 'Revoke' : 'Grant'} ${n.label} for ${r}`}
                            className={`relative inline-grid h-8 w-8 place-items-center rounded-full transition ${
                              on
                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500 dark:bg-slate-800 dark:text-slate-600 dark:hover:bg-slate-700'
                            } ${locked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-110 active:scale-95'}`}
                          >
                            {on ? <Check size={15} /> : <Minus size={15} />}
                            {locked && <Lock size={9} className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-px text-slate-500 dark:bg-slate-900" />}
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-100 bg-slate-50/70 text-xs dark:border-slate-800 dark:bg-slate-800/30">
                  <td className="px-4 py-3 font-semibold text-slate-500">Modules enabled</td>
                  {ROLES.map((r) => (
                    <td key={r} className="px-4 py-3 text-center font-semibold tabular-nums">{roleAccess[r]?.length ?? 0} / {NAV.length}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="flex items-center gap-1.5 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-800">
            <Lock size={12} /> Click any cell to grant or revoke access. Dashboard is required for everyone, and Admin always keeps the Admin Panel. Changes apply immediately and are recorded in the audit trail.
          </p>
        </div>
      )}

      {tab === 'Master data' && (
        <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
          {MASTER_LISTS.map((l) => <MasterCard key={l.key} list={l} />)}
          <div className="card flex flex-col p-5">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold">Shipment statuses</h3>
              <span className="ml-auto flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800"><Lock size={11} /> System</span>
            </div>
            <p className="mb-3 text-xs text-slate-500">Fixed lifecycle stages that drive the workflow</p>
            <ol className="space-y-1.5">
              {SHIPMENT_STATUSES.map((st, i) => (
                <li key={st} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800/60">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{i + 1}</span>
                  {st}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit user' : 'Add user'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button disabled={!editing?.name || !editing?.email || (editing?.password ?? '').length < 8} onClick={() => { saveUser(editing); setEditing(null) }}>Save user</Button>
          </>
        }
      >
        {editing && (
          <div className="grid gap-4">
            <Field label="Full name"><input className="input" value={editing.name} onChange={(e) => set('name', e.target.value)} /></Field>
            <Field label="Email"><input className="input" value={editing.email} onChange={(e) => set('email', e.target.value)} /></Field>
            <Field label="Password"><input className="input font-mono" value={editing.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 8 characters" /></Field>
            <Field label="Department / role">
              <Select value={editing.role} onChange={(v) => set('role', v)} options={ROLES} />
            </Field>
            <Field label="Status">
              <Select
                disabled={editing.id === me.id}
                title={editing.id === me.id ? "You can't suspend your own account" : undefined}
                value={editing.active ? '1' : '0'}
                onChange={(v) => set('active', v === '1')}
                options={[{ value: '1', label: 'Active' }, { value: '0', label: 'Suspended' }]}
              />
            </Field>
          </div>
        )}
      </Modal>
    </>
  )
}
