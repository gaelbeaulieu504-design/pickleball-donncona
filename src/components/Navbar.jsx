import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, UserPlus, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/book', label: 'Réserver' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/about', label: 'Terrains' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return
    const close = () => setUserMenuOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [userMenuOpen])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.97)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
      transition: 'box-shadow 0.3s',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>

        {/* Logo */}
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #166534, #22c55e)',
            borderRadius: '0.625rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
              <path d="M3 12 Q8 6 12 12 Q16 18 21 12" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M12 3 Q18 8 12 12 Q6 16 12 21" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', lineHeight: 1.1 }}>Pickleball</div>
            <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: 600, letterSpacing: '0.05em' }}>DONNACONA</div>
          </div>
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              style={({ isActive }) => ({
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                fontWeight: 600, fontSize: '0.9375rem',
                color: isActive ? '#166534' : '#475569',
                background: isActive ? 'rgba(22,101,52,0.08)' : 'transparent',
                transition: 'all 0.15s',
              })}>
              {link.label}
            </NavLink>
          ))}

          {user ? (
            <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
              <button
                onClick={e => { e.stopPropagation(); setUserMenuOpen(v => !v) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: user.isAdmin ? 'rgba(220,38,38,0.08)' : 'rgba(22,101,52,0.08)', border: 'none',
                  padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem',
                  color: user.isAdmin ? '#dc2626' : '#166534',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: user.isAdmin ? '#dc2626' : '#166534', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                  {user.isAdmin ? <ShieldCheck size={15} /> : user.name[0].toUpperCase()}
                </div>
                {user.name.split(' ')[0]}
                {user.isAdmin && <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: '2rem', letterSpacing: '0.04em' }}>ADMIN</span>}
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 0.5rem)',
                  background: '#fff', borderRadius: '0.875rem',
                  border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  padding: '0.5rem', minWidth: 200, zIndex: 200,
                }}>
                  <div style={{ padding: '0.625rem 0.875rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{user.name}</span>
                      {user.isAdmin && <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.375rem', borderRadius: '2rem' }}>ADMIN</span>}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{user.email}</div>
                    {user.isAdmin && <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><ShieldCheck size={12} /> Accès complet sans restrictions</div>}
                  </div>
                  <button onClick={() => { logout(); setUserMenuOpen(false) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#dc2626', fontWeight: 600, fontSize: '0.9rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={16} /> Se déconnecter
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
              <button className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/login')}>
                <LogIn size={15} /> Connexion
              </button>
              <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => navigate('/register')}>
                <UserPlus size={15} /> S'inscrire
              </button>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button className="mobile-menu-btn" onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', padding: '0.5rem', color: '#334155', display: 'none', cursor: 'pointer' }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{ background: '#fff', borderTop: '1px solid #e2e8f0', padding: '1rem' }}>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'block', padding: '0.875rem 1rem', borderRadius: '0.5rem',
                fontWeight: 600, fontSize: '1rem',
                color: isActive ? '#166534' : '#334155',
                background: isActive ? 'rgba(22,101,52,0.08)' : 'transparent',
                marginBottom: '0.25rem',
              })}>
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <div style={{ padding: '0.875rem 1rem', background: user.isAdmin ? '#fef2f2' : '#f8fafc', borderRadius: '0.5rem', marginBottom: '0.5rem', border: user.isAdmin ? '1px solid #fecaca' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{user.name}</span>
                  {user.isAdmin && <span style={{ background: '#dc2626', color: '#fff', fontSize: '0.6rem', fontWeight: 800, padding: '0.1rem 0.375rem', borderRadius: '2rem' }}>ADMIN</span>}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{user.email}</div>
                {user.isAdmin && <div style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 600, marginTop: '0.25rem' }}>Accès complet sans restrictions</div>}
              </div>
              <button onClick={() => { logout(); setOpen(false) }} className="btn-secondary" style={{ width: '100%', color: '#dc2626', borderColor: '#fecaca' }}>
                <LogOut size={16} /> Se déconnecter
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginTop: '0.75rem' }}>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => { navigate('/login'); setOpen(false) }}>
                <LogIn size={16} /> Connexion
              </button>
              <button className="btn-primary" style={{ width: '100%' }} onClick={() => { navigate('/register'); setOpen(false) }}>
                <UserPlus size={16} /> Créer un compte
              </button>
            </div>
          )}
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
