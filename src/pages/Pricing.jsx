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
          <span className="section-tag">Pricing</span>
          <h1 className="section-title">Simple, Transparent Pricing</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            One flat rate per court per hour. No hidden fees, no membership required.
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
                🏠 DONNACONA RESIDENT
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 900, lineHeight: 1 }}>$30</span>
                <span style={{ color: '#86efac', marginLeft: '0.5rem', fontSize: '1rem' }}>/ hour / court</span>
              </div>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {[
                  '1-hour court reservation',
                  'All 6 courts available',
                  'Online booking included',
                  'Instant confirmation',
                  'Proof of residency required',
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
                Book as Resident
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
              🌍 NON-RESIDENT
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '4rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>$50</span>
              <span style={{ color: '#64748b', marginLeft: '0.5rem', fontSize: '1rem' }}>/ hour / court</span>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
              {[
                '1-hour court reservation',
                'All 6 courts available',
                'Online booking included',
                'Instant confirmation',
                'Open to all visitors',
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
              Book as Non-Resident
            </button>
          </div>
        </div>

        {/* Residency note */}
        <div style={{
          background: '#fefce8',
          border: '1px solid #fde68a',
          borderRadius: '1rem',
          padding: '1.5rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start',
          maxWidth: 780,
          margin: '0 auto 3.5rem',
        }}>
          <AlertCircle size={22} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.375rem' }}>Proof of Residency</div>
            <p style={{ color: '#78350f', fontSize: '0.9375rem', lineHeight: 1.7 }}>
              To qualify for the resident rate, you must present valid proof of Donnacona residency at the facility. Acceptable documents include a government-issued ID with a Donnacona address, a recent utility bill, or an official municipal document. Failure to provide proof will result in the non-resident rate being charged.
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.5rem' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { q: 'How long is each booking?', a: 'Each reservation is for 1 hour. You can book multiple consecutive hours if available.' },
              { q: 'Can I cancel or reschedule my booking?', a: 'Yes, cancellations and reschedules are accepted up to 24 hours before your session. Contact us by phone or email.' },
              { q: 'Is equipment provided?', a: 'Paddles and balls are available to rent at the facility. We recommend bringing your own paddle for the best experience.' },
              { q: 'Do I need to create an account?', a: 'No account is needed. Simply fill in your name and email at checkout and you\'ll receive an instant confirmation.' },
              { q: 'What is the maximum number of players per court?', a: 'Up to 4 players per court for doubles play, or 2 for singles. The booking fee covers the full court.' },
              { q: 'Is the facility accessible?', a: 'Yes, the facility is wheelchair accessible with accessible parking spaces available.' },
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

