import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { BookingProvider } from './context/BookingContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import BookCourt from './pages/BookCourt'
import Pricing from './pages/Pricing'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminPanel from './pages/AdminPanel'
import Tournaments from './pages/Tournaments'
import Welcome from './pages/Welcome'
import Courses from './pages/Courses'
import MyReservations from './pages/MyReservations'
import ScrollToTop from './components/ScrollToTop'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const OVERLAY_EXCLUDED = ['/login', '/register', '/bienvenue']

function SiteClosedOverlay() {
  const location = useLocation()
  const { user } = useAuth()

  if (user?.isAdmin) return null
  if (OVERLAY_EXCLUDED.includes(location.pathname)) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 99999, fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '48px 40px',
        maxWidth: 520, width: '90%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' }}>
          Site temporairement fermé
        </h1>
        <p style={{ fontSize: 16, color: '#555', lineHeight: 1.6, margin: 0 }}>
          Notre site est actuellement fermé pour une durée indéterminée.
        </p>
        <p style={{ fontSize: 14, color: '#888', marginTop: 24 }}>
          Merci de votre compréhension.
        </p>
        <a href="/login" style={{
          display: 'inline-block', marginTop: 16, fontSize: '0.8125rem',
          color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer',
        }}>
          Connexion administrateur
        </a>
      </div>
    </div>
  )
}

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/bienvenue" element={<Welcome />} />
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<RequireAuth><BookCourt /></RequireAuth>} />
          <Route path="/pricing" element={<RequireAuth><Pricing /></RequireAuth>} />
          <Route path="/about" element={<RequireAuth><About /></RequireAuth>} />
          <Route path="/contact" element={<RequireAuth><Contact /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth><AdminPanel /></RequireAuth>} />
          <Route path="/tournaments" element={<RequireAuth><Tournaments /></RequireAuth>} />
          <Route path="/cours" element={<RequireAuth><Courses /></RequireAuth>} />
          <Route path="/mes-reservations" element={<RequireAuth><MyReservations /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
      <SiteClosedOverlay />
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
