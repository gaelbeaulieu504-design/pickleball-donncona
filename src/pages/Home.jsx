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
            Reserve Your<br />
            <span style={{ color: '#4ade80' }}>Pickleball Court</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: '#bbf7d0',
            maxWidth: 560,
            lineHeight: 1.7,
            marginBottom: '2.5rem',
          }}>
            Play at Donnacona's newest pickleball courts. 6 premium outdoor courts available to book online — residents and visitors welcome.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <button
              className="btn-primary"
              style={{ background: '#22c55e', color: '#0f172a', fontSize: '1.0625rem', padding: '1rem 2.25rem', boxShadow: '0 4px 20px rgba(34,197,94,0.4)' }}
              onClick={() => navigate('/book')}
            >
              <CalendarCheck size={20} />
              Book a Court
            </button>
            <button
              className="btn-secondary"
              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', fontSize: '1.0625rem', padding: '1rem 2.25rem' }}
              onClick={() => navigate('/pricing')}
            >
              View Pricing
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '2rem',
          }}>
            {[
              { value: '6', label: 'Outdoor Courts' },
              { value: '$30', label: 'Resident Rate' },
              { value: '$50', label: 'Non-resident Rate' },
              { value: '7 AM', label: 'Opens Daily' },
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
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Book your court in minutes — no account required.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { step: 1, icon: '📅', title: 'Choose a Date', desc: 'Pick any available date on our interactive calendar.' },
              { step: 2, icon: '🎾', title: 'Select a Court', desc: 'Choose from our 6 outdoor courts based on availability.' },
              { step: 3, icon: '🏠', title: 'Confirm Status', desc: 'Select resident or non-resident to see your price.' },
              { step: 4, icon: '💳', title: 'Pay & Confirm', desc: 'Secure online payment and instant email confirmation.' },
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
              Book a Court Now
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
            <h2 className="section-title">Simple, Transparent Pricing</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              One-hour court sessions. Proof of Donnacona residency may be required.
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
              <div style={{ color: '#86efac', marginBottom: '1.5rem', marginTop: '0.25rem' }}>per hour / per court</div>
              {['1-hour court reservation', 'Online booking', 'Proof of residency required'].map(f => (
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
                Book as Resident
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
              <div style={{ color: '#64748b', marginBottom: '1.5rem', marginTop: '0.25rem' }}>per hour / per court</div>
              {['1-hour court reservation', 'Online booking', 'Open to all visitors'].map(f => (
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
                Book as Non-Resident
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Facility highlights */}
      <section style={{ padding: 'clamp(3rem, 8vw, 5rem) 0', background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="section-tag">Our Facility</span>
            <h2 className="section-title">World-Class Courts in Donnacona</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Everything you need for a great pickleball experience.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.25rem',
          }}>
            {[
              { icon: '🎯', title: '6 Outdoor Courts', desc: 'Professional-grade outdoor pickleball courts with proper lighting.' },
              { icon: '🅿️', title: 'Free Parking', desc: 'Easy access parking directly on site — no hassle.' },
              { icon: '🤝', title: 'Community Focused', desc: 'A friendly, welcoming environment for all skill levels.' },
              { icon: '📱', title: 'Easy Booking', desc: 'Book online 24/7 from any device in just a few clicks.' },
              { icon: '⚡', title: 'Instant Confirmation', desc: 'Receive instant email confirmation after booking.' },
              { icon: '🌿', title: 'Beautiful Setting', desc: "Located in the heart of Donnacona's community." },
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
            Ready to Play?
          </h2>
          <p style={{ color: '#bbf7d0', fontSize: '1.125rem', marginBottom: '2rem' }}>
            Book your court today and enjoy Donnacona's favourite pickleball facility.
          </p>
          <button
            className="btn-primary"
            style={{ background: '#4ade80', color: '#14532d', fontSize: '1.0625rem', padding: '1rem 2.5rem', boxShadow: '0 4px 20px rgba(74,222,128,0.4)' }}
            onClick={() => navigate('/book')}
          >
            <CalendarCheck size={20} />
            Book a Court Now
          </button>
        </div>
      </section>
    </div>
  )
}

function CourtIllustration() {
  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 800 200" style={{ width: '100%', maxWidth: 800, height: 'auto' }}>
        {/* 3 courts side by side */}
        {[0, 1, 2].map(i => (
          <g key={i} transform={`translate(${20 + i * 260}, 10)`}>
            <rect x="0" y="0" width="240" height="180" fill="#1a7a3e" stroke="#4ade80" strokeWidth="2" rx="4" />
            {/* Kitchen lines */}
            <rect x="0" y="60" width="240" height="60" fill="none" stroke="#4ade80" strokeWidth="1.5" />
            {/* Center line */}
            <line x1="120" y1="0" x2="120" y2="60" stroke="#4ade80" strokeWidth="1.5" />
            <line x1="120" y1="120" x2="120" y2="180" stroke="#4ade80" strokeWidth="1.5" />
            {/* Net */}
            <line x1="0" y1="90" x2="240" y2="90" stroke="#e2e8f0" strokeWidth="3" />
            {/* Posts */}
            <circle cx="0" cy="90" r="4" fill="#94a3b8" />
            <circle cx="240" cy="90" r="4" fill="#94a3b8" />
            {/* Court label */}
            <text x="120" y="160" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Inter, sans-serif" fontWeight="600">
              Court {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}
