import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1200)
  }

  return (
    <div style={{ padding: 'clamp(2.5rem, 6vw, 4rem) 0' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="section-tag">Contact</span>
          <h1 className="section-title">Contactez-nous</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Une question sur les réservations, les tarifs ou nos installations ? Nous serions ravis de vous répondre.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          alignItems: 'start',
        }}>
          {/* Left: info + map */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Contact cards */}
            {[
              {
                icon: <MapPin size={20} color="#166534" />,
                title: 'Adresse',
                lines: ['Donnacona, Québec', 'Canada'],
              },
              {
                icon: <Phone size={20} color="#166534" />,
                title: 'Téléphone',
                lines: ['(418) 555-1234'],
                href: 'tel:+14185551234',
              },
              {
                icon: <Mail size={20} color="#166534" />,
                title: 'Courriel',
                lines: ['pickleballdonnacona@gmail.com'],
                href: 'mailto:pickleballdonnacona@gmail.com',
              },
              {
                icon: <Clock size={20} color="#166534" />,
                title: 'Heures',
                lines: ['Lun–Sam : 6h00 – 22h00', 'Dimanche : 6h00 – 22h00'],
              },
            ].map(item => (
              <div key={item.title} style={{
                background: '#fff',
                borderRadius: '1rem',
                padding: '1.25rem 1.5rem',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: 'box-shadow 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: '0.625rem',
                  background: 'rgba(22,101,52,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>{item.title}</div>
                  {item.lines.map((line, i) => (
                    item.href && i === 0
                      ? <a key={line} href={item.href} style={{ display: 'block', color: '#166534', fontWeight: 600, fontSize: '0.9rem', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#14532d'}
                          onMouseLeave={e => e.currentTarget.style.color = '#166534'}
                        >{line}</a>
                      : <div key={line} style={{ color: '#64748b', fontSize: '0.9rem' }}>{line}</div>
                  ))}
                </div>
              </div>
            ))}

            {/* Map embed */}
            <div style={{
              borderRadius: '1.25rem',
              overflow: 'hidden',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #14532d, #166534)',
                padding: '0.875rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.9375rem',
              }}>
                <MapPin size={17} />
                Donnacona, Québec
              </div>
              <iframe
                title="Donnacona Location Map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=-71.8,-46.75,-71.6,-46.65&layer=mapnik&marker=-46.7,-71.72"
                style={{ width: '100%', height: 240, border: 'none', display: 'block' }}
                loading="lazy"
              />
              <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', fontSize: '0.825rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Donnacona, QC, Canada</span>
                <a
                  href="https://www.openstreetmap.org/?mlat=46.7&mlon=-71.72#map=14/46.7/-71.72"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#166534', fontWeight: 600, fontSize: '0.825rem' }}
                >
                  Ouvrir dans Maps ↗
                </a>
              </div>
            </div>
          </div>

          {/* Right: contact form */}
          <div style={{
            background: '#fff',
            borderRadius: '1.25rem',
            border: '1px solid #e2e8f0',
            padding: 'clamp(1.5rem, 4vw, 2.5rem)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(135deg, #14532d, #22c55e)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}>
                  <CheckCircle size={36} color="#fff" />
                </div>
                <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.375rem', marginBottom: '0.75rem' }}>
                  Message envoyé !
                </h3>
                <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '1.75rem' }}>
                  Merci de nous avoir contactés, <strong>{form.name}</strong>. Nous vous répondrons à <strong>{form.email}</strong> dans les 1 à 2 jours ouvrables.
                </p>
                <button
                  className="btn-secondary"
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                >
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.375rem' }}>
                  Envoyez-nous un message
                </h2>
                <p style={{ color: '#64748b', marginBottom: '1.75rem', fontSize: '0.9375rem' }}>
                  Nous répondons habituellement dans les 1 à 2 jours ouvrables.
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <Field
                      label="Nom complet *"
                      id="name"
                      type="text"
                      placeholder="Jean Tremblay"
                      value={form.name}
                      onChange={v => setForm(p => ({ ...p, name: v }))}
                    />
                    <Field
                      label="Email *"
                      id="email"
                      type="email"
                      placeholder="vous@exemple.com"
                      value={form.email}
                      onChange={v => setForm(p => ({ ...p, email: v }))}
                    />
                  </div>
                  <Field
                    label="Sujet"
                    id="subject"
                    type="text"
                    placeholder="Question sur une réservation, les installations…"
                    value={form.subject}
                    onChange={v => setForm(p => ({ ...p, subject: v }))}
                  />
                  <div>
                    <label htmlFor="message" style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
                      Message *

                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Comment pouvons-nous vous aider ?"
                      value={form.message}
                      onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '0.625rem',
                        border: '2px solid #e2e8f0',
                        fontSize: '1rem',
                        fontFamily: 'inherit',
                        color: '#0f172a',
                        outline: 'none',
                        resize: 'vertical',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={e => e.target.style.borderColor = '#166534'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading || !form.name || !form.email || !form.message}
                    style={{
                      opacity: (!form.name || !form.email || !form.message) ? 0.5 : 1,
                      cursor: (!form.name || !form.email || !form.message) ? 'not-allowed' : 'pointer',
                      marginTop: '0.25rem',
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                        Envoi en cours…
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>

                <style>{`
                  @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, type, placeholder, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '0.625rem',
          border: '2px solid #e2e8f0',
          fontSize: '1rem',
          fontFamily: 'inherit',
          color: '#0f172a',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => e.target.style.borderColor = '#166534'}
        onBlur={e => e.target.style.borderColor = '#e2e8f0'}
      />
    </div>
  )
}
