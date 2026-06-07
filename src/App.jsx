import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isPast, parseISO } from 'date-fns'
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
import ScrollToTop from './components/ScrollToTop'

function RequireAuth({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

const OVERLAY_EXCLUDED = ['/tournaments', '/login', '/register', '/bienvenue']

function SiteClosedOverlay() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tournament, setTournament] = useState(null)

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then(data => {
        const ts = Array.isArray(data) ? data : []
        const upcoming = ts.filter(t => {
          try { return !isPast(parseISO(t.date + 'T23:59:59')) } catch { return false }
        })
        setTournament(upcoming[0] || null)
      })
      .catch(() => setTournament(null))
  }, [])

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
        {tournament ? (
          <div style={{ marginTop: 24, padding: '16px 20px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12 }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              🏆 Inscrivez-vous au tournoi
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a1a2e', marginBottom: 4 }}>{tournament.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: 12 }}>
              {tournament.date} — {tournament.location}
            </div>
            <button
              onClick={() => navigate('/tournaments')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #b45309, #d97706)',
                color: '#fff', border: 'none', padding: '12px 28px',
                borderRadius: 10, fontWeight: 700, fontSize: '0.9375rem',
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              🏆 Voir le tournoi et s'inscrire
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('/tournaments')}
            style={{
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #b45309, #d97706)',
              color: '#fff', border: 'none', padding: '14px 32px',
              borderRadius: 12, fontWeight: 700, fontSize: '1rem',
              cursor: 'pointer', transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            🏆 Voir les tournois
          </button>
        )}
        <p style={{ fontSize: 14, color: '#888', marginTop: 24 }}>
          Merci de votre compréhension.
        </p>
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
