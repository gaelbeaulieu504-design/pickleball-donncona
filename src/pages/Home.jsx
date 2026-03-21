import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MapPin, ChevronRight, CheckCircle, ChevronLeft } from 'lucide-react'
import { useBookings } from '../context/BookingContext'
import { COURTS, START_TIMES } from '../data/courts'
import { format, addDays, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function Home() {
  const navigate = useNavigate()
  const { getBookedIndices } = useBookings()
  const [selectedDate, setSelectedDate] = useState(new Date())

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dateLabel = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })

  // Build availability grid: for each court, which hours are free
  const availability = COURTS.map(court => {
    const booked = getBookedIndices(court.id, dateStr)
    return {
      ...court,
      slots: START_TIMES.map((time, idx) => ({ time, available: !booked.has(idx) })),
    }
  })

  const totalAvailable = availability.reduce((sum, c) => sum + c.slots.filter(s => s.available).length, 0)
  const totalSlots = COURTS.length * START_TIMES.length

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #0D2E5C 0%, #1B4E8B 55%, #2563A8 100%)',
        color: '#fff',
        padding: 'clamp(4rem, 10vw, 7rem) 0 clamp(3rem, 8vw, 5rem)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05,
          backgroundImage: `
            repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(90deg, #fff 0, #fff 1px, transparent 1px, transparent 60px)
          `,
        }} />
        <div style={{ position: 'absolute', right: '-5rem', top: '-5rem', width: 400, height: 400, background: 'rgba(168,213,232,0.08)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', left: '-8rem', bottom: '-8rem', width: 500, height: 500, background: 'rgba(46,125,50,0.07)', borderRadius: '50%' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(168,213,232,0.18)', border: '1px solid rgba(168,213,232,0.35)',
            color: '#A8D5E8', padding: '0.375rem 1rem', borderRadius: '2rem',
            fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            <MapPin size={13} /> Donnacona, Québec
          </div>

          <h1 style={{ fontSize: 'clamp(2.25rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', maxWidth: 700 }}>
            Réservez votre<br />
            <span style={{ color: '#5CB85C' }}>terrain de pickleball</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: '#A8D5E8', maxWidth: 560, lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Jouez sur les terrains de pickleball de Donnacona. 4 terrains extérieurs disponibles en ligne — résidents et visiteurs bienvenus.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <button className="btn-accent" style={{ fontSize: '1.0625rem', padding: '1rem 2.25rem' }} onClick={() => navigate('/book')}>
              <CalendarCheck size={20} /> Réserver un terrain
            </button>
            <button
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '1.0625rem', padding: '1rem 2.25rem', background: 'transparent', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => navigate('/pricing')}
            >
              Voir les tarifs
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
            {[
              { value: '4', label: 'Terrains extérieurs' },
              { value: '$50', label: 'Tarif résident' },
              { value: '$75', label: 'Tarif non-résident' },
              { value: '6h–22h', label: "Heures d'ouverture" },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#5CB85C' }}>{s.value}</div>
                <div style={{ fontSize: '0.875rem', color: '#A8D5E8' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Court illustration */}
      <div style={{ background: '#1B4E8B', padding: '2.5rem 0', overflow: 'hidden' }}>
        <CourtIllustration />
      </div>

      {/* ── DISPONIBILITÉS ── */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">En temps réel</span>
            <h2 className="section-title">Disponibilités des terrains</h2>
            <p className="section-subtitle">Choisissez une date pour voir les créneaux libres sur chacun des 4 terrains.</p>
          </div>

          {/* Date picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <button onClick={() => setSelectedDate(d => subDays(d, 1))} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#334155', fontWeight: 600, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1B4E8B'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            ><ChevronLeft size={18} /></button>

            <div style={{ background: '#fff', border: '1.5px solid #1B4E8B', borderRadius: '0.75rem', padding: '0.625rem 1.5rem', fontWeight: 700, color: '#1B4E8B', fontSize: '0.9375rem', textTransform: 'capitalize', minWidth: 240, textAlign: 'center' }}>
              {dateLabel}
            </div>

            <button onClick={() => setSelectedDate(d => addDays(d, 1))} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '0.625rem', padding: '0.5rem 0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#334155', fontWeight: 600, transition: 'all 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#1B4E8B'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            ><ChevronRight size={18} /></button>
          </div>

          {/* Summary bar */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: '#2E7D32' }} />
              <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Disponible — {totalAvailable} créneaux</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>Réservé — {totalSlots - totalAvailable} créneaux</span>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {availability.map(court => (
              <div key={court.id} style={{ background: '#fff', borderRadius: '1rem', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                {/* Court header */}
                <div style={{ background: '#1B4E8B', padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{court.name}</span>
                  <span style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '2rem' }}>
                    {court.slots.filter(s => s.available).length}/{court.slots.length} libres
                  </span>
                </div>

                {/* Slots */}
                <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                  {court.slots.map(slot => (
                    <div
                      key={slot.time}
                      title={slot.available ? `${slot.time} — Disponible` : `${slot.time} — Réservé`}
                      style={{
                        background: slot.available ? '#f0fdf0' : '#f1f5f9',
                        border: `1.5px solid ${slot.available ? '#86efac' : '#e2e8f0'}`,
                        borderRadius: '0.375rem',
                        padding: '0.3rem 0.2rem',
                        textAlign: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: slot.available ? '#166534' : '#94a3b8',
                        cursor: slot.available ? 'pointer' : 'default',
                        transition: 'all 0.15s',
                      }}
                      onClick={() => slot.available && navigate('/book')}
                      onMouseEnter={e => { if (slot.available) e.currentTarget.style.background = '#bbf7d0' }}
                      onMouseLeave={e => { if (slot.available) e.currentTarget.style.background = '#f0fdf0' }}
                    >
                      {slot.time}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={() => navigate('/book')}>
              <CalendarCheck size={18} /> Réserver un terrain <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Processus simple</span>
            <h2 className="section-title">Comment ça fonctionne</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Réservez votre terrain en quelques minutes — simple et rapide.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { step: 1, icon: '📅', title: 'Choisir une date', desc: 'Sélectionnez une date disponible sur notre calendrier interactif.' },
              { step: 2, icon: '🎾', title: 'Choisir un terrain', desc: 'Choisissez parmi nos 4 terrains extérieurs selon les disponibilités.' },
              { step: 3, icon: '🏠', title: 'Résident ou non', desc: 'Indiquez votre statut pour connaître votre tarif (2h par session).' },
              { step: 4, icon: '💳', title: 'Payer & confirmer', desc: 'Paiement sécurisé en ligne et confirmation instantanée par courriel.' },
            ].map(s => (
              <div key={s.step} style={{ background: '#fff', borderRadius: '1rem', padding: '2rem 1.5rem', border: '1px solid #e2e8f0', position: 'relative', transition: 'box-shadow 0.2s, transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ position: 'absolute', top: '-1rem', left: '1.5rem', width: 32, height: 32, background: '#1B4E8B', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem' }}>{s.step}</div>
                <div style={{ fontSize: '2.25rem', marginBottom: '0.75rem', marginTop: '0.5rem' }}>{s.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.125rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn-primary" onClick={() => navigate('/book')}>
              <CalendarCheck size={18} /> Réserver un terrain <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Pricing</span>
            <h2 className="section-title">Tarifs simples et transparents</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Sessions de 2 heures par terrain. Une preuve de résidence peut être exigée.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 680, margin: '0 auto' }}>
            <div style={{ background: 'linear-gradient(135deg, #1B4E8B, #2563A8)', color: '#fff', borderRadius: '1.25rem', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: 120, height: 120, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
              <div style={{ background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.06em' }}>DONNACONA RÉSIDENT</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1 }}>$50</div>
              <div style={{ color: '#A8D5E8', marginBottom: '1.5rem', marginTop: '0.25rem' }}>par 2 heures / par terrain</div>
              {['Réservation de 2 heures', 'Réservation en ligne', 'Preuve de résidence requise'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#5CB85C" />
                  <span style={{ fontSize: '0.9375rem' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/book')} style={{ marginTop: '1.5rem', background: '#5CB85C', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#4CAF50'}
                onMouseLeave={e => e.currentTarget.style.background = '#5CB85C'}
              >Réserver (résident)</button>
            </div>

            <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2.5rem 2rem', textAlign: 'center', border: '2px solid #e2e8f0' }}>
              <div style={{ background: '#EBF3FB', color: '#1B4E8B', display: 'inline-block', padding: '0.375rem 1rem', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.06em' }}>NON-RÉSIDENT</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>$75</div>
              <div style={{ color: '#64748b', marginBottom: '1.5rem', marginTop: '0.25rem' }}>par 2 heures / par terrain</div>
              {['Réservation de 2 heures', 'Réservation en ligne', 'Ouvert à tous les visiteurs'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#1B4E8B" />
                  <span style={{ fontSize: '0.9375rem', color: '#334155' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/book')} className="btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Réserver (non-résident)</button>
            </div>
          </div>
        </div>
      </section>

      {/* Facility highlights */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Nos installations</span>
            <h2 className="section-title">Des terrains de qualité à Donnacona</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Tout ce qu'il vous faut pour une expérience de pickleball mémorable.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '🎯', title: '4 terrains extérieurs', desc: 'Terrains extérieurs de qualité professionnelle avec éclairage.' },
              { icon: '🅿️', title: 'Stationnement gratuit', desc: 'Accès facile au stationnement directement sur place.' },
              { icon: '🤝', title: 'Communauté accueillante', desc: 'Un environnement convivial pour tous les niveaux.' },
              { icon: '📱', title: 'Réservation facile', desc: "Réservez en ligne 24h/7j depuis n'importe quel appareil." },
              { icon: '⚡', title: 'Confirmation instantanée', desc: 'Recevez votre confirmation par courriel immédiatement.' },
              { icon: '🌿', title: 'Cadre agréable', desc: 'Situé au cœur de la communauté de Donnacona.' },
            ].map(f => (
              <div key={f.title} style={{ background: '#fff', borderRadius: '1rem', padding: '1.75rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start', transition: 'box-shadow 0.2s' }}
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
      <section style={{ background: 'linear-gradient(135deg, #1B4E8B, #143A6B)', padding: 'clamp(3rem, 8vw, 4.5rem) 0', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🎾</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: '1rem' }}>Prêt à jouer ?</h2>
          <p style={{ color: '#A8D5E8', fontSize: '1.125rem', marginBottom: '2rem' }}>Réservez votre terrain aujourd'hui et profitez des installations de Donnacona.</p>
          <button className="btn-accent" style={{ fontSize: '1.0625rem', padding: '1rem 2.5rem' }} onClick={() => navigate('/book')}>
            <CalendarCheck size={20} /> Réserver un terrain
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
        {[0, 1, 2, 3].map(i => (
          <g key={i} transform={`translate(${10 + i * 202}, 10)`}>
            <rect x="0" y="0" width="188" height="180" fill="#1e5fa8" stroke="#A8D5E8" strokeWidth="2" rx="4" />
            <rect x="0" y="55" width="188" height="70" fill="none" stroke="#A8D5E8" strokeWidth="1.5" />
            <line x1="94" y1="0" x2="94" y2="55" stroke="#A8D5E8" strokeWidth="1.5" />
            <line x1="94" y1="125" x2="94" y2="180" stroke="#A8D5E8" strokeWidth="1.5" />
            <line x1="0" y1="90" x2="188" y2="90" stroke="#e2e8f0" strokeWidth="3" />
            <circle cx="0" cy="90" r="4" fill="#94a3b8" />
            <circle cx="188" cy="90" r="4" fill="#94a3b8" />
            <text x="94" y="163" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">Terrain {i + 1}</text>
          </g>
        ))}
      </svg>
    </div>
  )
}
