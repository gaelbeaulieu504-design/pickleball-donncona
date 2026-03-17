import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, Eye, EyeOff, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Donnacona is in QC, postal codes G0A
function detectResidency(nominatimResult) {
  if (!nominatimResult?.address) return null
  const a = nominatimResult.address
  const city = (a.city || a.town || a.village || a.municipality || a.hamlet || '').toLowerCase()
  const postcode = (a.postcode || '').replace(/\s/g, '').toUpperCase()
  if (city.includes('donnacona')) return true
  if (postcode.startsWith('G0A1T')) return true
  return false
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Address
  const [addressInput, setAddressInput] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [isResident, setIsResident] = useState(null)
  const [addressLoading, setAddressLoading] = useState(false)
  const debounceRef = useRef(null)
  const suggestBoxRef = useRef(null)

  useEffect(() => {
    if (!addressInput || addressInput.length < 4 || selectedAddress) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setAddressLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressInput)}&format=json&addressdetails=1&limit=6&countrycodes=ca`,
          { headers: { 'Accept-Language': 'fr' } }
        )
        const data = await res.json()
        setSuggestions(data)
      } catch {
        setSuggestions([])
      }
      setAddressLoading(false)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [addressInput, selectedAddress])

  // Close suggestions on outside click
  useEffect(() => {
    function handle(e) {
      if (suggestBoxRef.current && !suggestBoxRef.current.contains(e.target)) {
        setSuggestions([])
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  function handleSelectAddress(item) {
    setAddressInput(item.display_name)
    setSelectedAddress(item)
    setSuggestions([])
    const resident = detectResidency(item)
    setIsResident(resident)
  }

  function handleAddressChange(e) {
    setAddressInput(e.target.value)
    setSelectedAddress(null)
    setIsResident(null)
  }

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
        password: form.password,
        address: addressInput,
        isResident,
      })
      if (result.error) { setError(result.error); setLoading(false) }
      else navigate('/book')
    }, 500)
  }

  const residentStatus = isResident === true
    ? { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', icon: <CheckCircle size={15} />, text: 'Adresse à Donnacona — tarif résident ($30) appliqué' }
    : isResident === false
    ? { color: '#b45309', bg: '#fffbeb', border: '#fde68a', icon: <XCircle size={15} />, text: 'Adresse hors Donnacona — tarif non-résident ($50) appliqué' }
    : null

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
        maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0',
      }}>
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
            Créer un compte
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>
            Inscrivez-vous pour commencer à réserver
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
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>Nom complet</label>
            <div style={{ position: 'relative' }}>
              <User size={17} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" required placeholder="Jean Tremblay" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem', borderRadius: '0.625rem', border: '2px solid #e2e8f0', fontSize: '1rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#166534'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>Adresse courriel</label>
            <div style={{ position: 'relative' }}>
              <Mail size={17} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="email" required placeholder="vous@exemple.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem', borderRadius: '0.625rem', border: '2px solid #e2e8f0', fontSize: '1rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#166534'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>
          </div>

          {/* Address with autocomplete */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
              Adresse domicile <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.85rem' }}>(pour vérifier la résidence)</span>
            </label>
            <div style={{ position: 'relative' }} ref={suggestBoxRef}>
              <MapPin size={17} style={{ position: 'absolute', left: '0.875rem', top: '0.875rem', color: '#94a3b8', zIndex: 1 }} />
              {addressLoading && (
                <span style={{ position: 'absolute', right: '0.875rem', top: '0.875rem', width: 16, height: 16, border: '2px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
              )}
              <input
                type="text"
                placeholder="123 Rue Principale, Donnacona, QC"
                value={addressInput}
                onChange={handleAddressChange}
                autoComplete="off"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.625rem', borderRadius: suggestions.length > 0 ? '0.625rem 0.625rem 0 0' : '0.625rem', border: `2px solid ${isResident === true ? '#bbf7d0' : isResident === false ? '#fde68a' : '#e2e8f0'}`, fontSize: '0.9375rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = '#166534'}
                onBlur={e => { if (!suggestions.length) e.target.style.borderColor = isResident === true ? '#bbf7d0' : isResident === false ? '#fde68a' : '#e2e8f0' }}
              />
              {suggestions.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '2px solid #166534', borderTop: 'none', borderRadius: '0 0 0.625rem 0.625rem', zIndex: 50, maxHeight: 260, overflowY: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
                  {suggestions.map((s, i) => (
                    <button key={i} type="button" onMouseDown={() => handleSelectAddress(s)}
                      style={{ width: '100%', textAlign: 'left', padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: i < suggestions.length - 1 ? '1px solid #f1f5f9' : 'none', cursor: 'pointer', fontSize: '0.875rem', color: '#0f172a', lineHeight: 1.5, display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f0fdf4'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <MapPin size={14} color="#94a3b8" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{s.display_name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Residency status badge */}
            {residentStatus && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.875rem', background: residentStatus.bg, border: `1px solid ${residentStatus.border}`, borderRadius: '0.5rem', color: residentStatus.color, fontSize: '0.85rem', fontWeight: 600 }}>
                {residentStatus.icon}
                {residentStatus.text}
              </div>
            )}
            {!selectedAddress && addressInput.length > 0 && addressInput.length < 4 && (
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.375rem' }}>Entrez au moins 4 caractères pour voir des suggestions.</p>
            )}
          </div>

          {/* Passwords */}
          {[
            { id: 'password', label: 'Mot de passe', placeholder: 'Min. 6 caractères' },
            { id: 'confirm', label: 'Confirmer le mot de passe', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.id}>
              <label style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{f.label}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={17} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPw ? 'text' : 'password'} required placeholder={f.placeholder}
                  value={form[f.id]}
                  onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 2.625rem', borderRadius: '0.625rem', border: '2px solid #e2e8f0', fontSize: '1rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#166534'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                {f.id === 'confirm' && (
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem', padding: '0.875rem', fontSize: '1rem' }}>
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
