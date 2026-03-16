import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      const result = login(form)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        navigate('/book')
      }
    }, 500)
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: '#f8fafc',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: 'clamp(2rem, 5vw, 3rem)',
        width: '100%',
        maxWidth: 440,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 56, height: 56,
            background: 'linear-gradient(135deg, #14532d, #22c55e)',
            borderRadius: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
              <path d="M3 12 Q8 6 12 12 Q16 18 21 12" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M12 3 Q18 8 12 12 Q6 16 12 21" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>
            Connexion
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Connectez-vous pour réserver un terrain
          </p>
        </div>

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
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
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
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#166534'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
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
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#166534'}
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

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9375rem' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ color: '#166534', fontWeight: 700 }}>
            Créer un compte
          </Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
