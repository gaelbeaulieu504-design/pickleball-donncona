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
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  )
}

export default App
