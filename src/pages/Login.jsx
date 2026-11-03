import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Anchor, Package, Plane, Ship } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Button } from '../components/ui'

export default function Login() {
  const { users, setUser } = useApp()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = ({ password: _secret, ...u }) => {
    setUser(u)
    navigate('/')
  }

  const submit = (e) => {
    e.preventDefault()
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password)
    if (!u) return setError('Invalid email or password')
    if (!u.active) return setError('This account is suspended. Contact your administrator.')
    login(u)
  }

  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-slate-900 via-brand-900 to-cyan-900 p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -left-20 top-1/3 h-80 w-80 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="absolute -right-10 bottom-10 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
            <Ship size={22} />
          </div>
          <span className="text-xl font-bold">ShipFlow ERP</span>
        </div>
        <div className="relative mt-auto">
          <h2 className="text-4xl font-bold leading-tight">
            Every shipment from
            <br />
            <span className="bg-gradient-to-r from-amber-200 via-cyan-200 to-teal-200 bg-clip-text text-transparent">Guangzhou to Mumbai</span>
            <br />
            in one place.
          </h2>
          <p className="mt-4 max-w-md text-slate-300">
            Inquiries, quotations, China warehouse receiving, dispatch, final delivery and full audit history — shared across Sales, China
            Ops, India Ops and Management.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              [Package, 'Warehouse'],
              [Anchor, 'Sea freight'],
              [Plane, 'Air freight'],
            ].map(([Icon, l]) => (
              <div key={l} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur">
                <Icon size={20} className="text-cyan-300" />
                <p className="mt-2 text-sm text-slate-200">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md animate-fade-up">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your department workspace</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <span className="label">Email</span>
              <input type="email" required autoComplete="username" placeholder="you@shipflow.in" className="input py-2.5" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <span className="label">Password</span>
              <input type="password" required autoComplete="current-password" placeholder="••••••••" className="input py-2.5" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <Button className="w-full py-2.5">Sign in</Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">Access is provided by your administrator, based on your department.</p>
        </div>
      </div>
    </div>
  )
}
