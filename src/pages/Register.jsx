import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, Eye, EyeOff, MapPin, Phone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const PROVINCES = [
  'Québec', 'Ontario', 'Colombie-Britannique', 'Alberta', 'Manitoba',
  'Saskatchewan', 'Nouvelle-Écosse', 'Nouveau-Brunswick',
  'Terre-Neuve-et-Labrador', 'Île-du-Prince-Édouard',
  'Territoires du Nord-Ouest', 'Yukon', 'Nunavut',
]

function detectResidency(city) {
  return city.trim().toLowerCase() === 'donnacona'
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    streetAddress: '', city: '', province: 'Québec', postalCode: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function set(field) {
    return e => setForm(p => ({ ...p, [field]: e.target.value }))
  }

  const isResident = form.city ? detectResidency(form.city) : null
  const fullAddress = [form.streetAddress, form.city, form.province, form.postalCode].filter(Boolean).join(', ')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) { setError('Le mot de passe doit comporter au moins 6 caractères.'); return }
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    setLoading(true)
    setTimeout(() => {
      const result = register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        address: fullAddress,
        streetAddress: form.streetAddress,
        city: form.city,
        province: form.province,
        postalCode: form.postalCode,
        isResident: form.city ? isResident : null,
      })
      if (result.error) { setError(result.error); setLoading(false) }
      else navigate('/book')
    }, 500)
  }

  const inputStyle = {
    width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem',
    borderRadius: '0.625rem', border: '2px solid #e2e8f0',
    fontSize: '0.9375rem', fontFamily: 'inherit', color: '#0f172a',
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box',
  }
  const noIconInput = { ...inputStyle, paddingLeft: '1rem' }
  const labelStyle = { display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: 'clamp(2rem, 5vw, 3rem)', width: '100%', maxWidth: 520, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #14532d, #22c55e)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
              <path d="M3 12 Q8 6 12 12 Q16 18 21 12" stroke="white" strokeWidth="2" fill="none"/>
              <path d="M12 3 Q18 8 12 12 Q6 16 12 21" stroke="white" strokeWidth="1.5" fill="none"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.375rem' }}>Créer un compte</h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>Inscrivez-vous pour commencer à réserver</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#dc2626', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* ── Informations personnelles ── */}
          <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1.125rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Informations personnelles</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Name */}
              <div>
                <label style={labelStyle}>Nom complet</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" required placeholder="Jean Tremblay" value={form.name} onChange={set('name')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Adresse courriel</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="email" required placeholder="vous@exemple.com" value={form.email} onChange={set('email')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Numéro de téléphone <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.85rem' }}>(optionnel)</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="tel" placeholder="418-555-0123" value={form.phone} onChange={set('phone')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Adresse ── */}
          <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1.125rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adresse domicile</div>
              {form.city && (
                isResident
                  ? <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>🏠 Résident · $50</span>
                  : <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>🌍 Non-résident · $75</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>

              {/* Street address */}
              <div>
                <label style={labelStyle}>Numéro et nom de rue</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input type="text" placeholder="123 Rue Principale" value={form.streetAddress} onChange={set('streetAddress')}
                    style={inputStyle} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>

              {/* City */}
              <div>
                <label style={labelStyle}>
                  Ville
                  {form.city && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: isResident ? '#166534' : '#b45309', fontWeight: 600 }}>
                    {isResident ? '✓ Donnacona — tarif résident' : '— tarif non-résident'}
                  </span>}
                </label>
                <input type="text" placeholder="Donnacona" value={form.city} onChange={set('city')}
                  style={{ ...noIconInput, borderColor: form.city ? (isResident ? '#bbf7d0' : '#fde68a') : '#e2e8f0' }}
                  onFocus={e => e.target.style.borderColor = '#166534'}
                  onBlur={e => e.target.style.borderColor = form.city ? (isResident ? '#bbf7d0' : '#fde68a') : '#e2e8f0'} />
              </div>

              {/* Province + Postal code side by side */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Province</label>
                  <select value={form.province} onChange={set('province')}
                    style={{ ...noIconInput, cursor: 'pointer', appearance: 'none', background: '#fff url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 24 24\'%3E%3Cpath fill=\'%2394a3b8\' d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E") no-repeat right 0.875rem center' }}
                    onFocus={e => e.target.style.borderColor = '#166534'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Code postal</label>
                  <input type="text" placeholder="G0A 1T0" value={form.postalCode}
                    onChange={e => setForm(p => ({ ...p, postalCode: e.target.value.toUpperCase() }))}
                    maxLength={7}
                    style={noIconInput} onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Mot de passe ── */}
          <div style={{ background: '#f8fafc', borderRadius: '0.875rem', padding: '1.125rem', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>Sécurité</div>
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
                      onFocus={e => e.target.style.borderColor = '#166534'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
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

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#64748b', fontSize: '0.9375rem' }}>
          Déjà un compte ?{' '}
          <Link to="/login" style={{ color: '#166534', fontWeight: 700 }}>Se connecter</Link>
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
