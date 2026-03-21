import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, AlertCircle, CalendarCheck } from 'lucide-react'

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">Tarifs</span>
          <h1 className="section-title">Passe saisonnier — payé une seule fois</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Payez une seule fois au début de l'été et réservez librement jusqu'à la fin de l'été. Sessions de 2 heures, de 6h00 à 22h00.
          </p>
        </div>

        {/* Pricing cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          maxWidth: 780,
          margin: '0 auto 3.5rem',
        }}>
          {/* Resident */}
          <div style={{
            background: 'linear-gradient(160deg, #14532d 0%, #166534 60%, #15803d 100%)',
            color: '#fff',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(22,101,52,0.3)',
          }}>
            {/* Background decoration */}
            <div style={{ position: 'absolute', top: '-3rem', right: '-3rem', width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '-2rem', left: '-2rem', width: 100, height: 100, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />

            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                background: 'rgba(74,222,128,0.2)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ade80',
                padding: '0.375rem 0.875rem',
                borderRadius: '2rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                marginBottom: '1.5rem',
              }}>
                🏠 RÉSIDENT DE DONNACONA
              </div>

              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>$50</span>
              </div>
              <div style={{ color: '#86efac', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
                Passe saisonnier — paiement unique pour tout l'été
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  'Payé une seule fois par été',
                  'Sessions de 2h, de 6h00 à 22h00',
                  'Max 6h de jeu par semaine',
                  'Les 4 terrains disponibles',
                  'Preuve de résidence requise',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <CheckCircle size={17} color="#4ade80" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.9375rem' }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/book')}
                style={{
                  width: '100%',
                  background: '#4ade80',
                  color: '#14532d',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '0.875rem',
                  fontWeight: 800,
                  fontSize: '1.0625rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s, transform 0.1s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#86efac'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#4ade80'; e.currentTarget.style.transform = 'none' }}
              >
                <CalendarCheck size={19} />
                Réserver (résident)
              </button>
            </div>
          </div>

          {/* Non-resident */}
          <div style={{
            background: '#fff',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            border: '2px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.07)',
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              background: '#dbeafe',
              color: '#1d4ed8',
              padding: '0.375rem 0.875rem',
              borderRadius: '2rem',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: '1.5rem',
            }}>
              🌍 NON-RÉSIDENT
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>$75</span>
            </div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', fontWeight: 600 }}>
              Passe saisonnier — paiement unique pour tout l'été
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                'Payé une seule fois par été',
                'Sessions de 2h, de 6h00 à 22h00',
                'Max 6h de jeu par semaine',
                'Les 4 terrains disponibles',
                'Ouvert à tous les visiteurs',
              ].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <CheckCircle size={17} color="#166534" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.9375rem', color: '#334155' }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => navigate('/book')}
              className="btn-accent"
              style={{ width: '100%', fontSize: '1.0625rem', padding: '1rem' }}
            >
              <CalendarCheck size={19} />
              Réserver (non-résident)
            </button>
          </div>
        </div>


        {/* FAQ */}
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Foire aux questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'Quelle est la durée de chaque réservation ?', a: 'Chaque réservation est de 2 heures. Un utilisateur ne peut pas réserver deux créneaux consécutifs le même jour.' },
              { q: 'Combien d\'heures puis-je réserver par semaine ?', a: 'Chaque utilisateur a un maximum de 6 heures par semaine (soit 3 sessions de 2 heures).' },
              { q: 'Puis-je annuler ou reporter ma réservation ?', a: 'Oui, les annulations et reports sont acceptés jusqu\'à 24 heures avant votre session. Contactez-nous par téléphone ou courriel.' },
              { q: 'De l\'équipement est-il fourni ?', a: 'Les palettes et les balles ne sont pas fournies. Veuillez apporter votre propre équipement.' },
              { q: 'Combien de joueurs par terrain ?', a: 'Jusqu\'à 4 joueurs par terrain en double, ou 2 en simple. La réservation couvre l\'ensemble du terrain.' },
              { q: 'L\'installation est-elle accessible ?', a: 'Oui, l\'installation est accessible aux personnes en fauteuil roulant avec des espaces de stationnement adaptés.' },
            ].map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '0.875rem',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s',
      boxShadow: open ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '1.125rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          textAlign: 'left',
          cursor: 'pointer',
          gap: '1rem',
        }}
      >
        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{q}</span>
        <span style={{
          width: 24, height: 24, borderRadius: '50%',
          background: open ? '#166534' : '#f1f5f9',
          color: open ? '#fff' : '#64748b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1.125rem', fontWeight: 700,
          transition: 'all 0.2s',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 1.5rem 1.25rem', color: '#64748b', lineHeight: 1.7, fontSize: '0.9375rem' }}>
          {a}
        </div>
      )}
    </div>
  )
}

