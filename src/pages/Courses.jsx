import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GraduationCap, Calendar, Clock, Users, CheckCircle, AlertCircle, ChevronRight, ChevronLeft, MapPin, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PaymentStep from '../components/PaymentStep'

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [step, setStep] = useState('list') // list | confirm | payment | done
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setCourses(data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function isRegistered(course) {
    return course.registrations?.find(r => r.email === user?.email)
  }

  function isFull(course) {
    return course.maxParticipants && course.registrations?.length >= course.maxParticipants
  }

  async function handlePaymentSuccess(paymentInfo) {
    if (!selectedCourse || registering) return
    setRegistering(true)
    setError('')
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          userName: user.name,
          userEmail: user.email,
          userId: user.id,
          paymentInfo,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'inscription')
      setCourses(prev => prev.map(c => c.id === data.course.id ? data.course : c))
      setStep('done')
    } catch (e) {
      setError(e.message)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // ── Done screen ──
  if (step === 'done' && selectedCourse) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: '1.5rem', padding: 'clamp(2rem,5vw,3rem)', textAlign: 'center', maxWidth: 520, width: '100%', border: '2px solid #dcfce7', boxShadow: '0 20px 60px rgba(22,101,52,0.1)' }}>
          <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #14532d, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Inscription confirmée !</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.7 }}>
            Vous êtes inscrit au cours du <strong>{format(parseISO(selectedCourse.date), 'EEEE d MMMM yyyy', { locale: fr })}</strong>.<br />
            Rendez-vous à <strong>{selectedCourse.time}</strong> aux terrains de pickleball de Donnacona.
          </p>
          <div style={{ background: '#f0fdf4', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left' }}>
            {[
              { label: 'Cours', value: selectedCourse.name },
              { label: 'Date', value: format(parseISO(selectedCourse.date), 'EEEE d MMMM yyyy', { locale: fr }) },
              { label: 'Horaire', value: selectedCourse.time },
              { label: 'Lieu', value: 'Terrains de pickleball Donnacona' },
              { label: 'Montant payé', value: `$${selectedCourse.price} CAD` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', marginBottom: '0.5rem', borderBottom: '1px solid #dcfce7' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: '#14532d', fontSize: '0.875rem' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => { setStep('list'); setSelectedCourse(null) }}
            style={{ background: 'linear-gradient(135deg,#14532d,#166534)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.875rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
            Voir tous les cours
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 860 }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="section-tag">Inscriptions</span>
          <h1 className="section-title">Cours de pickleball</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Apprenez le pickleball avec nos cours d'initiation encadrés par des instructeurs qualifiés. Équipement fourni. Tous niveaux bienvenus.
          </p>
        </div>

        {/* Payment / Confirm step */}
        {(step === 'confirm' || step === 'payment') && selectedCourse && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: 'clamp(1.5rem,4vw,2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>

            {/* Breadcrumb */}
            <button onClick={() => { setStep('list'); setError('') }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem', padding: 0 }}>
              <ChevronLeft size={16} /> Retour aux cours
            </button>

            {step === 'confirm' && (
              <>
                <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap size={22} color="#166534" /> Confirmer l'inscription
                </h2>
                <div style={{ background: '#f0fdf4', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <div style={{ fontWeight: 800, color: '#14532d', fontSize: '1.05rem', marginBottom: '0.75rem' }}>{selectedCourse.name}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.75rem' }}>
                    {[
                      { icon: <Calendar size={14} />, label: 'Date', value: format(parseISO(selectedCourse.date), 'EEEE d MMMM yyyy', { locale: fr }) },
                      { icon: <Clock size={14} />, label: 'Horaire', value: selectedCourse.time },
                      { icon: <MapPin size={14} />, label: 'Lieu', value: 'Terrains de pickleball Donnacona' },
                      { icon: <Users size={14} />, label: 'Places', value: `${selectedCourse.registrations.length} / ${selectedCourse.maxParticipants}` },
                    ].map(r => (
                      <div key={r.label}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>{r.icon}{r.label}</div>
                        <div style={{ fontWeight: 700, color: '#14532d', fontSize: '0.875rem' }}>{r.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'linear-gradient(135deg,#14532d,#166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase' }}>Frais d'inscription</div>
                    <div style={{ fontWeight: 900, fontSize: '2rem' }}>${selectedCourse.price} CAD</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#bbf7d0', textAlign: 'right' }}>Paiement unique<br />par session</div>
                </div>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#dc2626', fontSize: '0.9rem' }}>
                    <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => setStep('payment')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#14532d,#166534)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '1rem 2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}>
                    <CreditCard size={18} /> Procéder au paiement <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}

            {step === 'payment' && (
              <PaymentStep
                amount={selectedCourse.price}
                description={`Initiation au pickleball – ${format(parseISO(selectedCourse.date), 'd MMMM yyyy', { locale: fr })}`}
                label={`Cours – ${format(parseISO(selectedCourse.date), 'd MMM', { locale: fr })}`}
                onSuccess={handlePaymentSuccess}
                onBack={() => setStep('confirm')}
              />
            )}
          </div>
        )}

        {/* Course list */}
        {step === 'list' && (
          <>
            {/* Info banner */}
            <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1px solid #bbf7d0', borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, background: '#166534', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GraduationCap size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#14532d', fontSize: '1rem', marginBottom: '0.25rem' }}>Cours d'initiation au pickleball — Été 2026</div>
                <div style={{ fontSize: '0.875rem', color: '#166534', lineHeight: 1.6 }}>
                  Deux sessions disponibles · <strong>$45 / personne</strong> · 9h00 à 11h00 · Équipement fourni · Max 16 participants
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {courses.map(course => {
                const registered = isRegistered(course)
                const full = isFull(course)
                const spotsLeft = course.maxParticipants - (course.registrations?.length || 0)
                const dateObj = parseISO(course.date)

                return (
                  <div key={course.id} style={{ background: '#fff', borderRadius: '1.25rem', border: `2px solid ${registered ? '#bbf7d0' : '#e2e8f0'}`, padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

                    {/* Date badge */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: registered ? 'linear-gradient(135deg,#14532d,#166534)' : 'linear-gradient(135deg,#1B4E8B,#2563eb)', color: '#fff', borderRadius: '1rem', padding: '0.875rem 1.125rem', minWidth: 72, flexShrink: 0, textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>
                        {format(dateObj, 'MMM', { locale: fr })}
                      </span>
                      <span style={{ fontSize: '2.25rem', fontWeight: 900, lineHeight: 1 }}>{format(dateObj, 'd')}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, opacity: 0.8 }}>{format(dateObj, 'yyyy')}</span>
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.375rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.125rem', margin: 0 }}>{course.name}</h3>
                        {registered && (
                          <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle size={11} /> Inscrit
                          </span>
                        )}
                        {full && !registered && (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>Complet</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={13} color="#94a3b8" />{course.time}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} color="#94a3b8" />Terrains Donnacona</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Users size={13} color={spotsLeft <= 3 ? '#dc2626' : '#94a3b8'} />
                          <span style={{ color: spotsLeft <= 3 && !full ? '#dc2626' : '#475569', fontWeight: spotsLeft <= 3 ? 700 : 400 }}>
                            {full ? 'Complet' : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''} disponible${spotsLeft > 1 ? 's' : ''}`}
                          </span>
                        </span>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>{course.description}</p>
                    </div>

                    {/* Price + CTA */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 900, fontSize: '1.75rem', color: '#166534', lineHeight: 1 }}>${course.price}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CAD / pers.</div>
                      </div>
                      {registered ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#166534', fontWeight: 700, fontSize: '0.875rem' }}>
                          <CheckCircle size={16} /> Vous êtes inscrit
                        </div>
                      ) : full ? (
                        <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 600 }}>Aucune place disponible</span>
                      ) : (
                        <button
                          onClick={() => { setSelectedCourse(course); setStep('confirm'); setError(''); window.scrollTo(0,0) }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg,#14532d,#166534)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          S'inscrire <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {courses.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '1.25rem', border: '2px dashed #e2e8f0' }}>
                <GraduationCap size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontWeight: 600 }}>Aucun cours disponible pour le moment.</p>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
