import { useState, useMemo } from 'react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, startOfDay, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarCheck, Clock, User, CreditCard, CheckCircle, X, AlertCircle } from 'lucide-react'
import { COURTS, TIME_SLOTS, PRICING, buildBookedSet } from '../data/courts'

const STEPS = ['Date', 'Court & Time', 'Details', 'Confirm']

export default function BookCourt() {
  const [step, setStep] = useState(0)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1))
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedCourt, setSelectedCourt] = useState(null)
  const [selectedTime, setSelectedTime] = useState(null)
  const [isResident, setIsResident] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [submitted, setSubmitted] = useState(false)
  const [bookedSet] = useState(buildBookedSet)

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const firstDayOfWeek = useMemo(() => {
    const day = startOfMonth(currentMonth).getDay()
    return day === 0 ? 6 : day - 1 // Mon-Sun
  }, [currentMonth])

  function isDateUnavailable(date) {
    return isPast(startOfDay(date)) && !isToday(date)
  }

  function isSlotBooked(court, date, slot) {
    if (!date) return false
    return bookedSet.has(`${court}|${format(date, 'yyyy-MM-dd')}|${slot}`)
  }

  function getCourtAvailableCount(court) {
    if (!selectedDate) return TIME_SLOTS.length
    return TIME_SLOTS.filter(s => !isSlotBooked(court, selectedDate, s)).length
  }

  const price = isResident === 'resident' ? PRICING.resident : isResident === 'nonResident' ? PRICING.nonResident : null

  function handleSubmit() {
    if (!form.name || !form.email) return
    setSubmitted(true)
    setStep(3)
  }

  function resetAll() {
    setStep(0)
    setSelectedDate(null)
    setSelectedCourt(null)
    setSelectedTime(null)
    setIsResident(null)
    setForm({ name: '', email: '', phone: '' })
    setSubmitted(false)
  }

  if (submitted) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{
          background: '#fff',
          borderRadius: '1.5rem',
          padding: 'clamp(2rem, 5vw, 3.5rem)',
          textAlign: 'center',
          maxWidth: 520,
          width: '100%',
          border: '2px solid #dcfce7',
          boxShadow: '0 20px 60px rgba(22,101,52,0.12)',
        }}>
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, #14532d, #22c55e)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={40} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
            Booking Confirmed!
          </h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', lineHeight: 1.7 }}>
            Your court has been reserved. A confirmation has been sent to <strong>{form.email}</strong>.
          </p>
          <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
            {[
              { label: 'Name', value: form.name },
              { label: 'Court', value: `Court ${selectedCourt}` },
              { label: 'Date', value: format(selectedDate, 'EEEE, MMMM d, yyyy') },
              { label: 'Time', value: selectedTime },
              { label: 'Status', value: isResident === 'resident' ? 'Donnacona Resident' : 'Non-Resident' },
              { label: 'Total', value: `$${price}` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.625rem', marginBottom: '0.625rem', borderBottom: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>{r.value}</span>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={resetAll} style={{ width: '100%' }}>
            Book Another Court
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <span className="section-tag">Online Booking</span>
          <h1 className="section-title">Book a Court</h1>
          <p className="section-subtitle" style={{ margin: '0 auto' }}>
            Select your date, court, and time — it only takes a minute.
          </p>
        </div>

        {/* Step indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2.5rem',
          gap: 0,
        }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem',
              }}>
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.875rem',
                  background: i < step ? '#166534' : i === step ? '#166534' : '#e2e8f0',
                  color: i <= step ? '#fff' : '#94a3b8',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: i <= step ? '#166534' : '#94a3b8',
                  whiteSpace: 'nowrap',
                }}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 'clamp(2rem, 6vw, 5rem)',
                  height: 2,
                  background: i < step ? '#166534' : '#e2e8f0',
                  margin: '0 0.25rem',
                  marginBottom: '1.25rem',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Date picker */}
        {step === 0 && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarCheck size={22} color="#166534" />
              Choose a Date
            </h3>

            {/* Month nav */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontWeight: 700, fontSize: '1.0625rem', color: '#0f172a' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                style={{ background: '#f1f5f9', border: 'none', width: 36, height: 36, borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.375rem' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0.5rem 0' }}>{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {/* Leading blanks */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`blank-${i}`} />)}
              {daysInMonth.map(day => {
                const unavailable = isDateUnavailable(day)
                const selected = selectedDate && isSameDay(day, selectedDate)
                const today = isToday(day)
                return (
                  <button
                    key={day.toISOString()}
                    disabled={unavailable}
                    onClick={() => setSelectedDate(day)}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '0.625rem',
                      border: today && !selected ? '2px solid #22c55e' : '2px solid transparent',
                      background: selected ? '#166534' : 'transparent',
                      color: unavailable ? '#cbd5e1' : selected ? '#fff' : today ? '#166534' : '#0f172a',
                      fontWeight: selected || today ? 700 : 500,
                      fontSize: '0.9rem',
                      cursor: unavailable ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!unavailable && !selected) e.currentTarget.style.background = '#f1f5f9' }}
                    onMouseLeave={e => { if (!selected) e.currentTarget.style.background = 'transparent' }}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            {selectedDate && (
              <div style={{ marginTop: '1.5rem', padding: '0.875rem 1.25rem', background: '#f0fdf4', borderRadius: '0.75rem', color: '#166534', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={17} />
                Selected: {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn-primary"
                disabled={!selectedDate}
                onClick={() => setStep(1)}
                style={{ opacity: selectedDate ? 1 : 0.5, cursor: selectedDate ? 'pointer' : 'not-allowed' }}
              >
                Next: Choose Court
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Court & Time */}
        {step === 1 && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={22} color="#166534" />
              Select Court & Time
            </h3>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </p>

            {/* Courts */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>Select a Court</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                {COURTS.map(c => {
                  const available = getCourtAvailableCount(c.id)
                  const sel = selectedCourt === c.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCourt(c.id); setSelectedTime(null) }}
                      style={{
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        border: sel ? `2px solid ${c.color}` : '2px solid #e2e8f0',
                        background: sel ? `${c.color}12` : '#fff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36,
                        borderRadius: '50%',
                        background: sel ? c.color : '#f1f5f9',
                        color: sel ? '#fff' : '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.9375rem',
                        margin: '0 auto 0.5rem',
                      }}>
                        {c.id}
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: available > 0 ? '#166534' : '#ef4444', fontWeight: 600 }}>
                        {available} slots free
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time slots */}
            {selectedCourt && (
              <div>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.875rem' }}>Select a Time (1 hour)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
                  {TIME_SLOTS.map(slot => {
                    const booked = isSlotBooked(selectedCourt, selectedDate, slot)
                    const sel = selectedTime === slot
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedTime(slot)}
                        style={{
                          padding: '0.625rem 0.5rem',
                          borderRadius: '0.625rem',
                          border: sel ? '2px solid #166534' : booked ? '2px solid #fee2e2' : '2px solid #e2e8f0',
                          background: sel ? '#166534' : booked ? '#fef2f2' : '#fff',
                          color: sel ? '#fff' : booked ? '#fca5a5' : '#334155',
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          cursor: booked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s',
                          textDecoration: booked ? 'line-through' : 'none',
                        }}
                        onMouseEnter={e => { if (!booked && !sel) e.currentTarget.style.background = '#f0fdf4' }}
                        onMouseLeave={e => { if (!sel) e.currentTarget.style.background = booked ? '#fef2f2' : '#fff' }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.875rem', fontSize: '0.8125rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#166534', display: 'inline-block' }} />Available</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ width: 12, height: 12, borderRadius: 3, background: '#fca5a5', display: 'inline-block' }} />Booked</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setStep(0)}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn-primary"
                disabled={!selectedCourt || !selectedTime}
                onClick={() => setStep(2)}
                style={{ opacity: (selectedCourt && selectedTime) ? 1 : 0.5, cursor: (selectedCourt && selectedTime) ? 'pointer' : 'not-allowed' }}
              >
                Next: Your Details
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontWeight: 700, color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={22} color="#166534" />
              Your Details
            </h3>

            {/* Booking summary */}
            <div style={{ background: '#f0fdf4', borderRadius: '0.875rem', padding: '1.25rem', marginBottom: '1.75rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
              {[
                { label: 'Date', value: format(selectedDate, 'MMM d, yyyy') },
                { label: 'Court', value: `Court ${selectedCourt}` },
                { label: 'Time', value: selectedTime },
              ].map(r => (
                <div key={r.label}>
                  <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
                  <div style={{ fontWeight: 700, color: '#14532d' }}>{r.value}</div>
                </div>
              ))}
            </div>

            {/* Resident status */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '0.875rem' }}>
                Are you a Donnacona resident?
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {[
                  { value: 'resident', label: '✅ Resident — $30', desc: 'Proof of residency required' },
                  { value: 'nonResident', label: '🌍 Non-Resident — $50', desc: 'Open to all visitors' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setIsResident(opt.value)}
                    style={{
                      flex: '1 1 200px',
                      padding: '1.125rem 1.25rem',
                      borderRadius: '0.875rem',
                      border: isResident === opt.value ? '2px solid #166534' : '2px solid #e2e8f0',
                      background: isResident === opt.value ? '#f0fdf4' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>
              {isResident === 'resident' && (
                <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem', padding: '0.875rem', background: '#fefce8', borderRadius: '0.625rem', fontSize: '0.875rem', color: '#92400e', alignItems: 'flex-start' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  Please bring valid proof of Donnacona residency when you visit. Examples: utility bill, government ID with local address.
                </div>
              )}
            </div>

            {/* Price display */}
            {price && (
              <div style={{
                background: 'linear-gradient(135deg, #14532d, #166534)',
                color: '#fff',
                borderRadius: '0.875rem',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Due</div>
                  <div style={{ fontWeight: 800, fontSize: '1.75rem' }}>${price}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.875rem', color: '#bbf7d0' }}>
                  1 hour · Court {selectedCourt}
                </div>
              </div>
            )}

            {/* Contact form */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { id: 'name', label: 'Full Name *', type: 'text', placeholder: 'John Doe' },
                { id: 'email', label: 'Email Address *', type: 'email', placeholder: 'you@example.com' },
                { id: 'phone', label: 'Phone Number (optional)', type: 'tel', placeholder: '(418) 555-0000' },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: 'block', fontWeight: 600, color: '#334155', marginBottom: '0.375rem', fontSize: '0.9375rem' }}>{f.label}</label>
                  <input
                    id={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.id]}
                    onChange={e => setForm(prev => ({ ...prev, [f.id]: e.target.value }))}
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
              ))}
            </div>

            <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button className="btn-secondary" onClick={() => setStep(1)}>
                <ChevronLeft size={18} />
                Back
              </button>
              <button
                className="btn-primary"
                disabled={!isResident || !form.name || !form.email}
                onClick={handleSubmit}
                style={{ opacity: (isResident && form.name && form.email) ? 1 : 0.5, cursor: (isResident && form.name && form.email) ? 'pointer' : 'not-allowed' }}
              >
                <CreditCard size={18} />
                Confirm & Pay ${price ?? '—'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
