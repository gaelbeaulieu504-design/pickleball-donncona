import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Users, CheckCircle, XCircle, MapPin, Mail, Clock, Ban } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import { WEEKLY_HOUR_LIMIT } from '../data/courts'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

export default function AdminPanel() {
  const { user, getAllUsers } = useAuth()
  const { bookings, getUserWeekHours } = useBookings()
  const navigate = useNavigate()

  if (!user?.isAdmin) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Ban size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ color: '#0f172a', fontWeight: 800 }}>Accès refusé</h2>
          <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Cette page est réservée aux administrateurs.</p>
          <button className="btn-secondary" onClick={() => navigate('/')}>Retour à l'accueil</button>
        </div>
      </div>
    )
  }

  const members = getAllUsers()
  const paidMembers = members.filter(m => m.seasonPassPaid)
  const residentCount = paidMembers.filter(m => m.seasonPassType === 'resident').length
  const nonResidentCount = paidMembers.filter(m => m.seasonPassType === 'nonResident').length
  const totalRevenue = residentCount * 30 + nonResidentCount * 50

  const today = new Date()
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'MMM d', { locale: fr })
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'MMM d yyyy', { locale: fr })

  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 1000 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 44, height: 44, background: '#dc2626', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>Panneau administrateur</h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Pickleball Donnacona — Été 2026</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Membres inscrits', value: members.length, color: '#1d4ed8', bg: '#eff6ff', icon: <Users size={20} color="#1d4ed8" /> },
            { label: 'Passes actifs', value: paidMembers.length, color: '#166534', bg: '#f0fdf4', icon: <CheckCircle size={20} color="#166534" /> },
            { label: 'Résidents', value: residentCount, color: '#166534', bg: '#f0fdf4', icon: <MapPin size={20} color="#166534" /> },
            { label: 'Non-résidents', value: nonResidentCount, color: '#b45309', bg: '#fffbeb', icon: <MapPin size={20} color="#b45309" /> },
            { label: 'Revenus total', value: `$${totalRevenue}`, color: '#7c3aed', bg: '#f5f3ff', icon: <CheckCircle size={20} color="#7c3aed" /> },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${s.color}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.375rem' }}>{s.label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                </div>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* Members table */}
        <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.125rem' }}>
                <Users size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Liste des membres
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Semaine en cours : {weekStart} – {weekEnd}</p>
            </div>
            <span style={{ background: '#f1f5f9', color: '#64748b', padding: '0.375rem 0.875rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {members.length} membre{members.length !== 1 ? 's' : ''}
            </span>
          </div>

          {members.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p>Aucun membre inscrit pour l'instant.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Nom', 'Courriel', 'Adresse', 'Résidence', 'Passe saisonnier', 'Heures/semaine', 'Réservations'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => {
                    const weekHrs = getUserWeekHours(m.id, today)
                    const memberBookings = bookings.filter(b => b.userId === m.id)
                    return (
                      <tr key={m.id} style={{ borderBottom: i < members.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#166534', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.875rem', flexShrink: 0 }}>
                              {m.name[0].toUpperCase()}
                            </div>
                            {m.name}
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: '#475569' }}>
                          <a href={`mailto:${m.email}`} style={{ color: '#166534', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Mail size={13} />{m.email}
                          </a>
                        </td>
                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#64748b', maxWidth: 200 }}>
                          {m.address ? (
                            <span style={{ display: 'flex', alignItems: 'flex-start', gap: '0.375rem' }}>
                              <MapPin size={13} style={{ flexShrink: 0, marginTop: 2, color: '#94a3b8' }} />
                              <span style={{ lineHeight: 1.4 }}>{m.address.split(',').slice(0, 2).join(',')}</span>
                            </span>
                          ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {m.isResident === true
                            ? <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><CheckCircle size={11} />Résident</span>
                            : m.isResident === false
                            ? <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}><XCircle size={11} />Non-résident</span>
                            : <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          {m.seasonPassPaid
                            ? <div>
                                <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content', marginBottom: '0.25rem' }}>
                                  <CheckCircle size={11} />Actif
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                  {m.seasonPassType === 'resident' ? '$50 résident' : '$75 non-résident'}
                                </span>
                              </div>
                            : <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem', width: 'fit-content' }}>
                                <XCircle size={11} />Non payé
                              </span>
                          }
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: 60, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.min((weekHrs / WEEKLY_HOUR_LIMIT) * 100, 100)}%`, background: weekHrs >= WEEKLY_HOUR_LIMIT ? '#dc2626' : weekHrs >= 4 ? '#d97706' : '#166534', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: weekHrs >= WEEKLY_HOUR_LIMIT ? '#dc2626' : '#334155' }}>
                              {weekHrs}h/{WEEKLY_HOUR_LIMIT}h
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.875rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Clock size={14} color="#94a3b8" />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>{memberBookings.length}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>total</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div style={{ marginTop: '2rem', background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>
              <Clock size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Toutes les réservations ({bookings.length})
            </h2>
          </div>
          {bookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Aucune réservation pour l'instant.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    {['Membre', 'Date', 'Terrain', 'Heure', 'Durée', 'Tarif'].map(h => (
                      <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...bookings].reverse().map((b, i) => (
                    <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600, color: '#0f172a', fontSize: '0.875rem' }}>{b.userName}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap' }}>
                        {format(new Date(b.date + 'T12:00:00'), 'd MMM yyyy', { locale: fr })}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>Terrain {b.courtId}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap' }}>{b.startSlot}</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{b.duration}h</td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                        {b.price === 0
                          ? <span style={{ color: '#166534', fontWeight: 700 }}>Inclus</span>
                          : <span style={{ color: '#7c3aed', fontWeight: 700 }}>${b.price}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
