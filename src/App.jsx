import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          {/* Alerte de fermeture temporaire - bloque tout le site */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 99999,
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '48px 40px',
              maxWidth: '520px',
              width: '90%',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1a1a2e',
                marginBottom: '16px',
                fontFamily: 'inherit',
              }}>
                Site temporairement fermé
              </h1>
              <p style={{
                fontSize: '16px',
                color: '#555',
                lineHeight: 1.6,
                fontFamily: 'inherit',
              }}>
                Notre site est actuellement fermé pour une durée indéterminée.
              </p>
              <p style={{
                fontSize: '14px',
                color: '#888',
                marginTop: '24px',
                fontFamily: 'inherit',
              }}>
                Merci de votre compréhension.
              </p>
            </div>
          </div>
          <ScrollToTop />
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/bienvenue" element={<Welcome />} />
              <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
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
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
