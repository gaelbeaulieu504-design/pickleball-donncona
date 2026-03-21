import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShieldCheck, Users, CheckCircle, XCircle, MapPin, Mail, Clock, Ban, Send, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import { WEEKLY_HOUR_LIMIT } from '../data/courts'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { sendBroadcast } from '../utils/sendEmail'

export default function AdminPanel() {
  const { user, getAllUsers } = useAuth()
  const { bookings, getUserWeekHours } = useBookings()
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState('members')

  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailTarget, setEmailTarget] = useState('all')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const [memberFilter, setMemberFilter] = useState('all')
  const [expandedMember, setExpandedMember] = useState(null)

  useEffect(() => {
    if (user?.isAdmin) {
      getAllUsers().then(setMembers).catch(() => setMembers([]))
    }
  }, [user])

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

  const paidMembers = members.filter(m => m.seasonPassPaid)
  const residentCount = paidMembers.filter(m => m.seasonPassType === 'resident').length
  const nonResidentCount = paidMembers.filter(m => m.seasonPassType === 'nonResident').length
  const totalRevenue = residentCount * 50 + nonResidentCount * 75

  const today = new Date()
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'MMM d', { locale: fr })
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'MMM d yyyy', { locale: fr })

  const filteredMembers = members.filter(m => {
    if (memberFilter === 'paid') return m.seasonPassPaid
    if (memberFilter === 'unpaid') return !m.seasonPassPaid
    return true
  })

  const emailTargetMembers = members.filter(m => {
    if (emailTarget === 'paid') return m.seasonPassPaid
    if (emailTarget === 'unpaid') return !m.seasonPassPaid
    return true
  })

  async function handleSendBroadcast() {
    if (!emailSubject.trim() || !emailMessage.trim()) return
    setSending(true)
    setSendResult(null)
    let sent = 0, failed = 0, notConfigured = false
    for (const member of emailTargetMembers) {
      const result = await sendBroadcast({ to_name: member.name, to_email: member.email, subject: emailSubject, message: emailMessage })
      if (result.notConfigured) { notConfigured = true; break }
      if (result.success) sent++
      else failed++
    }
    setSending(false)
    setSendResult({ sent, failed, notConfigured, total: emailTargetMembers.length })
  }

  const tabStyle = (tab) => ({
    padding: '0.625rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.9rem',
    border: 'none', cursor: 'pointer',
    background: activeTab === tab ? '#1B4E8B' : 'transparent',
    color: activeTab === tab ? '#fff' : '#64748b', transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: 'clamp(2rem, 5vw, 3.5rem) 0' }}>
      <div className="container" style={{ maxWidth: 1100 }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 44, height: 44, background: '#dc2626', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>Panneau administrateur</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Pickleball Donnacona — Été 2026</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Membres inscrits', value: members.length, color: '#1B4E8B', bg: '#EBF3FB', icon: <Users size={20} color="#1B4E8B" /> },
            { label: 'Passes actifs', value: paidMembers.length, color: '#2E7D32', bg: '#f0fdf4', icon: <CheckCircle size={20} color="#2E7D32" /> },
            { label: 'Résidents', value: residentCount, color: '#2E7D32', bg: '#f0fdf4', icon: <MapPin size={20} color="#2E7D32" /> },
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

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.375rem', background: '#f1f5f9', borderRadius: '0.875rem', padding: '0.375rem', marginBottom: '1.5rem', width: 'fit-content' }}>
          <button style={tabStyle('members')} onClick={() => setActiveTab('members')}>
            <Users size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Membres ({members.length})
          </button>
          <button style={tabStyle('bookings')} onClick={() => setActiveTab('bookings')}>
            <Clock size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Réservations ({bookings.length})
          </button>
          <button style={tabStyle('email')} onClick={() => setActiveTab('email')}>
            <Mail size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Envoyer un courriel
          </button>
        </div>

        {/* ── Tab: Members ── */}
        {activeTab === 'members' && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.125rem' }}>Liste des membres</h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Semaine en cours : {weekStart} – {weekEnd}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[{ v: 'all', l: 'Tous' }, { v: 'paid', l: 'Passe actif' }, { v: 'unpaid', l: 'Non payé' }].map(f => (
                  <button key={f.v} onClick={() => setMemberFilter(f.v)} style={{ padding: '0.375rem 0.875rem', borderRadius: '2rem', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem', background: memberFilter === f.v ? '#1B4E8B' : '#f1f5f9', color: memberFilter === f.v ? '#fff' : '#64748b', transition: 'all 0.15s' }}>
                    {f.l}
                  </button>
                ))}
              </div>
            </div>

            {filteredMembers.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <Users size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p>Aucun membre pour ce filtre.</p>
              </div>
            ) : (
              <div>
                {filteredMembers.map((m, i) => {
                  const weekHrs = getUserWeekHours(m.id, today)
                  const memberBookings = bookings.filter(b => b.userId === m.id)
                  const isExpanded = expandedMember === m.id
                  return (
                    <div key={m.id} style={{ borderBottom: i < filteredMembers.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer', transition: 'background 0.15s' }}
                        onClick={() => setExpandedMember(isExpanded ? null : m.id)}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1B4E8B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                          {m.name[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{m.name}</div>
                          <a href={`mailto:${m.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: '0.8rem', color: '#1B4E8B', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', textDecoration: 'none' }}>
                            <Mail size={12} />{m.email}
                          </a>
                        </div>
                        <div style={{ minWidth: 110 }}>
                          {m.isResident === true
                            ? <span style={{ background: '#f0fdf4', color: '#2E7D32', border: '1px solid #bbf7d0', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>🏠 Résident</span>
                            : m.isResident === false
                            ? <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>🌍 Non-résident</span>
                            : <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                          }
                        </div>
                        <div style={{ minWidth: 120 }}>
                          {m.seasonPassPaid
                            ? <div>
                                <span style={{ background: '#f0fdf4', color: '#2E7D32', border: '1px solid #bbf7d0', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle size={11} /> Actif
                                </span>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                  {m.seasonPassType === 'resident' ? '$50 résident' : '$75 non-résident'}
                                </div>
                              </div>
                            : <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                <XCircle size={11} /> Non payé
                              </span>
                          }
                        </div>
                        <div style={{ minWidth: 100, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: 50, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min((weekHrs / WEEKLY_HOUR_LIMIT) * 100, 100)}%`, background: weekHrs >= WEEKLY_HOUR_LIMIT ? '#dc2626' : weekHrs >= 4 ? '#d97706' : '#2E7D32', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: weekHrs >= WEEKLY_HOUR_LIMIT ? '#dc2626' : '#334155', whiteSpace: 'nowrap' }}>{weekHrs}h/{WEEKLY_HOUR_LIMIT}h</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.8rem', fontWeight: 700 }}>
                            {memberBookings.length} réserv.
                          </span>
                          {isExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9', padding: '1rem 1.5rem 1.25rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: memberBookings.length > 0 ? '1rem' : 0 }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Adresse</div>
                              <div style={{ fontSize: '0.875rem', color: '#334155' }}>{m.address || '—'}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Courriel</div>
                              <a href={`mailto:${m.email}`} style={{ fontSize: '0.875rem', color: '#1B4E8B', fontWeight: 600 }}>{m.email}</a>
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total réservations</div>
                              <div style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 700 }}>{memberBookings.length}</div>
                            </div>
                          </div>
                          {memberBookings.length > 0 && (
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Historique</div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                {[...memberBookings].reverse().slice(0, 8).map(b => (
                                  <span key={b.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.8rem', color: '#475569' }}>
                                    Terrain {b.courtId} · {format(new Date(b.date + 'T12:00:00'), 'd MMM', { locale: fr })} · {b.startSlot} · {b.duration}h
                                  </span>
                                ))}
                                {memberBookings.length > 8 && <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center' }}>+{memberBookings.length - 8} autres</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Bookings ── */}
        {activeTab === 'bookings' && (
          <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Toutes les réservations ({bookings.length})</h2>
            </div>
            {bookings.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>Aucune réservation pour l'instant.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc' }}>
                      {['Membre', 'Courriel', 'Date', 'Terrain', 'Heure', 'Durée', 'Tarif'].map(h => (
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
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.8rem' }}>
                          <a href={`mailto:${b.userEmail}`} style={{ color: '#1B4E8B', textDecoration: 'none' }}>{b.userEmail}</a>
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap' }}>
                          {format(new Date(b.date + 'T12:00:00'), 'd MMM yyyy', { locale: fr })}
                        </td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>Terrain {b.courtId}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569', whiteSpace: 'nowrap' }}>{b.startSlot}</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#475569' }}>{b.duration}h</td>
                        <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem' }}>
                          {b.price === 0 ? <span style={{ color: '#2E7D32', fontWeight: 700 }}>Inclus</span> : <span style={{ color: '#7c3aed', fontWeight: 700 }}>${b.price}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Email broadcast ── */}
        {activeTab === 'email' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem' }}>
                <div style={{ width: 38, height: 38, background: '#EBF3FB', borderRadius: '0.625rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#1B4E8B" />
                </div>
                <div>
                  <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>Envoyer un courriel aux membres</h2>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Envoyé individuellement à chaque membre sélectionné via EmailJS</p>
                </div>
              </div>

              {/* Target */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Destinataires</label>
                <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                  {[
                    { v: 'all', l: `Tous (${members.length})` },
                    { v: 'paid', l: `Passe actif (${paidMembers.length})` },
                    { v: 'unpaid', l: `Sans passe (${members.length - paidMembers.length})` },
                  ].map(opt => (
                    <button key={opt.v} onClick={() => setEmailTarget(opt.v)} style={{ padding: '0.5rem 1rem', borderRadius: '0.625rem', border: emailTarget === opt.v ? '2px solid #1B4E8B' : '2px solid #e2e8f0', background: emailTarget === opt.v ? '#EBF3FB' : '#fff', color: emailTarget === opt.v ? '#1B4E8B' : '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                      {opt.l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sujet <span style={{ color: '#dc2626' }}>*</span></label>
                <input type="text" placeholder="Ex : Nouveau terrain disponible à Donnacona !" value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '2px solid #e2e8f0', fontSize: '0.9375rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {/* Message */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, color: '#334155', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea placeholder="Écrivez votre message ici..." value={emailMessage} onChange={e => setEmailMessage(e.target.value)} rows={7}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.625rem', border: '2px solid #e2e8f0', fontSize: '0.9375rem', fontFamily: 'inherit', color: '#0f172a', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6, transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = '#1B4E8B'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
              </div>

              {sendResult && (
                <div style={{ background: sendResult.notConfigured ? '#fefce8' : sendResult.failed > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${sendResult.notConfigured ? '#fde68a' : sendResult.failed > 0 ? '#fecaca' : '#bbf7d0'}`, borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                  <AlertCircle size={18} color={sendResult.notConfigured ? '#b45309' : sendResult.failed > 0 ? '#dc2626' : '#2E7D32'} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div style={{ fontSize: '0.875rem', color: '#334155' }}>
                    {sendResult.notConfigured
                      ? <><strong>EmailJS non configuré.</strong> Vérifiez vos clés dans le fichier <code>.env</code>.</>
                      : <><strong>{sendResult.sent} courriel{sendResult.sent > 1 ? 's' : ''} envoyé{sendResult.sent > 1 ? 's' : ''}</strong>{sendResult.failed > 0 ? ` · ${sendResult.failed} échec(s)` : ' avec succès !'}</>
                    }
                  </div>
                </div>
              )}

              <button className="btn-primary" disabled={!emailSubject.trim() || !emailMessage.trim() || sending || emailTargetMembers.length === 0}
                onClick={handleSendBroadcast}
                style={{ opacity: (!emailSubject.trim() || !emailMessage.trim() || sending || emailTargetMembers.length === 0) ? 0.5 : 1, fontSize: '1rem', padding: '0.875rem 2rem' }}>
                {sending
                  ? <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', marginRight: '0.5rem' }} />Envoi en cours… ({emailTargetMembers.length})</>
                  : <><Send size={18} /> Envoyer à {emailTargetMembers.length} membre{emailTargetMembers.length > 1 ? 's' : ''}</>
                }
              </button>
            </div>

            {/* Recipient list */}
            <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>Destinataires</h3>
                <span style={{ background: '#1B4E8B', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.625rem', borderRadius: '2rem' }}>{emailTargetMembers.length}</span>
              </div>
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {emailTargetMembers.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>Aucun destinataire</div>
                ) : emailTargetMembers.map((m, i) => (
                  <div key={m.id} style={{ padding: '0.75rem 1.25rem', borderBottom: i < emailTargetMembers.length - 1 ? '1px solid #f8fafc' : 'none', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EBF3FB', color: '#1B4E8B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                      {m.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8375rem' }}>{m.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
