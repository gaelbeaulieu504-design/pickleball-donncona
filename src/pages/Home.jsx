import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MapPin, Users, ChevronRight, CheckCircle, Star } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0f2e1a 0%, #14532d 50%, #166534 100%)',
        color: '#fff',
        padding: 'clamp(4rem, 10vw, 7rem) 0 clamp(3rem, 8vw, 5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Court lines decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.06,
          backgroundImage: `
            repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 60px)
          `,
        }} />
        {/* Ball decoration */}
        <div style={{
          position: 'absolute', right: '-5rem', top: '-5rem',
          width: 400, height: 400,
          background: 'rgba(34,197,94,0.08)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', left: '-8rem', bottom: '-8rem',
          width: 500, height: 500,
          background: 'rgba(34,197,94,0.05)',
          borderRadius: '50%',
        }} />

        <div className="container" style={{ position: 'relative' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#86efac',
            padding: '0.375rem 1rem',
            borderRadius: '2rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
          }}>
            <MapPin size={13} />
            Donnacona, Québec
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 6vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            maxWidth: 700,
          }}>
            Réservez votre<br />
            <span style={{ color: '#4ade80' }}>terrain de pickleball</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: '#bbf7d0',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            Jouez sur les terrains de pickleball de Donnacona. 4 terrains extérieurs disponibles en ligne — résidents et visiteurs bienvenus.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <button
              className="btn-primary"
              style={{ background: '#22c55e', color: '#0f172a', fontSize: '1.0625rem', padding: '1rem 2.25rem', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}
              onClick={() => navigate('/book')}
            >
              <CalendarCheck size={20} />
              Réserver un terrain
            </button>
            <button
              className="btn-secondary"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '1.0625rem', padding: '1rem 2.25rem' }}
              onClick={() => navigate('/pricing')}
            >
              Voir les tarifs
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '2rem',
          }}>
            {[
              { value: '4', label: 'Terrains extérieurs' },
              { value: '$30', label: 'Tarif résident' },
              { value: '$50', label: 'Tarif non-résident' },
              { value: '6h–22h', label: 'Heures d\'ouverture' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#4ade80' }}>{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: '#86efac' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pickleball court illustration banner */}
      <div style={{
        background: '#14532d',
        padding: '2.5rem 0',
        overflow: 'hidden',
      }}>
        <CourtIllustration />
      </div>

      {/* How It Works */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Processus simple</span>
            <h2 className="section-title">Comment ça fonctionne</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Réservez votre terrain en quelques minutes — simple et rapide.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { step: 1, icon: '📅', title: 'Choisir une date', desc: 'Sélectionnez une date disponible sur notre calendrier interactif.' },
              { step: 2, icon: '🎾', title: 'Choisir un terrain', desc: 'Choisissez parmi nos 4 terrains extérieurs selon les disponibilités.' },
              { step: 3, icon: '🏠', title: 'Résident ou non', desc: 'Indiquez votre statut pour connaître votre tarif (2h par session).' },
              { step: 4, icon: '💳', title: 'Payer & confirmer', desc: 'Paiement sécurisé en ligne et confirmation instantanée par courriel.' },
            ].map(s => (
              <div key={s.step} style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '2rem 1.5rem',
                border: '1px solid #e2e8f0',
                position: 'relative',
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{
                  position: 'absolute', top: '-1rem', left: '1.5rem',
                  width: 32, height: 32,
                  background: '#166534',
                  color: '#fff',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.875rem',
                }}>
                  {s.step}
                </div>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.125rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn-primary" onClick={() => navigate('/book')}>
              <CalendarCheck size={18} />
              Réserver un terrain
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Tarifs simples et transparents</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Sessions de 2 heures par terrain. Une preuve de résidence peut être exigée.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            maxWidth: 680,
            margin: '0 auto',
          }}>
            {/* Resident */}
            <div style={{
              background: 'linear-gradient(135deg, #14532d, #166534)',
              color: '#fff',
              borderRadius: '1.25rem',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: '-2rem', right: '-2rem',
                width: 120, height: 120,
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50%',
              }} />
              <div style={{
                background: 'rgba(255,255,255,0.15)',
                display: 'inline-block',
                padding: '0.375rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '0.06em',
              }}>DONNACONA RESIDENT</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>$30</div>
              <div style={{ color: '#86efac', marginBottom: '1.5rem', marginTop: '0.25rem' }}>par 2 heures / par terrain</div>
              {['Réservation de 2 heures', 'Réservation en ligne', 'Preuve de résidence requise'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#4ade80" />
                  <span style={{ fontSize: '0.9375rem' }}>{f}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/book')}
                style={{
                  marginTop: '1.5rem',
                  background: '#4ade80',
                  color: '#14532d',
                  border: 'none',
                  padding: '0.875rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#86efac'}
                onMouseLeave={e => e.currentTarget.style.background = '#4ade80'}
              >
                Réserver (résident)
              </button>
            </div>

            {/* Non-resident */}
            <div style={{
              background: '#fff',
              borderRadius: '1.25rem',
              padding: '2.5rem 2rem',
              textAlign: 'center',
              border: '2px solid #e2e8f0',
              position: 'relative',
            }}>
              <div style={{
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'inline-block',
                padding: '0.375rem 1rem',
                borderRadius: '2rem',
                fontSize: '0.8125rem',
                fontWeight: 700,
                marginBottom: '1rem',
                letterSpacing: '0.06em',
              }}>NON-RESIDENT</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>$50</div>
              <div style={{ color: '#64748b', marginBottom: '1.5rem', marginTop: '0.25rem' }}>par 2 heures / par terrain</div>
              {['Réservation de 2 heures', 'Réservation en ligne', 'Ouvert à tous les visiteurs'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#166534" />
                  <span style={{ fontSize: '0.9375rem', color: '#334155' }}>{f}</span>
                </div>
              ))}
              <button
                onClick={() => navigate('/book')}
                className="btn-accent"
                style={{ marginTop: '1.5rem', width: '100%' }}
              >
                Réserver (non-résident)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Facility highlights */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Nos installations</span>
            <h2 className="section-title">Des terrains de qualité à Donnacona</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Tout ce qu'il vous faut pour une expérience de pickleball mémorable.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: '🎯', title: '4 terrains extérieurs', desc: 'Terrains extérieurs de qualité professionnelle avec éclairage.' },
              { icon: '🅿️', title: 'Stationnement gratuit', desc: 'Accès facile au stationnement directement sur place.' },
              { icon: '🤝', title: 'Communauté accueillante', desc: 'Un environnement convivial pour tous les niveaux.' },
              { icon: '📱', title: 'Réservation facile', desc: 'Réservez en ligne 24h/7j depuis n\'importe quel appareil.' },
              { icon: '⚡', title: 'Confirmation instantanée', desc: 'Recevez votre confirmation par courriel immédiatement.' },
              { icon: '🌿', title: 'Cadre agréable', desc: 'Situé au cœur de la communauté de Donnacona.' },
            ].map(f => (
              <div key={f.title} style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '1.75rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem', fontSize: '1rem' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section style={{
        background: 'linear-gradient(135deg, #166534, #14532d)',
        padding: 'clamp(3rem, 8vw, 4.5rem) 0',
        textAlign: 'center',
        color: '#fff',
      }}>
        <div className="container">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎾</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
            Prêt à jouer ?
          </h2>
          <p style={{ color: '#bbf7d0', fontSize: '1.125rem', marginBottom: '2rem' }}>
            Réservez votre terrain aujourd'hui et profitez des installations de Donnacona.
          </p>
          <button
            className="btn-primary"
            style={{ background: '#4ade80', color: '#14532d', fontSize: '1.0625rem', padding: '1rem 2.5rem', boxShadow: '0 4px 20px rgba(74,222,128,0.4)' }}
            onClick={() => navigate('/book')}
          >
            <CalendarCheck size={20} />
            Réserver un terrain
          </button>
        </div>
      </section>
    </div>
  )
}

function CourtIllustration() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 820 200" style={{ width: '100%', maxWidth: 820, height: 'auto' }}>
        {/* 4 courts side by side */}
        {[0, 1, 2, 3].map(i => (
          <g key={i} transform={`translate(${10 + i * 202}, 10)`}>
            <rect x="0" y="0" width="188" height="180" fill="#1a7a3e" stroke="#4ade80" strokeWidth="2" rx="4" />
            <rect x="0" y="55" width="188" height="70" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            <line x1="94" y1="0" x2="94" y2="55" stroke="#4ade80" strokeWidth="1.5" />
            <line x1="94" y1="125" x2="94" y2="180" stroke="#4ade80" strokeWidth="1.5" />
            <line x1="0" y1="90" x2="188" y2="90" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="0" cy="90" r="4" fill="#94a3b8" />
            <circle cx="188" cy="90" r="4" fill="#94a3b8" />
            <text x="94" y="163" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
              Terrain {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
