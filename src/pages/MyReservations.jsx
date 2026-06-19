import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, MapPin, User, Users, ChevronRight, CalendarCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import { COURTS, START_TIMES, slotLabel } from '../data/courts'
import { format, parseISO, isFuture, isToday, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function MyReservations() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { getUserBookings } = useBookings()

  const upcomingBookings = useMemo(() => {
    if (!user) return []
    const all = getUserBookings(user.id)
    const todayStart = startOfDay(new Date())
    return all
      .filter(b => {
        const bDate = parseISO(b.date)
        return bDate >= todayStart
      })
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date)
        if (dateCmp !== 0) return dateCmp
        return START_TIMES.indexOf(a.startSlot) - START_TIMES.indexOf(b.startSlot)
      })
  }, [user, getUserBookings])

  function formatBookingDate(dateStr) {
    const d = parseISO(dateStr)
    const label = format(d, 'EEEE d MMMM yyyy', { locale: fr })
    if (isToday(d)) return `Aujourd'hui — ${label}`
    if (isFuture(d)) return label
    return label
  }

  function getCourtName(courtId) {
    return COURTS.find(c => c.id === courtId)?.name ?? `Terrain ${courtId}`
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#f8fafc', minHeight: 'calc(100vh - 4.5rem)', padding: 'clamp(2rem, 5vw, 4rem) 0' }}>
      <div className="container" style={{ maxWidth: 720 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '0.875rem', background: 'linear-gradient(135deg, #1B4E8B, #2563A8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>Mes réservations</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.125rem 0 0 0' }}>
              {upcomingBookings.length > 0
                ? `${upcomingBookings.length} réservation${upcomingBookings.length > 1 ? 's' : ''} à venir`
                : 'Aucune réservation à venir'}
            </p>
          </div>
        </div>

        <div style={{ height: 1, background: '#e2e8f0', margin: '1.25rem 0' }} />

        {upcomingBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: '1.25rem', border: '1.5px solid #e2e8f0' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Calendar size={28} color="#166534" />
            </div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Aucune réservation à venir</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
              Vous n'avez pas encore de réservations prévues. Réservez un terrain pour commencer à jouer !
            </p>
            <button className="btn-primary" onClick={() => navigate('/book')} style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}>
              <CalendarCheck size={18} /> Réserver un terrain
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingBookings.map(b => (
              <div key={b.id} style={{ background: '#fff', borderRadius: '1.125rem', border: '1.5px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                {/* Date badge */}
                <div style={{ flexShrink: 0, width: 56, height: 56, borderRadius: '0.875rem', background: 'linear-gradient(135deg, #1B4E8B, #2563A8)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {format(parseISO(b.date), 'MMM', { locale: fr })}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, lineHeight: 1 }}>
                    {format(parseISO(b.date), 'd')}
                  </span>
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                        {getCourtName(b.courtId)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Clock size={13} />
                        <span>{slotLabel(b.startSlot, b.duration || 1)}</span>
                        <span style={{ color: '#cbd5e1' }}>·</span>
                        <MapPin size={13} />
                        <span>Terrain {b.courtId}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#166534', background: '#f0fdf4', padding: '0.25rem 0.625rem', borderRadius: '0.5rem', whiteSpace: 'nowrap' }}>
                      {b.isResident ? 'Résident' : 'Non-résident'}
                    </div>
                  </div>

                  {/* Booker */}
                  <div style={{ marginTop: '0.625rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                    <User size={14} color="#94a3b8" />
                    {b.userName}
                  </div>

                  {/* Companions */}
                  {b.companions && b.companions.length > 0 && (
                    <div style={{ marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                      <Users size={14} color="#94a3b8" />
                      {b.companions.map((c, i) => (
                        <span key={i} style={{ background: '#f1f5f9', padding: '0.125rem 0.5rem', borderRadius: '0.375rem', fontWeight: 600, fontSize: '0.75rem', color: '#64748b' }}>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price */}
                  {b.price && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
                      {b.price === 0 ? 'Gratuit (passe actif)' : `${b.price}$`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn-secondary" onClick={() => navigate('/book')} style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
            <CalendarCheck size={16} /> Faire une nouvelle réservation <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}