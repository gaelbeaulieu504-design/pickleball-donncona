import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, CalendarCheck, Users, Wifi, Shield } from 'lucide-react'

export default function About() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-tag">About the Facility</span>
          <h1 className="section-title">Donnacona's Pickleball Courts</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Quatre terrains extérieurs de qualité dans un cadre communautaire accueillant — conçus pour tous les niveaux.
          </p>
        </div>

        {/* Court visual */}
        <div style={{
          background: 'linear-gradient(135deg, #0f2e1a, #14532d)',
          borderRadius: '1.5rem',
          padding: 'clamp(2rem, 5vw, 3rem)',
          marginBottom: '3.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '2rem',
          alignItems: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', right: '-4rem', bottom: '-4rem', width: 200, height: 200, background: 'rgba(34,197,94,0.07)', borderRadius: '50%' }} />
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <div style={{ fontSize: '0.8125rem', color: '#4ade80', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
              Our Facility
            </div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: '1rem', lineHeight: 1.3 }}>
              4 Terrains extérieurs,<br />Ouverts à tous
            </h2>
            <p style={{ color: '#bbf7d0', lineHeight: 1.75, fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              Nos installations comprennent 4 terrains extérieurs de pickleball aux dimensions réglementaires, avec des surfaces de qualité, des filets permanents et un éclairage adéquat. Que vous débutiez ou que vous soyez un joueur compétitif, ces terrains sont pour vous.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['Permanent Nets', 'Court Lighting', 'Accessible', 'Free Parking'].map(tag => (
                <span key={tag} style={{
                  background: 'rgba(74,222,128,0.15)',
                  border: '1px solid rgba(74,222,128,0.25)',
                  color: '#4ade80',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '2rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 6-court diagram */}
          <div style={{ flex: '1 1 280px', display: 'flex', justifyContent: 'center' }}>
            <CourtDiagram />
          </div>
        </div>

        {/* Features grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3.5rem',
        }}>
          {[
            {
              icon: <Users size={22} color="#166534" />,
              title: 'Community Focused',
              desc: 'A welcoming space for all ages and skill levels. Come meet fellow pickleball enthusiasts in Donnacona.',
            },
            {
              icon: <MapPin size={22} color="#166534" />,
              title: 'Easy Access',
              desc: 'Located in Donnacona, Québec with ample free on-site parking. Accessible for players of all abilities.',
            },
            {
              icon: <Clock size={22} color="#166534" />,
              title: 'Extended Hours',
              desc: 'Open 7 days a week from 7 AM. Flexible time slots let you play when it suits your schedule.',
            },
            {
              icon: <Shield size={22} color="#166534" />,
              title: 'Safe & Maintained',
              desc: 'Courts are regularly maintained for optimal playing conditions. Safety is our top priority.',
            },
            {
              icon: <CalendarCheck size={22} color="#166534" />,
              title: 'Online Booking',
              desc: 'Réservez votre terrain 24h/7j depuis n\'importe quel appareil. Rapide et facile.',
            },
            {
              icon: <Wifi size={22} color="#166534" />,
              title: 'Instant Confirmation',
              desc: 'Receive immediate email confirmation with all your booking details as soon as you pay.',
            },
          ].map(f => (
            <div key={f.title} style={{
              background: '#fff',
              borderRadius: '1rem',
              padding: '1.75rem',
              border: '1px solid #e2e8f0',
              transition: 'box-shadow 0.2s, transform 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
            >
              <div style={{
                width: 44, height: 44,
                background: 'rgba(22,101,52,0.1)',
                borderRadius: '0.75rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.0625rem' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Hours */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '1.25rem',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          marginBottom: '3.5rem',
          border: '1px solid #e2e8f0',
        }}>
          <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.375rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Clock size={22} color="#166534" />
            Hours of Operation
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.875rem',
          }}>
            {[
              { day: 'Monday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Tuesday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Wednesday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Thursday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Friday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Saturday', hours: '7:00 AM – 10:00 PM' },
              { day: 'Sunday', hours: '8:00 AM – 9:00 PM' },
            ].map(h => {
              const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
              const isToday = h.day === today
              return (
                <div key={h.day} style={{
                  background: isToday ? 'linear-gradient(135deg, #14532d, #166534)' : '#fff',
                  borderRadius: '0.75rem',
                  padding: '1rem 1.25rem',
                  border: isToday ? 'none' : '1px solid #e2e8f0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontWeight: isToday ? 700 : 600, color: isToday ? '#fff' : '#334155', fontSize: '0.9rem' }}>
                    {h.day} {isToday && <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.125rem 0.5rem', borderRadius: '2rem', marginLeft: '0.375rem' }}>Today</span>}
                  </span>
                  <span style={{ fontWeight: 700, color: isToday ? '#4ade80' : '#166534', fontSize: '0.875rem' }}>{h.hours}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'linear-gradient(135deg, #166534, #14532d)',
          borderRadius: '1.5rem',
          padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: 'clamp(1.375rem, 3vw, 1.875rem)', fontWeight: 800, marginBottom: '0.75rem' }}>
            Ready to Book Your Court?
          </h2>
          <p style={{ color: '#bbf7d0', marginBottom: '1.75rem', fontSize: '1.0625rem' }}>
            Reserve online in minutes — it's fast, easy, and secure.
          </p>
          <button
            className="btn-primary"
            style={{ background: '#4ade80', color: '#14532d', fontSize: '1.0625rem', padding: '1rem 2.5rem' }}
            onClick={() => navigate('/book')}
          >
            <CalendarCheck size={20} />
            Book a Court
          </button>
        </div>
      </div>
    </div>
  )
}

function CourtDiagram() {
  return (
    <svg viewBox="0 0 280 200" style={{ width: '100%', maxWidth: 280 }}>
      {[
        [0, 0], [95, 0], [190, 0],
        [0, 105], [95, 105], [190, 105],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x}, ${y})`}>
          <rect x="0" y="0" width="85" height="95" fill="#1a7a3e" stroke="#4ade80" strokeWidth="1.5" rx="3" />
          <line x1="0" y1="32" x2="85" y2="32" stroke="#4ade80" strokeWidth="1" />
          <line x1="0" y1="63" x2="85" y2="63" stroke="#4ade80" strokeWidth="1" />
          <line x1="42.5" y1="0" x2="42.5" y2="32" stroke="#4ade80" strokeWidth="0.75" />
          <line x1="42.5" y1="63" x2="42.5" y2="95" stroke="#4ade80" strokeWidth="0.75" />
          <line x1="0" y1="47.5" x2="85" y2="47.5" stroke="#e2e8f0" strokeWidth="2" />
          <text x="42.5" y="88" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="Inter,sans-serif" fontWeight="600">
            Court {i + 1}
          </text>
        </g>
      ))}
    </svg>
  )
}
