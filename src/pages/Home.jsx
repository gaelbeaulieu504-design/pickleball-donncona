import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarCheck, MapPin, ChevronRight, CheckCircle, ChevronLeft, Users, Star, Clock, Shield, X } from 'lucide-react'
import { useBookings } from '../context/BookingContext'
import { useAuth } from '../context/AuthContext'
import { COURTS, START_TIMES } from '../data/courts'
import { format, addDays, subDays } from 'date-fns'
import { fr } from 'date-fns/locale'

const HERO_PHOTOS = ['/terrain1.jpg', '/terrain2.jpg', '/terrain3.jpg']

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getBookedIndices } = useBookings()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [heroPhoto, setHeroPhoto] = useState(0)
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('pb_welcome_seen')
  })

  useEffect(() => {
    const t = setInterval(() => setHeroPhoto(p => (p + 1) % HERO_PHOTOS.length), 5000)
    return () => clearInterval(t)
  }, [])

  function closeWelcome() {
    sessionStorage.setItem('pb_welcome_seen', '1')
    setShowWelcome(false)
  }

  const dateStr = format(selectedDate, 'yyyy-MM-dd')
  const dateLabel = format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })

  const pickleballCourts = COURTS.filter(c => c.sport === 'pickleball')

  const availability = pickleballCourts.map(court => {
    const booked = getBookedIndices(court.id, dateStr)
    return {
      ...court,
      slots: START_TIMES.map((time, idx) => ({ time, available: !booked.has(idx) })),
    }
  })

  const totalAvailable = availability.reduce((sum, c) => sum + c.slots.filter(s => s.available).length, 0)
  const totalSlots = pickleballCourts.length * START_TIMES.length

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── MODAL BIENVENUE ── */}
      {showWelcome && !user && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,20,50,0.7)', backdropFilter: 'blur(4px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '1.5rem', padding: 'clamp(2rem,5vw,3rem)', width: '100%', maxWidth: 480, boxShadow: '0 24px 80px rgba(0,0,0,0.25)', position: 'relative' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #14532d, #22c55e)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/><path d="M3 12 Q8 6 12 12 Q16 18 21 12" stroke="white" strokeWidth="2" fill="none"/><path d="M12 3 Q18 8 12 12 Q6 16 12 21" stroke="white" strokeWidth="1.5" fill="none"/></svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Bienvenue à Donnacona !</h2>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>
                Créez un compte ou connectez-vous pour réserver un terrain de pickleball ou de tennis.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={() => { closeWelcome(); navigate('/register') }}
                style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                Créer un compte
              </button>
              <button onClick={() => { closeWelcome(); navigate('/login') }}
                style={{ background: '#f8fafc', color: '#0f172a', border: '2px solid #e2e8f0', borderRadius: '0.875rem', padding: '1rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: 'clamp(680px, 92vh, 920px)', overflow: 'hidden', color: '#fff' }}>
        {HERO_PHOTOS.map((src, i) => (
          <div key={src} style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === heroPhoto ? 1 : 0,
            transition: 'opacity 1.4s ease-in-out',
            transform: 'scale(1.02)',
          }} />
        ))}
        {/* Multi-layer overlay for depth */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,20,50,0.72) 0%, rgba(5,20,50,0.45) 60%, rgba(5,20,50,0.65) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,20,50,0.85) 0%, transparent 55%)' }} />

        <div className="container" style={{ position: 'relative', minHeight: 'inherit', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '6rem', paddingBottom: 'clamp(3rem, 6vw, 5rem)' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(92,184,92,0.2)', backdropFilter: 'blur(12px)', border: '1px solid rgba(92,184,92,0.4)', color: '#86efac', padding: '0.4rem 1.1rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem', width: 'fit-content' }}>
            <MapPin size={12} /> Donnacona, Québec · Été 2026
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '1.25rem', maxWidth: 760, letterSpacing: '-0.02em' }}>
            Réservez votre terrain de<br />
            <span style={{ background: 'linear-gradient(90deg, #5CB85C, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>pickleball et tennis</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', color: 'rgba(255,255,255,0.82)', maxWidth: 540, lineHeight: 1.75, marginBottom: '2.25rem' }}>
            6 terrains de pickleball et 2 terrains de tennis à Donnacona.<br />Accès libre pour tous — résidents et visiteurs bienvenus.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', marginBottom: '3rem' }}>
            <button className="btn-accent" style={{ fontSize: '1.0625rem', padding: '0.95rem 2.25rem', boxShadow: '0 8px 32px rgba(92,184,92,0.45)', borderRadius: '0.875rem' }} onClick={() => navigate('/book')}>
              <CalendarCheck size={20} /> Réserver un terrain
            </button>
            <button style={{ color: '#fff', fontSize: '1rem', padding: '0.95rem 2rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => navigate('/pricing')}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.45)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
            >Voir les tarifs</button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {[
              { value: '8', label: 'Terrains extérieurs' },
              { value: '$40', label: 'Passe résident / été' },
              { value: '$85', label: 'Passe non-résident / été' },
              { value: '6h–22h', label: "Heures d'ouverture" },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.875rem', padding: '0.75rem 1.25rem', textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: '1.625rem', fontWeight: 900, color: '#5CB85C', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', marginTop: '0.3rem', fontWeight: 600, letterSpacing: '0.02em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '2.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {HERO_PHOTOS.map((_, i) => (
            <button key={i} onClick={() => setHeroPhoto(i)} style={{ width: i === heroPhoto ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', background: i === heroPhoto ? '#5CB85C' : 'rgba(255,255,255,0.35)', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>

      </section>

      {/* ── ACCÈS LIBRE vs PASSE ── */}
      <section style={{ padding: 'clamp(3rem, 7vw, 5rem) 0', background: '#fff' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">Bon à savoir</span>
            <h2 className="section-title">Accès libre pour tout le monde !</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Les 6 terrains de pickleball et les 2 terrains de tennis sont ouverts à tous — sans réservation et sans passe.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: '1.5rem', padding: '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', width: 100, height: 100, background: 'rgba(134,239,172,0.15)', borderRadius: '50%' }} />
              <div style={{ width: 52, height: 52, borderRadius: '1rem', background: '#dcfce7', border: '2px solid #86efac', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Users size={24} color="#166534" />
              </div>
              <h3 style={{ fontWeight: 800, color: '#14532d', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Accès libre — tous les terrains</h3>
              <p style={{ color: '#166534', lineHeight: 1.75, fontSize: '0.9375rem', margin: 0 }}>
                Les <strong>6 terrains de pickleball</strong> et les <strong>2 terrains de tennis</strong> sont accessibles à tous <strong>sans réservation et sans passe</strong>. Venez jouer librement !
              </p>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #fefce8, #fef9c3)', border: '1.5px solid #fde68a', borderRadius: '1.5rem', padding: '2.25rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-1.5rem', right: '-1.5rem', width: 100, height: 100, background: 'rgba(253,230,138,0.2)', borderRadius: '50%' }} />
              <div style={{ width: 52, height: 52, borderRadius: '1rem', background: '#fef9c3', border: '2px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                <Star size={24} color="#b45309" />
              </div>
              <h3 style={{ fontWeight: 800, color: '#78350f', fontSize: '1.2rem', marginBottom: '0.75rem' }}>Réservation = priorité</h3>
              <p style={{ color: '#92400e', lineHeight: 1.75, fontSize: '0.9375rem', margin: 0 }}>
                Les personnes ayant une <strong>réservation en ligne</strong> ont la priorité sur les terrains. Si un joueur avec réservation arrive, les joueurs sans réservation doivent lui céder le terrain.
              </p>
            </div>
          </div>

          <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1.5px solid #bfdbfe', borderRadius: '1.5rem', padding: '1.5rem 2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '1rem', background: '#dbeafe', border: '2px solid #93c5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.5rem' }}>🎫</div>
            <p style={{ color: '#1e40af', fontSize: '0.9375rem', lineHeight: 1.7, margin: 0 }}>
              <strong>Passe saisonnier ($40 résident / $85 non-résident) :</strong> obtenez votre passe une seule fois et réservez vos terrains en ligne tout l'été pour garantir votre place.
            </p>
          </div>
        </div>
      </section>

      {/* ── DISPONIBILITÉS ── */}
      <section style={{ padding: 'clamp(3.5rem, 9vw, 6rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span className="section-tag">En temps réel</span>
            <h2 className="section-title">Disponibilités des terrains</h2>
            <p className="section-subtitle">Choisissez une date pour voir les créneaux libres sur chacun des 6 terrains de pickleball.</p>
          </div>

          {/* Date picker */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', marginBottom: '2rem' }}>
            <button onClick={() => setSelectedDate(d => subDays(d, 1))} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.625rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#334155', fontWeight: 600, transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B4E8B'; e.currentTarget.style.color = '#1B4E8B' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
            ><ChevronLeft size={18} /></button>

            <div style={{ background: '#fff', border: '2px solid #1B4E8B', borderRadius: '0.875rem', padding: '0.75rem 1.75rem', fontWeight: 800, color: '#1B4E8B', fontSize: '0.9375rem', textTransform: 'capitalize', minWidth: 260, textAlign: 'center', boxShadow: '0 2px 12px rgba(27,78,139,0.12)' }}>
              {dateLabel}
            </div>

            <button onClick={() => setSelectedDate(d => addDays(d, 1))} style={{ background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.625rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#334155', fontWeight: 600, transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#1B4E8B'; e.currentTarget.style.color = '#1B4E8B' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#334155' }}
            ><ChevronRight size={18} /></button>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#22c55e' }} />
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Disponible — {totalAvailable} créneaux</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: '#e2e8f0' }} />
              <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>Réservé — {totalSlots - totalAvailable} créneaux</span>
            </div>
          </div>

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.25rem' }}>
            {availability.map(court => (
              <div key={court.id} style={{ background: '#fff', borderRadius: '1.125rem', border: '1.5px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.05)' }}
              >
                <div style={{ background: 'linear-gradient(135deg, #1B4E8B, #2563A8)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '0.9rem' }}>{court.id}</div>
                    <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{court.name}</span>
                  </div>
                  <span style={{ background: 'rgba(92,184,92,0.25)', color: '#86efac', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '2rem', border: '1px solid rgba(92,184,92,0.3)' }}>
                    {court.slots.filter(s => s.available).length}/{court.slots.length} libres
                  </span>
                </div>
                <div style={{ padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.375rem' }}>
                  {court.slots.map(slot => (
                    <div key={slot.time} title={slot.available ? `${slot.time} — Disponible` : `${slot.time} — Réservé`}
                      style={{ background: slot.available ? '#f0fdf4' : '#f8fafc', border: `1.5px solid ${slot.available ? '#86efac' : '#e2e8f0'}`, borderRadius: '0.375rem', padding: '0.3rem 0.2rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: slot.available ? '#166534' : '#cbd5e1', cursor: slot.available ? 'pointer' : 'default', transition: 'all 0.15s' }}
                      onClick={() => slot.available && navigate('/book')}
                      onMouseEnter={e => { if (slot.available) { e.currentTarget.style.background = '#dcfce7'; e.currentTarget.style.borderColor = '#4ade80' } }}
                      onMouseLeave={e => { if (slot.available) { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.borderColor = '#86efac' } }}
                    >{slot.time}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
            <button className="btn-primary" onClick={() => navigate('/book')} style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
              <CalendarCheck size={18} /> Réserver un terrain <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── COMMENT ÇA FONCTIONNE ── */}
      <section style={{ padding: 'clamp(3.5rem, 9vw, 6rem) 0', background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <span className="section-tag">Processus simple</span>
            <h2 className="section-title">Comment ça fonctionne</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Réservez votre terrain en quelques minutes — simple et rapide.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {[
              { step: 1, icon: '📅', title: 'Choisir une date', desc: 'Sélectionnez une date disponible sur notre calendrier interactif.', color: '#dbeafe', accent: '#1B4E8B' },
              { step: 2, icon: '🎾', title: 'Choisir un terrain', desc: 'Choisissez parmi nos 6 terrains selon les disponibilités.', color: '#dcfce7', accent: '#166534' },
              { step: 3, icon: '🏠', title: 'Résident ou non', desc: 'Indiquez votre statut pour connaître votre tarif (sessions de 2h).', color: '#fef9c3', accent: '#b45309' },
              { step: 4, icon: '💳', title: 'Payer & confirmer', desc: 'Paiement sécurisé en ligne et confirmation instantanée par courriel.', color: '#fce7f3', accent: '#9d174d' },
            ].map((s, i) => (
              <div key={s.step} style={{ background: '#fff', borderRadius: '1.25rem', padding: '2.25rem 1.75rem 1.75rem', border: '1.5px solid #f1f5f9', position: 'relative', transition: 'all 0.25s', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = s.accent + '40' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#f1f5f9' }}
              >
                {/* Step number */}
                <div style={{ position: 'absolute', top: '-14px', left: '1.5rem', width: 30, height: 30, background: s.accent, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', boxShadow: `0 4px 12px ${s.accent}50` }}>{s.step}</div>
                {/* Connector line */}
                {i < 3 && <div style={{ display: 'none' }} />}
                <div style={{ width: 52, height: 52, borderRadius: '1rem', background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.625rem', marginBottom: '1rem', marginTop: '0.25rem' }}>{s.icon}</div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.1rem' }}>{s.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9125rem', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <button className="btn-primary" onClick={() => navigate('/book')} style={{ padding: '0.875rem 2.5rem', fontSize: '1rem' }}>
              <CalendarCheck size={18} /> Réserver un terrain <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ── TARIFS ── */}
      <section style={{ padding: 'clamp(3.5rem, 9vw, 6rem) 0', background: 'linear-gradient(135deg, #0f2a50 0%, #1B4E8B 60%, #1e5fa8 100%)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        {/* Décoration */}
        <div style={{ position: 'absolute', top: '-6rem', right: '-4rem', width: 320, height: 320, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-5rem', left: '-3rem', width: 260, height: 260, background: 'rgba(92,184,92,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.375rem 1rem', borderRadius: '2rem', marginBottom: '0.875rem' }}>Tarifs</span>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: '1rem' }}>Passe saisonnier — payez une fois,<br />jouez tout l'été</h2>
            <p style={{ fontSize: '1.1rem', color: 'rgba(168,213,232,0.9)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }}>Un seul paiement pour toute la saison estivale. Sessions de 2 heures par terrain. Une preuve de résidence peut être exigée.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: 680, margin: '0 auto' }}>
            {/* Résident */}
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(92,184,92,0.4)', borderRadius: '1.5rem', padding: '2.5rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: 130, height: 130, background: 'rgba(92,184,92,0.08)', borderRadius: '50%' }} />
              <div style={{ background: 'rgba(92,184,92,0.2)', border: '1px solid rgba(92,184,92,0.4)', display: 'inline-block', padding: '0.375rem 1.1rem', borderRadius: '2rem', fontSize: '0.775rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.08em', color: '#86efac' }}>🏠 DONNACONA RÉSIDENT</div>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.02em', color: '#fff' }}>$40</div>
              <div style={{ color: 'rgba(168,213,232,0.8)', marginBottom: '1.75rem', marginTop: '0.375rem', fontSize: '0.9rem' }}>passe pour tout l'été — paiement unique</div>
              {["Réservations illimitées tout l'été", 'Sessions de 2h par terrain', 'Preuve de résidence requise'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.7rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#5CB85C" />
                  <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/book')} style={{ marginTop: '1.75rem', background: 'linear-gradient(135deg, #5CB85C, #4CAF50)', color: '#fff', border: 'none', padding: '0.9rem 2rem', borderRadius: '0.875rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%', boxShadow: '0 4px 20px rgba(92,184,92,0.5)', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >Réserver (résident)</button>
            </div>

            {/* Non-résident */}
            <div style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '1.5rem', padding: '2.5rem 2rem', textAlign: 'center', border: '1.5px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 40px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.2)' }}
            >
              <div style={{ position: 'absolute', top: '-2rem', right: '-2rem', width: 130, height: 130, background: '#f0f9ff', borderRadius: '50%' }} />
              <div style={{ background: '#EBF3FB', color: '#1B4E8B', display: 'inline-block', padding: '0.375rem 1.1rem', borderRadius: '2rem', fontSize: '0.775rem', fontWeight: 700, marginBottom: '1.25rem', letterSpacing: '0.08em' }}>🌍 NON-RÉSIDENT</div>
              <div style={{ fontSize: '4.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 1, letterSpacing: '-0.02em' }}>$85</div>
              <div style={{ color: '#94a3b8', marginBottom: '1.75rem', marginTop: '0.375rem', fontSize: '0.9rem' }}>passe pour tout l'été — paiement unique</div>
              {["Réservations illimitées tout l'été", 'Sessions de 2h par terrain', 'Ouvert à tous les visiteurs'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.7rem', justifyContent: 'center' }}>
                  <CheckCircle size={15} color="#1B4E8B" />
                  <span style={{ fontSize: '0.9rem', color: '#334155' }}>{f}</span>
                </div>
              ))}
              <button onClick={() => navigate('/book')} className="btn-primary" style={{ marginTop: '1.75rem', width: '100%', padding: '0.9rem 2rem', transition: 'transform 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >Réserver (non-résident)</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDÉOS ── */}
      <section style={{ padding: 'clamp(3rem, 7vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="section-tag">Nos terrains</span>
            <h2 className="section-title">Voyez nos installations</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Découvrez les terrains de pickleball et tennis de Donnacona en vidéo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {[
              '1MXvYYwdBDqJJe25hUhQAEPwEclTXdB-7',
              '1ic1sQd-pUUSSZPUJTYoc0MLjvyEfQF-e',
            ].map(id => (
              <div key={id} style={{ borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', aspectRatio: '16/9', background: '#000' }}>
                <iframe
                  src={`https://drive.google.com/file/d/${id}/preview?autoplay=1&loop=1`}
                  style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: 'linear-gradient(135deg, #0f3460 0%, #1B4E8B 50%, #1e5fa8 100%)', padding: 'clamp(4rem, 10vw, 6rem) 0', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-4rem', left: '10%', width: 300, height: 300, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-4rem', right: '5%', width: 400, height: 400, background: 'rgba(92,184,92,0.06)', borderRadius: '50%' }} />
        <div className="container" style={{ position: 'relative' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎾</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Prêt à jouer ?</h2>
          <p style={{ color: 'rgba(168,213,232,0.85)', fontSize: '1.125rem', marginBottom: '2.5rem', maxWidth: 480, margin: '0 auto 2.5rem' }}>
            Réservez votre terrain aujourd'hui et profitez des installations de Donnacona.
          </p>
          <button className="btn-accent" style={{ fontSize: '1.125rem', padding: '1.1rem 3rem', boxShadow: '0 8px 32px rgba(92,184,92,0.4)', borderRadius: '1rem' }} onClick={() => navigate('/book')}>
            <CalendarCheck size={22} /> Réserver un terrain
          </button>
        </div>
      </section>

    </div>
  )
}
