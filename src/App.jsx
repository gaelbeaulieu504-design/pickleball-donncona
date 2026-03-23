import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { PayPalScriptProvider } from '@paypal/react-paypal-js'
import { AuthProvider } from './context/AuthContext'
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
import ScrollToTop from './components/ScrollToTop'

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'test'

function App() {
  return (
    <PayPalScriptProvider options={{
      'client-id': PAYPAL_CLIENT_ID,
      currency: 'CAD',
      components: 'buttons',
      'enable-funding': 'card',
      'disable-funding': 'paylater',
    }}>
      <AuthProvider>
        <BookingProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/book" element={<BookCourt />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
        </BookingProvider>
      </AuthProvider>
    </PayPalScriptProvider>
  )
}

export default App
