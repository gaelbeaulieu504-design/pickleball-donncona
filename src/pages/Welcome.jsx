import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { CalendarCheck, CheckCircle } from 'lucide-react'

export default function Welcome() {
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!user) { navigate('/register'); return null }

  const isResident = user.isResident === true
  const hasAddress = user.isResident !== null && user.isResident !== undefined
  const price = isResident ? 40 : 85
  const label = isResident ? 'Résident de Donnacona' : 'Non-résident'
  const color = isResident ? '#166534' : '#1B4E8B'
  const bg = isResident ? 'linear-gradient(135deg, #14532d, #166534)' : 'linear-gradient(135deg, #0f2a50, #1B4E8B)'
  const lightBg = isResident ? '#f0fdf4' : '#eff6ff'
  const border = isResident ? '#bbf7d0' : '#bfdbfe'

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: '#f8fafc' }}>
      <div style={{ background: '#fff', borderRadius: '1.5rem', padding: 'clamp(2rem, 5vw, 3rem)', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textAlign: 'center' }}>

        {/* Icône succès */}
        <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #14532d, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(22,101,52,0.3)' }}>
          <CheckCircle size={36} color="#fff" />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
          Bienvenue, {user.name.split(' ')[0]} !
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          Votre compte a été créé avec succès.
        </p>

        {/* Tarif */}
        {hasAddress && (
          <div style={{ background: bg, borderRadius: '1.25rem', padding: '2rem', marginBottom: '1.5rem', color: '#fff' }}>
            <div style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>
              Votre tarif — {label}
            </div>
            <div style={{ fontSize: '5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', marginBottom: '0.375rem' }}>
              ${price}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)' }}>
              passe saisonnier — payez une fois, jouez tout l'été
            </div>
          </div>
        )}

        {/* Avantages */}
        <div style={{ background: lightBg, border: `1.5px solid ${border}`, borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.75rem', textAlign: 'left' }}>
          {[
            'Réservations illimitées tout l\'été',
            'Sessions de 2h par terrain',
            'Confirmation par courriel',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
              <CheckCircle size={15} color={color} />
              <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate('/book')}
          style={{ width: '100%', background: bg, color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <CalendarCheck size={20} /> Réserver un terrain
        </button>
        <button onClick={() => navigate('/')}
          style={{ width: '100%', background: '#f8fafc', color: '#64748b', border: '1.5px solid #e2e8f0', borderRadius: '0.875rem', padding: '0.875rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer' }}>
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}
