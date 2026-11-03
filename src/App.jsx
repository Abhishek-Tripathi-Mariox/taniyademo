import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import Inquiries from './pages/Inquiries'
import Shipments from './pages/Shipments'
import ShipmentDetail from './pages/ShipmentDetail'
import WarehousePage from './pages/Warehouse'
import Delivery from './pages/Delivery'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import Admin from './pages/Admin'

function Guard({ module, children }) {
  const { user, roleAccess } = useApp()
  if (!user) return <Navigate to="/login" replace />
  if (module && !roleAccess[user.role]?.includes(module)) return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useApp()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route
        element={
          <Guard>
            <Layout />
          </Guard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Guard module="analytics"><Analytics /></Guard>} />
        <Route path="clients" element={<Guard module="clients"><Clients /></Guard>} />
        <Route path="inquiries" element={<Guard module="inquiries"><Inquiries /></Guard>} />
        <Route path="shipments" element={<Guard module="shipments"><Shipments /></Guard>} />
        <Route path="shipments/:id" element={<Guard module="shipments"><ShipmentDetail /></Guard>} />
        <Route path="warehouse" element={<Guard module="warehouse"><WarehousePage /></Guard>} />
        <Route path="delivery" element={<Guard module="delivery"><Delivery /></Guard>} />
        <Route path="reports" element={<Guard module="reports"><Reports /></Guard>} />
        <Route path="admin" element={<Guard module="admin"><Admin /></Guard>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  )
}
