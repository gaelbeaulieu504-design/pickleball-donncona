import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/book', label: 'Book a Court' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      transition: 'box-shadow 0.3s',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4.5rem',
      }}>
        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 38,
            height: 38,
            background: 'linear-gradient(135deg, #166534, #22c55e)',
            borderRadius: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
              <path d="M3 12 Q8 6 12 12 Q16 18 21 12" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M12 3 Q18 8 12 12 Q6 16 12 21" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.1 }}>
              Pickleball
            </div>
            <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, letterSpacing: '0.05em' }}>
              DONNACONA
            </div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              style={({ isActive }) => ({
                padding: '0.5rem 0.875rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '0.9375rem',
                color: isActive ? '#166534' : '#475569',
                background: isActive ? 'rgba(22,101,52,0.08)' : 'transparent',
                transition: 'all 0.15s',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            className="btn-primary"
            style={{ padding: '0.625rem 1.25rem', marginLeft: '0.5rem', fontSize: '0.9rem' }}
            onClick={() => navigate('/book')}
          >
            Book Now
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="mobile-menu-btn"
          onClick={() => setOpen(!open)}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            color: '#334155',
            display: 'none',
          }}
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          background: '#fff',
          borderTop: '1px solid #e2e8f0',
          padding: '1rem',
        }}>
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '1rem',
                color: isActive ? '#166534' : '#334155',
                background: isActive ? 'rgba(22,101,52,0.08)' : 'transparent',
                marginBottom: '0.25rem',
              })}
            >
              {link.label}
            </NavLink>
          ))}
          <button
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.75rem' }}
            onClick={() => { navigate('/book'); setOpen(false) }}
          >
            Book Now
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  )
}
