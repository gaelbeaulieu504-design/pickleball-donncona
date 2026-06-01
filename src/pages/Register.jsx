import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, Eye, EyeOff, Phone, MapPin, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function detectResidency(city) {
  return city.trim().toLowerCase() === 'donnacona'
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', city: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  const isResident = form.city ? detectResidency(form.city) : null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Le mot de passe doit comporter au moins 6 caractères.'); return }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    const result = await register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.city,
      password: form.password,
      isResident: form.city ? isResident : null,
    })
    if (result.error) { setError(result.error); setLoading(false) }
    else navigate('/bienvenue')
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem',
    borderRadius: '0.625rem', border: '2px solid #e2e8f0',
    fontSize: '0.9375rem', fontFamily: 'inherit', color: '#0f172a',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }
  const labelStyle = { display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9rem' }

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
      {/* Background decorative circles */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

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
        maxWidth: 480,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}>
        <ShieldCheck size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
            Compte requis pour accéder au site
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Créez votre compte membre gratuit pour accéder aux réservations de terrains, aux tournois et aux cours.
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: '#fff',
        borderRadius: '1.5rem',
        padding: 'clamp(1.75rem, 5vw, 2.5rem)',
        width: '100%',
        maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
      }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>Créer un compte</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Inscrivez-vous pour commencer à réserver des terrains.</p>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#dc2626', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Informations personnelles */}
          <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1.125rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Informations personnelles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              <div>
                <label style={labelStyle}>Nom complet</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" required placeholder="Jean Tremblay" value={form.name} onChange={set('name')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Adresse courriel</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" required placeholder="vous@exemple.com" value={form.email} onChange={set('email')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Téléphone <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.85rem' }}>(optionnel)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="tel" placeholder="418-555-0123" value={form.phone} onChange={set('phone')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>
                  Ville
                  {form.city && isResident !== null && (
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: isResident ? '#166534' : '#b45309', fontWeight: 600 }}>
                      {isResident ? '✓ Donnacona' : '— autre ville'}
                    </span>
                  )}
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" placeholder="Donnacona" value={form.city} onChange={set('city')}
                    style={{
                      ...inputStyle,
                      borderColor: form.city && isResident !== null ? (isResident ? '#bbf7d0' : '#fde68a') : '#e2e8f0'
                    }}
                    onFocus={e => e.target.style.borderColor = '#1B4E8B'}
                    onBlur={e => e.target.style.borderColor = form.city && isResident !== null ? (isResident ? '#bbf7d0' : '#fde68a') : '#e2e8f0'} />
                </div>
              </div>
            </div>
          </div>

          {/* Mot de passe */}
          <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1.125rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Sécurité</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { id: 'password', label: 'Mot de passe', placeholder: 'Min. 6 caractères' },
                { id: 'confirm', label: 'Confirmer le mot de passe', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.id}>
                  <label style={labelStyle}>{f.label}</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input type={showPw ? 'text' : 'password'} required placeholder={f.placeholder}
                      value={form[f.id]} onChange={set(f.id)}
                      style={{ ...inputStyle, paddingRight: '3rem' }}
                      onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                    {f.id === 'confirm' && (
                      <button type="button" onClick={() => setShowPw(v => !v)}
                        style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.875rem', fontSize: '1rem' }}>
            {loading
              ? <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              : <><UserPlus size={18} /> Créer mon compte</>
            }
          </button>
        </form>

        <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '1.5rem', paddingTop: '1.25rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            Déjà un compte ?
          </p>
          <Link to="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
            marginTop: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
          }}>
            Se connecter →
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
