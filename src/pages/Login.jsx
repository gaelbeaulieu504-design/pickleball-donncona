import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form)
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      navigate('/book')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(160deg, #0f2d4a 0%, #1B4E8B 45%, #166534 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Big background logo watermark */}
      <img
        src="/logo.png"
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 680, height: 680,
          objectFit: 'contain',
          opacity: 0.07,
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />

      {/* Logo + Club name */}
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <img
          src="/logo.png"
          alt="Pickleball Donnacona"
          style={{ width: 130, height: 130, objectFit: 'contain', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.35))' }}
        />
        <div style={{ marginTop: '0.75rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Été 2026
        </div>
      </div>

      {/* Access required banner */}
      <div style={{
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '1rem',
        padding: '0.875rem 1.25rem',
        marginBottom: '1.5rem',
        maxWidth: 440,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <ShieldCheck size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
            Connexion obligatoire
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Le site est réservé aux membres. Vous devez vous connecter ou créer un compte pour accéder aux réservations, tournois et cours.
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: 'clamp(1.75rem, 5vw, 2.5rem)',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          Connexion
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Entrez vos informations pour accéder à votre compte.
        </p>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '0.75rem', padding: '0.875rem 1rem',
            color: '#dc2626', fontSize: '0.9rem', marginBottom: '1.25rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9rem' }}>
              Adresse courriel
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                required
                placeholder="vous@exemple.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem',
                  borderRadius: '0.625rem', border: '2px solid #e2e8f0',
                  fontSize: '1rem', fontFamily: 'inherit', color: '#0f172a',
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#1B4E8B'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9rem' }}>
              Mot de passe
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={17} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPw ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                style={{
                  width: '100%', padding: '0.75rem 3rem 0.75rem 2.625rem',
                  borderRadius: '0.625rem', border: '2px solid #e2e8f0',
                  fontSize: '1rem', fontFamily: 'inherit', color: '#0f172a',
                  outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#1B4E8B'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button type="button" onClick={() => setShowPw(v => !v)} style={{
                position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0,
              }}>
                {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem' }}
          >
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              : <><LogIn size={18} /> Se connecter</>
            }
          </button>
        </form>

        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Pas encore de compte ?
          </p>
          <Link to="/register" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            marginTop: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
          }}>
            Créer un compte gratuitement →
          </Link>
        </div>
      </div>

      <p style={{ marginTop: '1.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.8rem', textAlign: 'center' }}>
        © 2026 Pickleball Donnacona
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
