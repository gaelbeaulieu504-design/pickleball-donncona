import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogIn, UserPlus, LogOut, ShieldCheck, ChevronDown, Trophy, Users, GraduationCap, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/', label: 'Accueil' },
  { to: '/book', label: 'Réserver' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/about', label: 'Terrains' },
  { to: '/contact', label: 'Contact' },
]

const inscriptionItems = [
  { icon: Trophy, label: 'Tournois', color: '#b45309', to: '/tournaments' },
  { icon: Users, label: 'Ligues', color: '#1B4E8B', to: null },
  { icon: GraduationCap, label: 'Cours', color: '#166534', to: '/cours' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [inscriptionOpen, setInscriptionOpen] = useState(false)
  const [mobileInscriptionOpen, setMobileInscriptionOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menus on outside click
  useEffect(() => {
    if (!userMenuOpen && !inscriptionOpen) return
    const close = () => { setUserMenuOpen(false); setInscriptionOpen(false) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [userMenuOpen, inscriptionOpen])

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
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/logo-nav.png" alt="Pickleball Donnacona" style={{ height: 52, width: 'auto' }} />
        </NavLink>

        {/* Desktop nav */}
        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'}
              style={({ isActive }) => ({
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                fontWeight: 600, fontSize: '0.9375rem',
                color: isActive ? '#1B4E8B' : '#475569',
                background: isActive ? 'rgba(27,78,139,0.08)' : 'transparent',
                transition: 'all 0.15s',
              })}>
              {link.label}
            </NavLink>
          ))}

          {/* Inscriptions dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={e => { e.stopPropagation(); setInscriptionOpen(v => !v) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                fontWeight: 600, fontSize: '0.9375rem',
                color: inscriptionOpen ? '#1B4E8B' : '#475569',
                background: inscriptionOpen ? 'rgba(27,78,139,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              Inscriptions
              <ChevronDown size={15} style={{ transition: 'transform 0.2s', transform: inscriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {inscriptionOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 0.5rem)', left: '50%',
                transform: 'translateX(-50%)',
                background: '#fff', borderRadius: '1rem',
                border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                padding: '0.5rem', minWidth: 200, zIndex: 200,
              }}>
                {inscriptionItems.map(({ icon: Icon, label, color, to }) => (
                  <button key={label}
                    onClick={() => { setInscriptionOpen(false); if (to) navigate(to) }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '0.625rem',
                      background: 'none', border: 'none', cursor: to ? 'pointer' : 'default',
                      color: to ? '#334155' : '#94a3b8', fontWeight: 600, fontSize: '0.9375rem',
                      transition: 'background 0.15s', textAlign: 'left',
                    }}
                    onMouseEnter={e => { if (to) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: '0.5rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={16} color={to ? color : '#cbd5e1'} />
                    </div>
                    <div>
                      {label}
                      {!to && <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>Bientôt disponible</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {user?.isAdmin && (
            <NavLink to="/admin"
              style={({ isActive }) => ({
                padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                fontWeight: 700, fontSize: '0.9375rem',
                color: isActive ? '#fff' : '#dc2626',
                background: isActive ? '#dc2626' : 'rgba(220,38,38,0.08)',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                transition: 'all 0.15s',
              })}>
              <ShieldCheck size={15} /> Admin
            </NavLink>
          )}

          {user ? (
            <div style={{ position: 'relative', marginLeft: '0.5rem' }}>
              <button
                onClick={e => { e.stopPropagation(); setUserMenuOpen(v => !v) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: user.isAdmin ? 'rgba(220,38,38,0.08)' : 'rgba(22,101,52,0.08)', border: 'none',
                  padding: '0.5rem 0.875rem', borderRadius: '0.625rem',
                  cursor: 'pointer', fontWeight: 600, fontSize: '0.9375rem',
                  color: user.isAdmin ? '#dc2626' : '#1B4E8B',
                }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: user.isAdmin ? '#dc2626' : '#1B4E8B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
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
                  <button onClick={() => { setUserMenuOpen(false); navigate('/mes-reservations') }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '0.625rem',
                      padding: '0.625rem 0.875rem', borderRadius: '0.5rem',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#1B4E8B', fontWeight: 600, fontSize: '0.9rem',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f0f7ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Calendar size={16} /> Mes réservations
                  </button>
                  <div style={{ height: 1, background: '#f1f5f9', margin: '0.25rem 0' }} />
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
                color: isActive ? '#1B4E8B' : '#334155',
                background: isActive ? 'rgba(22,101,52,0.08)' : 'transparent',
                marginBottom: '0.25rem',
              })}>
              {link.label}
            </NavLink>
          ))}

          {/* Inscriptions mobile */}
          <div style={{ marginBottom: '0.25rem' }}>
            <button
              onClick={() => setMobileInscriptionOpen(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.875rem 1rem', borderRadius: '0.5rem',
                fontWeight: 600, fontSize: '1rem',
                color: '#334155', background: mobileInscriptionOpen ? 'rgba(27,78,139,0.08)' : 'transparent',
                border: 'none', cursor: 'pointer',
              }}
            >
              Inscriptions
              <ChevronDown size={16} style={{ transition: 'transform 0.2s', transform: mobileInscriptionOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {mobileInscriptionOpen && (
              <div style={{ paddingLeft: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.25rem' }}>
                {inscriptionItems.map(({ icon: Icon, label, color, to }) => (
                  <button key={label}
                    onClick={() => { setMobileInscriptionOpen(false); setOpen(false); if (to) navigate(to) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.75rem 1rem', borderRadius: '0.5rem',
                      background: '#f8fafc', border: 'none', cursor: to ? 'pointer' : 'default',
                      color: to ? '#334155' : '#94a3b8', fontWeight: 600, fontSize: '0.9375rem', textAlign: 'left',
                    }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: '0.5rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={15} color={to ? color : '#cbd5e1'} />
                    </div>
                    <div>
                      {label}
                      {!to && <div style={{ fontSize: '0.7rem', color: '#cbd5e1', fontWeight: 500 }}>Bientôt disponible</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          {user?.isAdmin && (
            <NavLink to="/admin" onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.875rem 1rem', borderRadius: '0.5rem',
                fontWeight: 700, fontSize: '1rem',
                color: isActive ? '#fff' : '#dc2626',
                background: isActive ? '#dc2626' : 'rgba(220,38,38,0.08)',
                marginBottom: '0.25rem',
              })}>
              <ShieldCheck size={16} /> Admin
            </NavLink>
          )}
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
              <button onClick={() => { setOpen(false); navigate('/mes-reservations') }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem 1rem', borderRadius: '0.5rem', background: '#f0f7ff', border: '1px solid #bfdbfe', cursor: 'pointer', color: '#1B4E8B', fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.5rem' }}
              >
                <Calendar size={16} /> Mes réservations
              </button>
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
