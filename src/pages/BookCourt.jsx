import { useState, useMemo, useRef } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth,
         eachDayOfInterval, isSameDay, isToday, isPast, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarCheck, Clock, User, CreditCard,
         CheckCircle, LogIn, AlertTriangle, Ban, Star, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import { COURTS, SPORTS, START_TIMES, DURATIONS, WEEKLY_HOUR_LIMIT, PRICING, slotLabel } from '../data/courts'
import PaymentStep from '../components/PaymentStep'
import { sendBookingConfirmation } from '../utils/sendEmail'

const STEPS = ['Date', 'Terrain & Heure', 'Détails', 'Paiement']

export default function BookCourt() {
  const { user, paySeasonPass } = useAuth()
  const navigate = useNavigate()
  const { isSlotAvailable, isConsecutiveBlocked, getUserWeekHours, addBooking } = useBookings()
  const bookingInProgress = useRef(false)

  const [selectedSport, setSelectedSport] = useState(null)
  const [step, setStep] = useState(0)
  function goToStep(n) {
    setStep(n)
    window.scrollTo(0, 0)
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [selectedStart, setSelectedStart] = useState(null)
  // Pre-select residency: from pass type if already paid, else from profile address detection
  const profileResidency = user?.seasonPassPaid
    ? user.seasonPassType
    : user?.isResident === true
      ? 'resident'
      : user?.isResident === false
        ? 'nonResident'
        : null
  const [isResident, setIsResident] = useState(profileResidency)
  const residentLocked = !user?.seasonPassPaid && user?.isResident !== null && user?.isResident !== undefined
  const [submitted, setSubmitted] = useState(false)

  const daysInMonth = useMemo(() =>
    eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) })
  , [currentMonth])

  const firstDayOfWeek = useMemo(() => {
    const d = startOfMonth(currentMonth).getDay()
    return d === 0 ? 6 : d - 1
  }, [currentMonth])

  const isAdmin = user?.isAdmin === true

  const activeCourts = selectedSport ? COURTS.filter(c => c.sport === selectedSport) : COURTS

  const weekHours = user && selectedDate && !isAdmin ? getUserWeekHours(user.id, selectedDate) : 0
  const weekFull = !isAdmin && weekHours >= WEEKLY_HOUR_LIMIT

  const hasSeasonPass = isAdmin || user?.freePass === true || user?.seasonPassPaid === true
  const passType = isAdmin ? 'resident' : user?.seasonPassType
  const effectiveType = passType || isResident
  const price = effectiveType === 'resident' ? PRICING.resident : effectiveType === 'nonResident' ? PRICING.nonResident : null

  function dateStr(date) { return format(date, 'yyyy-MM-dd') }

  const validStarts = useMemo(() => {
    if (!selectedDuration) return START_TIMES
    return START_TIMES.filter((_, i) => i + selectedDuration <= START_TIMES.length)
  }, [selectedDuration])

  function getStartStatus(startSlot) {
    if (!selectedDate || !selectedCourt || !selectedDuration) return 'free'
    const ds = dateStr(selectedDate)
    if (!isSlotAvailable(selectedCourt, ds, startSlot, selectedDuration)) return 'booked'
    if (!isAdmin && user && isConsecutiveBlocked(user.id, ds, startSlot, selectedDuration)) return 'consecutive'
    return 'free'
  }

  function getCourtFreeCount(courtId) {
    if (!selectedDate || !selectedDuration) return validStarts.length
    const ds = dateStr(selectedDate)
    return validStarts.filter(s => isSlotAvailable(courtId, ds, s, selectedDuration)).length
  }

  async function handlePaymentSuccess(paymentInfo) {
    if (!user || !selectedDate || !selectedCourt || !selectedStart || !selectedDuration) return
    if (bookingInProgress.current) return
    bookingInProgress.current = true
    if (!hasSeasonPass) paySeasonPass(isResident)
    addBooking({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      courtId: selectedCourt,
      date: dateStr(selectedDate),
      startSlot: selectedStart,
      duration: selectedDuration,
      isResident: effectiveType === 'resident',
      price: hasSeasonPass ? 0 : price,
      paymentInfo,
    })
    // Send confirmation email
    await sendBookingConfirmation({
      to_name: user.name,
      to_email: user.email,
      court: COURTS.find(c => c.id === selectedCourt)?.name ?? `Terrain ${selectedCourt}`,
      date: format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }),
      time_slot: slotLabel(selectedStart, selectedDuration),
      duration: `${selectedDuration} heure${selectedDuration > 1 ? 's' : ''}`,
      pass_type: effectiveType === 'resident' ? 'Résident ($40)' : 'Non-résident ($85)',
      amount_paid: hasSeasonPass ? '$0 (passe déjà actif)' : `$${price}`,
      week_hours: `${weekHours + selectedDuration}h / ${WEEKLY_HOUR_LIMIT}h`,
    })
    setSubmitted(true)
    bookingInProgress.current = false
  }

  // ── Not logged in ──
  if (!user) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ width: 72, height: 72, background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <LogIn size={32} color="#94a3b8" />
          </div>
          <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.5rem', marginBottom: '0.75rem' }}>Connexion requise</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.7 }}>
            Vous devez être connecté pour réserver un terrain.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/login')}><LogIn size={18} /> Se connecter</button>
            <button className="btn-secondary" onClick={() => navigate('/register')}>Créer un compte</button>
          </div>
        </div>
      </div>
    )
  }

  // ── Confirmed ──
  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: '#fff', borderRadius: '1.5rem', padding: 'clamp(2rem, 5vw, 3rem)',
          textAlign: 'center', maxWidth: 540, width: '100%',
          border: '2px solid #dcfce7', boxShadow: '0 20px 60px rgba(22,101,52,0.1)',
        }}>
          <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #14532d, #22c55e)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Réservation confirmée !</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.7 }}>
            Votre terrain a été réservé avec succès !{' '}
            {import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID'
              ? <>Une confirmation a été envoyée à <strong>{user.email}</strong>.</>
              : <>Connectez-vous à votre compte pour consulter vos réservations.</>
            }
          </p>
          {!hasSeasonPass && (
            <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.25rem', textAlign: 'left', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <Star size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Passe saisonnier activé !</div>
                <div style={{ fontSize: '0.875rem', color: '#bbf7d0', lineHeight: 1.6 }}>
                  Votre passe {effectiveType === 'resident' ? '$40 (résident)' : '$85 (non-résident)'} est actif pour tout l'été. Vos prochaines réservations sont gratuites.
                </div>
              </div>
            </div>
          )}
          <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            {[
              { label: 'Terrain', value: COURTS.find(c => c.id === selectedCourt)?.name ?? `Terrain ${selectedCourt}` },
              { label: 'Date', value: format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr }) },
              { label: 'Heure', value: slotLabel(selectedStart, selectedDuration) },
              { label: 'Durée', value: `${selectedDuration}h` },
              { label: 'Passe saisonnier', value: effectiveType === 'resident' ? 'Résident · $40/été' : 'Non-résident · $85/été' },
              { label: "Payé aujourd'hui", value: hasSeasonPass ? '$0 (déjà payé)' : `$${price}` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{r.label}</span>
                <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{r.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
              <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Heures utilisées cette semaine</span>
              <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.875rem' }}>
                {Math.min(weekHours + selectedDuration, WEEKLY_HOUR_LIMIT)}h / {WEEKLY_HOUR_LIMIT}h
              </span>
            </div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={() => {
            goToStep(0); setSelectedDate(null); setSelectedCourt(null);
            setSelectedDuration(null); setSelectedStart(null); setSubmitted(false);
            setIsResident(user?.seasonPassPaid ? user.seasonPassType : null)
          }}>
            Faire une autre réservation
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <span className="section-tag">Réservation en ligne</span>
          <h1 className="section-title">Réserver un terrain</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Bonjour, <strong>{user.name}</strong>{isAdmin ? ' — accès administrateur complet' : ` — sessions de 1h ou 2h, de 6h00 à 22h00. Max ${WEEKLY_HOUR_LIMIT}h/semaine.`}
          </p>
        </div>

        {/* Season pass banner */}
        {hasSeasonPass ? (
          <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Star size={18} color="#4ade80" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 700 }}>Passe saisonnier actif</span>
              <span style={{ color: '#bbf7d0', marginLeft: '0.5rem', fontSize: '0.9rem' }}>
                {passType === 'resident' ? 'Résident · $40 payé' : 'Non-résident · $85 payé'} — Réservations gratuites jusqu'à la fin de l'été
              </span>
            </div>
            <span style={{ background: 'rgba(74,222,128,0.2)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 700 }}>ÉTÉ 2026</span>
          </div>
        ) : (
          <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '0.875rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <Star size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.6 }}>
              <strong>Passe saisonnier requis.</strong> Payé une seule fois ($40 résident ou $85 non-résident), valide pour tout l'été.
            </p>
          </div>
        )}

        {/* Sport selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem', fontSize: '1rem' }}>
            Choisir un sport
          </div>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {SPORTS.map(sport => {
              const sel = selectedSport === sport.id
              return (
                <button key={sport.id} onClick={() => {
                  setSelectedSport(sport.id)
                  setSelectedCourt(null)
                  setSelectedStart(null)
                  setSelectedDuration(null)
                  setSelectedDate(null)
                  goToStep(0)
                }}
                  style={{
                    flex: '1 1 160px',
                    padding: '1.125rem 1.5rem',
                    borderRadius: '1rem',
                    border: sel ? `2.5px solid ${sport.color}` : '2px solid #e2e8f0',
                    background: sel ? `${sport.color}10` : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    transition: 'all 0.15s',
                    boxShadow: sel ? `0 4px 16px ${sport.color}20` : 'none',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.background = '#f8fafc' }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.background = '#fff' }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>{sport.emoji}</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: sel ? sport.color : '#0f172a' }}>{sport.label}</div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                      {sport.id === 'pickleball' ? '4 terrains disponibles' : '2 terrains disponibles'}
                    </div>
                  </div>
                  {sel && (
                    <div style={{ marginLeft: 'auto', width: 22, height: 22, borderRadius: '50%', background: sport.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={14} color="#fff" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Weekly quota */}
        {selectedDate && <WeekBanner weekHours={weekHours} />}

        {!selectedSport && (
          <div style={{ background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '1.25rem', padding: '2.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '1rem', fontWeight: 600 }}>
            Veuillez choisir un sport ci-dessus pour continuer
          </div>
        )}

        {/* Step indicator */}
        {selectedSport && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', background: i <= step ? '#166534' : '#e2e8f0', color: i <= step ? '#fff' : '#94a3b8', transition: 'all 0.3s' }}>
                  {i < step ? <CheckCircle size={15} /> : i + 1}
                </div>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: i <= step ? '#166534' : '#94a3b8', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ width: 'clamp(1.5rem, 5vw, 4rem)', height: 2, background: i < step ? '#166534' : '#e2e8f0', margin: '0 0.25rem', marginBottom: '1.25rem', transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>}

        {selectedSport && <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>

          {/* ── Step 0: Date ── */}
          {step === 0 && (
            <>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CalendarCheck size={22} color="#166534" /> Choisir une date
              </h3>
              {weekFull && selectedDate && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#dc2626', display: 'flex', gap: '0.625rem', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
                  <Ban size={17} style={{ flexShrink: 0, marginTop: 2 }} />
                  Limite de {WEEKLY_HOUR_LIMIT}h atteinte pour cette semaine. Choisissez une autre semaine.
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <NavBtn onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></NavBtn>
                <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>{format(currentMonth, 'MMMM yyyy', { locale: fr })}</span>
                <NavBtn onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></NavBtn>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.375rem' }}>
                {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0.5rem 0' }}>{d}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`b${i}`} />)}
                {daysInMonth.map(day => {
                  const past = isPast(startOfDay(day)) && !isToday(day)
                  const sel = selectedDate && isSameDay(day, selectedDate)
                  const today = isToday(day)
                  return (
                    <button key={day.toISOString()} disabled={past}
                      onClick={() => { setSelectedDate(day); setSelectedCourt(null); setSelectedDuration(null); setSelectedStart(null) }}
                      style={{ aspectRatio: '1', borderRadius: '0.625rem', border: today && !sel ? '2px solid #22c55e' : '2px solid transparent', background: sel ? '#166534' : 'transparent', color: past ? '#cbd5e1' : sel ? '#fff' : today ? '#166534' : '#0f172a', fontWeight: sel || today ? 700 : 500, fontSize: '0.9rem', cursor: past ? 'not-allowed' : 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { if (!past && !sel) e.currentTarget.style.background = '#f1f5f9' }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = 'transparent' }}
                    >{format(day, 'd')}</button>
                  )
                })}
              </div>
              {selectedDate && (
                <div style={{ marginTop: '1.5rem', padding: '0.875rem 1.25rem', background: '#f0fdf4', borderRadius: '0.75rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={17} />{format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
              )}
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn-primary" disabled={!selectedDate || weekFull} onClick={() => goToStep(1)}
                  style={{ opacity: (!selectedDate || weekFull) ? 0.5 : 1, cursor: (!selectedDate || weekFull) ? 'not-allowed' : 'pointer' }}>
                  Suivant : Terrain & Heure <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 1: Court, Duration & Time ── */}
          {step === 1 && (
            <>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={22} color="#166534" /> Terrain, durée et heure
              </h3>
              <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })} · Terrains ouverts de 6h00 à 22h00
              </p>

              {/* Duration selector */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>Durée de la session</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => { setSelectedDuration(d); setSelectedStart(null) }}
                      style={{ flex: 1, padding: '1rem', borderRadius: '0.875rem', border: selectedDuration === d ? '2px solid #166534' : '2px solid #e2e8f0', background: selectedDuration === d ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: selectedDuration === d ? '#166534' : '#0f172a' }}>{d}h</div>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
                        {d === 1 ? '1 heure' : '2 heures (maximum)'}
                      </div>
                      {weekHours + d > WEEKLY_HOUR_LIMIT && (
                        <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.375rem', fontWeight: 600 }}>
                          Dépasse votre limite ({weekHours + d}h/{WEEKLY_HOUR_LIMIT}h)
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Court selector */}
              {selectedDuration && (
                <div style={{ marginBottom: '1.75rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>Choisir un terrain</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.875rem' }}>
                    {activeCourts.map(c => {
                      const free = getCourtFreeCount(c.id)
                      const sel = selectedCourt === c.id
                      return (
                        <button key={c.id} onClick={() => { setSelectedCourt(c.id); setSelectedStart(null) }}
                          style={{ padding: '1.125rem', borderRadius: '0.875rem', border: sel ? `2px solid ${c.color}` : '2px solid #e2e8f0', background: sel ? `${c.color}12` : '#fff', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: sel ? c.color : '#f1f5f9', color: sel ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', margin: '0 auto 0.625rem' }}>{c.id}</div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: free > 0 ? '#166534' : '#ef4444', fontWeight: 600 }}>
                            {free} créneau{free !== 1 ? 'x' : ''} libre{free !== 1 ? 's' : ''}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Time slots */}
              {selectedCourt && selectedDuration && (
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>Choisir un créneau de {selectedDuration}h</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.625rem' }}>
                    {validStarts.map(start => {
                      const status = getStartStatus(start)
                      const sel = selectedStart === start
                      const disabled = status !== 'free' || weekHours + selectedDuration > WEEKLY_HOUR_LIMIT
                      const overLimit = weekHours + selectedDuration > WEEKLY_HOUR_LIMIT
                      return (
                        <button key={start} disabled={disabled} onClick={() => setSelectedStart(start)}
                          title={status === 'consecutive' ? 'Réservation consécutive interdite.' : overLimit ? 'Dépasse votre limite hebdomadaire.' : ''}
                          style={{ padding: '0.75rem 0.5rem', borderRadius: '0.625rem', border: sel ? '2px solid #166534' : status === 'booked' ? '2px solid #fee2e2' : status === 'consecutive' ? '2px solid #fef3c7' : '2px solid #e2e8f0', background: sel ? '#166534' : status === 'booked' ? '#fef2f2' : status === 'consecutive' ? '#fffbeb' : '#fff', color: sel ? '#fff' : status === 'booked' ? '#fca5a5' : status === 'consecutive' ? '#d97706' : overLimit ? '#cbd5e1' : '#334155', fontSize: '0.8125rem', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', flexDirection: 'column' }}
                          onMouseEnter={e => { if (!disabled && !sel) e.currentTarget.style.background = '#f0fdf4' }}
                          onMouseLeave={e => { if (!sel) e.currentTarget.style.background = status === 'booked' ? '#fef2f2' : status === 'consecutive' ? '#fffbeb' : '#fff' }}
                        >
                          {status === 'consecutive' && <AlertTriangle size={11} />}
                          <span>{slotLabel(start, selectedDuration)}</span>
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginTop: '0.875rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Dot color="#166534" />Disponible</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Dot color="#fca5a5" />Réservé</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Dot color="#fde68a" />Consécutif interdit</span>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => goToStep(0)}><ChevronLeft size={18} />Retour</button>
                <button className="btn-primary" disabled={!selectedCourt || !selectedStart} onClick={() => goToStep(2)}
                  style={{ opacity: (selectedCourt && selectedStart) ? 1 : 0.5, cursor: (selectedCourt && selectedStart) ? 'pointer' : 'not-allowed' }}>
                  Suivant : Détails <ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Details / Resident type ── */}
          {step === 2 && (
            <>
              <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={22} color="#166534" /> Détails de la réservation
              </h3>

              {/* Booking summary */}
              <div style={{ background: '#f0fdf4', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                {[
                  { label: 'Date', value: format(selectedDate, 'd MMM yyyy', { locale: fr }) },
                  { label: 'Terrain', value: COURTS.find(c => c.id === selectedCourt)?.name ?? `Terrain ${selectedCourt}` },
                  { label: 'Heure', value: slotLabel(selectedStart, selectedDuration) },
                  { label: 'Durée', value: `${selectedDuration} heure${selectedDuration > 1 ? 's' : ''}` },
                ].map(r => (
                  <div key={r.label}>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
                    <div style={{ fontWeight: 700, color: '#14532d' }}>{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Weekly quota bar */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>Heures utilisées cette semaine</span>
                  <span style={{ fontWeight: 700, color: weekHours + selectedDuration > WEEKLY_HOUR_LIMIT ? '#dc2626' : '#166534' }}>
                    {weekHours}h + {selectedDuration}h = {weekHours + selectedDuration}h / {WEEKLY_HOUR_LIMIT}h
                  </span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(((weekHours + selectedDuration) / WEEKLY_HOUR_LIMIT) * 100, 100)}%`, background: weekHours + selectedDuration >= WEEKLY_HOUR_LIMIT ? '#dc2626' : '#166534', borderRadius: 4, transition: 'width 0.5s' }} />
                </div>
              </div>

              {/* Season pass / resident type */}
              {hasSeasonPass ? (
                <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <Shield size={28} color="#4ade80" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Passe saisonnier actif ✓</div>
                    <div style={{ color: '#bbf7d0', fontSize: '0.875rem' }}>
                      {passType === 'resident' ? 'Résident · $40 payé' : 'Non-résident · $85 payé'} — Valide tout l'été
                    </div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#4ade80' }}>$0</div>
                </div>
              ) : (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.875rem' }}>
                    Passe saisonnier
                    {residentLocked && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#166534', fontWeight: 600 }}>— déterminé par votre adresse</span>}
                    {!residentLocked && <span style={{ color: '#dc2626' }}> *</span>}
                  </label>

                  {residentLocked ? (
                    // Only one option visible based on address
                    <div style={{ padding: '1.25rem 1.5rem', borderRadius: '0.875rem', border: '2px solid #166534', background: '#f0fdf4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.25rem' }}>
                          {isResident === 'resident' ? '🏠 Résident de Donnacona' : '🌍 Non-résident'}
                        </div>
                        <div style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <CheckCircle size={13} />
                          {isResident === 'resident' ? 'Adresse à Donnacona — tarif réduit' : 'Adresse hors Donnacona'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 900, fontSize: '2rem', color: '#166534' }}>
                        ${isResident === 'resident' ? '40' : '85'}
                      </div>
                    </div>
                  ) : (
                    // No address on file — free choice
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {[
                        { value: 'resident', label: '🏠 Résident', price: '$40', desc: 'Résidents de Donnacona' },
                        { value: 'nonResident', label: '🌍 Non-résident', price: '$85', desc: 'Ouvert à tous' },
                      ].map(opt => (
                        <button key={opt.value} onClick={() => setIsResident(opt.value)}
                          style={{ flex: '1 1 170px', padding: '1rem 1.125rem', borderRadius: '0.875rem', border: isResident === opt.value ? '2px solid #166534' : '2px solid #e2e8f0', background: isResident === opt.value ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 700, color: '#0f172a' }}>{opt.label}</span>
                            <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#166534' }}>{opt.price}</span>
                          </div>
                          <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {isResident && (
                    <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Passe saisonnier — Paiement unique</div>
                        <div style={{ fontWeight: 800, fontSize: '1.75rem' }}>${price}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#bbf7d0' }}>
                        Valide tout l'été<br />Max {WEEKLY_HOUR_LIMIT}h/semaine
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!hasSeasonPass && !isResident && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.75rem 1rem', color: '#92400e', fontSize: '0.875rem', marginTop: '1rem' }}>
                  ⬆️ Veuillez choisir votre type de passe (Résident ou Non-résident) ci-dessus pour continuer.
                </div>
              )}
              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button className="btn-secondary" onClick={() => goToStep(1)}><ChevronLeft size={18} />Retour</button>
                {hasSeasonPass ? (
                  <button className="btn-primary" onClick={() => { handlePaymentSuccess({ status: 'PASS_ACTIVE' }) }}>
                    <CheckCircle size={18} /> Confirmer la réservation
                  </button>
                ) : (
                  <button className="btn-primary" disabled={!isResident} onClick={() => goToStep(3)}
                    style={{ opacity: isResident ? 1 : 0.5, cursor: isResident ? 'pointer' : 'not-allowed' }}>
                    <CreditCard size={18} /> Suivant : Paiement <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            hasSeasonPass ? (
              // Pass already active — confirm directly
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <CheckCircle size={40} color="#166534" style={{ marginBottom: '1rem' }} />
                <p style={{ marginBottom: '1.5rem', color: '#64748b' }}>Votre passe est déjà actif.</p>
                <button className="btn-primary" onClick={() => handlePaymentSuccess({ status: 'PASS_ACTIVE' })}>
                  Confirmer la réservation
                </button>
              </div>
            ) : !price ? (
              // No price — go back to step 2
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>Veuillez sélectionner votre type de passe.</p>
                <button className="btn-secondary" onClick={() => goToStep(2)}>← Retour</button>
              </div>
            ) : (
              <PaymentStep
                amount={price}
                description={`Passe saisonnier pickleball ${effectiveType === 'resident' ? 'résident' : 'non-résident'} – Été 2026`}
                onSuccess={handlePaymentSuccess}
                onBack={() => goToStep(2)}
              />
            )
          )}

        </div>}

      </div>
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
      onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
      {children}
    </button>
  )
}

function Dot({ color }) {
  return <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: 'inline-block', flexShrink: 0 }} />
}

function WeekBanner({ weekHours }) {
  const pct = Math.min((weekHours / WEEKLY_HOUR_LIMIT) * 100, 100)
  const remaining = WEEKLY_HOUR_LIMIT - weekHours
  const color  = weekHours >= WEEKLY_HOUR_LIMIT ? '#dc2626' : weekHours >= 4 ? '#d97706' : '#166534'
  const bg     = weekHours >= WEEKLY_HOUR_LIMIT ? '#fef2f2' : weekHours >= 4 ? '#fffbeb' : '#f0fdf4'
  const border = weekHours >= WEEKLY_HOUR_LIMIT ? '#fecaca' : weekHours >= 4 ? '#fde68a' : '#bbf7d0'
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '0.875rem', padding: '0.875rem 1.25rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>
          {weekHours >= WEEKLY_HOUR_LIMIT ? '⛔ Limite hebdomadaire atteinte' : `⏱ Quota semaine — ${remaining}h restantes`}
        </span>
        <span style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>{weekHours}h / {WEEKLY_HOUR_LIMIT}h</span>
      </div>
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.4s' }} />
      </div>
    </div>
  )
}
