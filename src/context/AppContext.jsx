import { createContext, useContext, useEffect, useState } from 'react'
import { AUDIT, CLIENTS, DEFAULT_MASTERS, INQUIRIES, ROLE_ACCESS, SHIPMENTS, USERS } from '../data/mock'

const AppContext = createContext(null)

const now = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

const load = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

// Cells an admin can't revoke: everyone lands on the dashboard, and Admin must keep the Admin Panel
export const LOCKED_PERMISSIONS = (role, module) => module === 'dashboard' || (role === 'Admin' && module === 'admin')

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('sf_user') || 'null'))
  const [dark, setDark] = useState(() => localStorage.getItem('sf_theme') === 'dark')
  const [clients, setClients] = useState(CLIENTS)
  const [inquiries, setInquiries] = useState(INQUIRIES)
  const [shipments, setShipments] = useState(SHIPMENTS)
  const [users, setUsers] = useState(USERS)
  const [audit, setAudit] = useState(AUDIT)
  const [toast, setToast] = useState(null)
  const [roleAccess, setRoleAccess] = useState(() => load('sf_role_access', ROLE_ACCESS))
  const [masters, setMasters] = useState(() => load('sf_masters', DEFAULT_MASTERS))

  useEffect(() => {
    localStorage.setItem('sf_role_access', JSON.stringify(roleAccess))
  }, [roleAccess])

  useEffect(() => {
    localStorage.setItem('sf_masters', JSON.stringify(masters))
  }, [masters])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('sf_theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    localStorage.setItem('sf_user', JSON.stringify(user))
  }, [user])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }

  const log = (action, ref, field = '—', from = '—', to = '—') =>
    setAudit((a) => [{ at: now(), user: user?.name ?? 'System', action, ref, field, from, to }, ...a])

  const saveClient = (c) => {
    if (c.id) {
      setClients((cs) => cs.map((x) => (x.id === c.id ? c : x)))
      log('Client updated', c.id)
    } else {
      const id = `C${String(clients.length + 1).padStart(3, '0')}`
      setClients((cs) => [{ ...c, id, since: now().slice(0, 10) }, ...cs])
      log('Client created', id, 'mark', '—', c.mark)
    }
    notify('Client saved')
  }

  const saveInquiry = (inq) => {
    if (inq.id) {
      setInquiries((list) => list.map((x) => (x.id === inq.id ? inq : x)))
    } else {
      const id = `INQ-${1043 + inquiries.length - INQUIRIES.length}`
      setInquiries((list) => [{ ...inq, id, date: now().slice(0, 10), status: 'Pending', quotes: [] }, ...list])
      log('Inquiry created', id)
    }
    notify('Inquiry saved')
  }

  const generateQuote = (inqId, amount, validity) => {
    setInquiries((list) =>
      list.map((x) => {
        if (x.id !== inqId) return x
        const quotes = x.quotes.map((q) => (q.status === 'Sent' ? { ...q, status: 'Superseded' } : q))
        return { ...x, status: 'Quoted', quotes: [...quotes, { version: quotes.length + 1, amount, validity, status: 'Sent' }] }
      }),
    )
    log('Quotation generated', inqId, 'amount', '—', `₹${amount.toLocaleString('en-IN')}`)
    notify('Quotation generated & shared')
  }

  const setQuoteDecision = (inqId, decision) => {
    setInquiries((list) =>
      list.map((x) =>
        x.id === inqId
          ? { ...x, status: decision, quotes: x.quotes.map((q) => (q.status === 'Sent' ? { ...q, status: decision } : q)) }
          : x,
      ),
    )
    log(`Quotation ${decision.toLowerCase()}`, inqId, 'status', 'Sent', decision)
    notify(`Quotation marked ${decision.toLowerCase()}`)
  }

  const createShipmentFromInquiry = (inq) => {
    const best = inq.rates.length ? inq.rates.reduce((a, b) => (a.rate <= b.rate ? a : b)) : { partner: '—', rate: 0 }
    const id = `SHP-26-${String(188 + shipments.length - SHIPMENTS.length).padStart(4, '0')}`
    const s = {
      id, clientId: inq.clientId, inquiryId: inq.id, mode: inq.mode, packages: 0, grossWeight: inq.weight, volume: inq.volume,
      origin: inq.origin, destination: inq.destination, partner: best.partner, revenue: inq.sellingPrice, cost: best.rate,
      created: now().slice(0, 10), eta: '—', team: 'China Operations', status: 'Booked',
      warehouse: null, dispatch: null, delivery: null,
      history: [{ status: 'Booked', at: now(), by: user?.name, note: `Created from ${inq.id}` }],
    }
    setShipments((list) => [s, ...list])
    setInquiries((list) => list.map((x) => (x.id === inq.id ? { ...x, status: 'Converted' } : x)))
    log('Shipment created', id, 'status', '—', 'Booked')
    notify(`Shipment ${id} created`)
    return id
  }

  const updateShipment = (id, patch, newStatus, note = '') => {
    setShipments((list) =>
      list.map((s) => {
        if (s.id !== id) return s
        const next = { ...s, ...patch }
        if (newStatus && newStatus !== s.status) {
          next.status = newStatus
          next.history = [...s.history, { status: newStatus, at: now(), by: user?.name, note }]
          log('Status changed', id, 'status', s.status, newStatus)
        } else {
          log('Shipment updated', id)
        }
        return next
      }),
    )
    notify('Shipment updated')
  }

  const saveUser = (u) => {
    if (u.id) setUsers((list) => list.map((x) => (x.id === u.id ? u : x)))
    else setUsers((list) => [...list, { ...u, id: `U${list.length + 1}`, lastLogin: '—' }])
    log(u.id ? 'User updated' : 'User created', u.email)
    notify('User saved')
  }

  const toggleUserActive = (id) => {
    const u = users.find((x) => x.id === id)
    if (!u || u.id === user?.id) return
    setUsers((list) => list.map((x) => (x.id === id ? { ...x, active: !x.active } : x)))
    log(u.active ? 'User suspended' : 'User reactivated', u.email, 'status', u.active ? 'Active' : 'Suspended', u.active ? 'Suspended' : 'Active')
    notify(`${u.name} ${u.active ? 'suspended' : 'reactivated'}`)
  }

  const togglePermission = (role, module, label) => {
    if (LOCKED_PERMISSIONS(role, module)) return
    const has = roleAccess[role].includes(module)
    setRoleAccess((ra) => ({ ...ra, [role]: has ? ra[role].filter((m) => m !== module) : [...ra[role], module] }))
    log(has ? 'Permission revoked' : 'Permission granted', role, 'module', has ? label : '—', has ? '—' : label)
    notify(`${role}: ${label} access ${has ? 'revoked' : 'granted'}`)
  }

  const resetPermissions = () => {
    setRoleAccess(ROLE_ACCESS)
    log('Permissions reset to defaults', 'All roles')
    notify('Permissions reset to defaults')
  }

  const exists = (key, value, except) => masters[key].some((x) => x !== except && x.toLowerCase() === value.toLowerCase())

  const addMaster = (key, raw, title) => {
    const value = raw.trim()
    if (!value) return false
    if (exists(key, value)) {
      notify(`"${value}" already exists`)
      return false
    }
    setMasters((m) => ({ ...m, [key]: [...m[key], value] }))
    log('Master data added', title, 'value', '—', value)
    notify(`Added "${value}"`)
    return true
  }

  const updateMaster = (key, from, raw, title) => {
    const value = raw.trim()
    if (!value || value === from) return true
    if (exists(key, value, from)) {
      notify(`"${value}" already exists`)
      return false
    }
    setMasters((m) => ({ ...m, [key]: m[key].map((x) => (x === from ? value : x)) }))
    log('Master data renamed', title, 'value', from, value)
    notify('Renamed')
    return true
  }

  const removeMaster = (key, value, title) => {
    if (masters[key].length <= 1) return notify('At least one entry is required')
    setMasters((m) => ({ ...m, [key]: m[key].filter((x) => x !== value) }))
    log('Master data removed', title, 'value', value, '—')
    notify(`Removed "${value}"`)
  }

  const clientById = (id) => clients.find((c) => c.id === id)

  return (
    <AppContext.Provider
      value={{
        user, setUser, dark, setDark, toast, notify,
        clients, inquiries, shipments, users, audit, clientById,
        roleAccess, togglePermission, resetPermissions, masters, addMaster, updateMaster, removeMaster,
        toggleUserActive, saveClient, saveInquiry, generateQuote, setQuoteDecision, createShipmentFromInquiry, updateShipment, saveUser,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
