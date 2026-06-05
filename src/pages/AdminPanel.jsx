import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ShieldCheck, Users, CheckCircle, XCircle, MapPin, Mail, Clock, Ban, Send, AlertCircle, ChevronDown, ChevronUp, Gift, Trophy, Plus, Trash2, Calendar, FileText, Download, GraduationCap, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useBookings } from '../context/BookingContext'
import { WEEKLY_HOUR_LIMIT } from '../data/courts'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'
import { sendBroadcast } from '../utils/sendEmail'

export default function AdminPanel() {
  const { user, getAllUsers, grantFreePass, toggleSeasonPass, deleteUser } = useAuth()
  const { bookings, getUserWeekHours } = useBookings()
  const navigate = useNavigate()
  const [members, setMembers] = useState([])
  const [activeTab, setActiveTab] = useState('members')
  const [tournaments, setTournaments] = useState([])
  const [tournamentForm, setTournamentForm] = useState({ name: '', date: '', location: '', description: '', maxPlayers: '', price: '', categories: [] })
  const [categoryInput, setCategoryInput] = useState('')
  const [editingTournamentId, setEditingTournamentId] = useState(null)

  function addCategory() {
    const c = categoryInput.trim()
    if (!c || tournamentForm.categories.includes(c)) return
    setTournamentForm(v => ({ ...v, categories: [...v.categories, c] }))
    setCategoryInput('')
  }

  function removeCategory(i) {
    setTournamentForm(v => ({ ...v, categories: v.categories.filter((_, idx) => idx !== i) }))
  }
  const [creatingTournament, setCreatingTournament] = useState(false)
  const [tournamentResult, setTournamentResult] = useState(null)
  const [showTournamentForm, setShowTournamentForm] = useState(false)

  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [emailTarget, setEmailTarget] = useState('all')
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState(null)

  const [memberFilter, setMemberFilter] = useState('all')
  const [expandedMember, setExpandedMember] = useState(null)
  const [courses, setCourses] = useState([])

  useEffect(() => {
    if (user?.isAdmin) {
      getAllUsers().then(setMembers).catch(() => setMembers([]))
      fetch('/api/tournaments').then(r => r.json()).then(d => setTournaments(Array.isArray(d) ? d : [])).catch(() => {})
      fetch('/api/courses').then(r => r.json()).then(d => setCourses(Array.isArray(d) ? d : [])).catch(() => {})
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
  const freePassMembers = members.filter(m => m.freePass)
  const residentCount = paidMembers.filter(m => m.seasonPassType === 'resident' && !m.freePass).length
  const nonResidentCount = paidMembers.filter(m => m.seasonPassType === 'nonResident' && !m.freePass).length
  const totalRevenue = residentCount * 40 + nonResidentCount * 85

  async function handleGrantFreePass(memberId, grant) {
    await grantFreePass(memberId, grant)
    getAllUsers().then(setMembers).catch(() => {})
  }

  async function handleTogglePass(memberId, active) {
    await toggleSeasonPass(memberId, active)
    getAllUsers().then(setMembers).catch(() => {})
  }

  async function handleDeleteUser(memberId, memberName) {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le compte de ${memberName} ?\n\nCette action est irréversible.`)) return
    const ok = await deleteUser(memberId)
    if (ok) {
      getAllUsers().then(setMembers).catch(() => {})
    } else {
      alert('Erreur lors de la suppression du compte.')
    }
  }

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

  async function handleCreateTournament() {
    if (!tournamentForm.name.trim() || !tournamentForm.date) return
    setCreatingTournament(true)
    setTournamentResult(null)
    try {
      const isEditing = !!editingTournamentId
      const body = isEditing ? { ...tournamentForm, id: editingTournamentId } : tournamentForm
      const res = await fetch('/api/tournaments', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (isEditing ? data.id : data.id) {
        if (isEditing) {
          setTournaments(ts => ts.map(t => t.id === editingTournamentId ? data : t))
        } else {
          setTournaments(ts => [...ts, data])
        }
        setTournamentForm({ name: '', date: '', location: '', description: '', maxPlayers: '', price: '', categories: [] })
        setCategoryInput('')
        setEditingTournamentId(null)
        setTournamentResult({ ok: true })
        setShowTournamentForm(false)
      } else {
        setTournamentResult({ error: data.error || 'Erreur' })
      }
    } catch {
      setTournamentResult({ error: 'Erreur réseau' })
    }
    setCreatingTournament(false)
  }

  async function handleEditTournament(t) {
    setEditingTournamentId(t.id)
    setTournamentForm({
      name: t.name,
      date: t.date,
      location: t.location || '',
      description: t.description || '',
      maxPlayers: t.maxPlayers || '',
      price: t.price || '',
      categories: t.categories || [],
    })
    setCategoryInput('')
    setTournamentResult(null)
    setShowTournamentForm(true)
  }

  function cancelEdit() {
    setEditingTournamentId(null)
    setTournamentForm({ name: '', date: '', location: '', description: '', maxPlayers: '', price: '', categories: [] })
    setCategoryInput('')
    setShowTournamentForm(false)
  }

  async function handleDeleteTournament(id) {
    if (!window.confirm('Supprimer ce tournoi ?')) return
    await fetch('/api/tournaments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tournamentId: id }) })
    setTournaments(ts => ts.filter(t => t.id !== id))
  }

  async function handleSendBroadcast() {
    if (!emailSubject.trim() || !emailMessage.trim()) return
    setSending(true)
    setSendResult(null)
    let sent = 0, failed = 0, notConfigured = false
    const errors = []
    for (const member of emailTargetMembers) {
      const result = await sendBroadcast({ to_name: member.name, to_email: member.email, subject: emailSubject, message: emailMessage })
      if (result.notConfigured) { notConfigured = true; break }
      if (result.success) sent++
      else { failed++; errors.push(`${member.email}: ${result.error?.text || result.error?.message || JSON.stringify(result.error)}`) }
      // Délai entre chaque envoi pour éviter le rate-limiting EmailJS
      if (emailTargetMembers.length > 1) await new Promise(r => setTimeout(r, 800))
    }
    setSending(false)
    setSendResult({ sent, failed, notConfigured, total: emailTargetMembers.length, errors })
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
            { label: 'Passes gratuits', value: freePassMembers.length, color: '#0891b2', bg: '#ecfeff', icon: <Gift size={20} color="#0891b2" /> },
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
        <div style={{ display: 'flex', gap: '0.375rem', background: '#f1f5f9', borderRadius: '0.875rem', padding: '0.375rem', marginBottom: '1.5rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch', maxWidth: '100%', scrollbarWidth: 'none' }}
          className="admin-tabs-container">
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
          <button style={tabStyle('tournaments')} onClick={() => setActiveTab('tournaments')}>
            <Trophy size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Tournois ({tournaments.length})
          </button>
          <button style={tabStyle('report')} onClick={() => setActiveTab('report')}>
            <FileText size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Rapport
          </button>
          <button style={tabStyle('courses')} onClick={() => setActiveTab('courses')}>
            <GraduationCap size={15} style={{ display: 'inline', marginRight: '0.375rem', verticalAlign: 'middle' }} />
            Cours
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
                          {m.freePass
                            ? <div>
                                <span style={{ background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Gift size={11} /> Gratuit
                                </span>
                              </div>
                            : m.seasonPassPaid
                            ? <div>
                                <span style={{ background: '#f0fdf4', color: '#2E7D32', border: '1px solid #bbf7d0', padding: '0.25rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <CheckCircle size={11} /> Actif
                                </span>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                                  {m.seasonPassType === 'resident' ? '$40 résident' : '$85 non-résident'}
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
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Passe gratuit</div>
                              {m.freePass
                                ? <button onClick={e => { e.stopPropagation(); handleGrantFreePass(m.id, false) }}
                                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <XCircle size={13} /> Révoquer le passe gratuit
                                  </button>
                                : <button onClick={e => { e.stopPropagation(); handleGrantFreePass(m.id, true) }}
                                    style={{ background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <Gift size={13} /> Accorder passe gratuit
                                  </button>
                              }
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Passe saisonnier</div>
                              {m.seasonPassPaid
                                ? <button onClick={e => { e.stopPropagation(); handleTogglePass(m.id, false) }}
                                    style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                    <Ban size={13} /> Désactiver le passe
                                  </button>
                                : <div style={{ display: 'flex', gap: '0.375rem' }}>
                                    <button onClick={e => { e.stopPropagation(); handleTogglePass(m.id, true, 'resident') }}
                                      style={{ background: '#f0fdf4', color: '#2E7D32', border: '1px solid #bbf7d0', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                      <CheckCircle size={13} /> Activer (résident)
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleTogglePass(m.id, true, 'nonResident') }}
                                      style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                      <CheckCircle size={13} /> Activer (non-résident)
                                    </button>
                                  </div>
                              }
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
                          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                            <button onClick={e => { e.stopPropagation(); handleDeleteUser(m.id, m.name) }}
                              style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.375rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                              <Trash2 size={13} /> Supprimer le compte
                            </button>
                          </div>
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
                      : <>
                          <strong>{sendResult.sent} courriel{sendResult.sent > 1 ? 's' : ''} envoyé{sendResult.sent > 1 ? 's' : ''}</strong>{sendResult.failed > 0 ? ` · ${sendResult.failed} échec(s)` : ' avec succès !'}
                          {sendResult.errors?.length > 0 && (
                            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#dc2626', fontFamily: 'monospace', background: '#fff', borderRadius: '0.375rem', padding: '0.5rem', border: '1px solid #fecaca' }}>
                              {sendResult.errors.map((e, i) => <div key={i}>{e}</div>)}
                            </div>
                          )}
                        </>
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

        {/* ── Tab: Tournaments ── */}
        {activeTab === 'tournaments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.125rem' }}>Gestion des tournois</h2>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Les tournois créés ici sont visibles par tous les membres</p>
              </div>
              <button
                onClick={() => { setShowTournamentForm(v => !v); setTournamentResult(null) }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#b45309', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
              >
                <Plus size={16} /> {showTournamentForm ? 'Annuler' : 'Créer un tournoi'}
              </button>
            </div>

            {/* Create form */}
            {showTournamentForm && (
              <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>{editingTournamentId ? 'Modifier le tournoi' : 'Nouveau tournoi'}</h3>
                  {editingTournamentId && (
                    <button onClick={cancelEdit} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'underline' }}>
                      Annuler
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  {[
                    { label: 'Nom du tournoi *', key: 'name', type: 'text', placeholder: 'Ex: Tournoi Été 2026' },
                    { label: 'Date *', key: 'date', type: 'date', placeholder: '' },
                    { label: 'Lieu', key: 'location', type: 'text', placeholder: 'Terrains de pickleball Donnacona' },
                    { label: 'Frais d\'inscription ($)', key: 'price', type: 'number', placeholder: '0 = Gratuit' },
                    { label: 'Max participants', key: 'maxPlayers', type: 'number', placeholder: 'Laisser vide = illimité' },
                  ].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>{f.label}</label>
                      <input
                        type={f.type} value={tournamentForm[f.key]} placeholder={f.placeholder}
                        onChange={e => setTournamentForm(v => ({ ...v, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Description</label>
                  <textarea
                    rows={3} value={tournamentForm.description} placeholder="Informations supplémentaires sur le tournoi…"
                    onChange={e => setTournamentForm(v => ({ ...v, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, color: '#334155', fontSize: '0.875rem', marginBottom: '0.375rem' }}>Catégories <span style={{ fontWeight: 400, color: '#94a3b8' }}>(ex: Simple hommes, Double femmes, Mixte…)</span></label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text" value={categoryInput} placeholder="Ajouter une catégorie"
                      onChange={e => setCategoryInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }}
                      style={{ flex: 1, padding: '0.625rem 0.875rem', borderRadius: '0.5rem', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', fontFamily: 'inherit' }}
                    />
                    <button onClick={addCategory} disabled={!categoryInput.trim()}
                      style={{ background: '#1B4E8B', color: '#fff', border: 'none', padding: '0.625rem 1rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', opacity: categoryInput.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem' }}>
                      <Plus size={15} /> Ajouter
                    </button>
                  </div>
                  {tournamentForm.categories.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {tournamentForm.categories.map((cat, i) => (
                        <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '2rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 600 }}>
                          {cat}
                          <button onClick={() => removeCategory(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#94a3b8', fontSize: '1rem', lineHeight: 1 }}>&times;</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {tournamentResult?.error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{tournamentResult.error}</div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  {editingTournamentId && (
                    <button onClick={cancelEdit}
                      style={{ background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.75rem 1.75rem', borderRadius: '0.625rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
                      Annuler
                    </button>
                  )}
                  <button
                    onClick={handleCreateTournament}
                    disabled={creatingTournament || !tournamentForm.name.trim() || !tournamentForm.date}
                    style={{ background: '#b45309', color: '#fff', border: 'none', padding: '0.75rem 1.75rem', borderRadius: '0.625rem', fontWeight: 700, cursor: 'pointer', opacity: creatingTournament || !tournamentForm.name.trim() || !tournamentForm.date ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    <Trophy size={16} /> {creatingTournament ? (editingTournamentId ? 'Enregistrement…' : 'Création…') : (editingTournamentId ? 'Enregistrer' : 'Créer le tournoi')}
                  </button>
                </div>
              </div>
            )}

            {tournamentResult?.ok && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.875rem', padding: '0.875rem 1rem', color: '#166534', fontWeight: 600, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} /> {editingTournamentId ? 'Tournoi modifié avec succès !' : 'Tournoi créé avec succès ! Il est maintenant visible par tous les membres.'}
              </div>
            )}

            {/* Tournament list */}
            {tournaments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#f8fafc', borderRadius: '1.25rem', border: '2px dashed #e2e8f0' }}>
                <Trophy size={40} color="#cbd5e1" style={{ margin: '0 auto 1rem', display: 'block' }} />
                <p style={{ color: '#94a3b8', fontWeight: 600 }}>Aucun tournoi créé</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {[...tournaments].reverse().map(t => (
                  <div key={t.id} style={{ background: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'flex-start', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Trophy size={20} color="#b45309" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>{t.name}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', fontSize: '0.8375rem', color: '#64748b', marginBottom: t.description ? '0.5rem' : 0 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {t.date}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {t.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12} /> {t.registrations.length} inscrit{t.registrations.length > 1 ? 's' : ''}{t.maxPlayers ? ` / ${t.maxPlayers}` : ''}</span>
                        <span style={{ background: t.price ? '#fffbeb' : '#f0fdf4', color: t.price ? '#b45309' : '#166534', padding: '0.1rem 0.5rem', borderRadius: '2rem', fontWeight: 700 }}>{t.price ? `$${t.price}` : 'Gratuit'}</span>
                      </div>
                      {t.description && <p style={{ fontSize: '0.8375rem', color: '#475569', lineHeight: 1.5 }}>{t.description}</p>}
                      {t.registrations.length > 0 && (
                        <div style={{ marginTop: '0.625rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                          {t.registrations.map((r, i) => (
                            <span key={i} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.15rem 0.5rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 600 }}>{r.name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.375rem', flexShrink: 0 }}>
                      <button
                        onClick={() => handleEditTournament(t)}
                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#475569', flexShrink: 0 }}
                        title="Modifier"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTournament(t.id)}
                        style={{ background: '#fef2f2', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: '#dc2626', flexShrink: 0 }}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Rapport ── */}
        {activeTab === 'report' && (() => {
          const reportMembers = [...members].sort((a, b) => Number(a.id) - Number(b.id))
          const totalPassRevenue = reportMembers.reduce((sum, m) => {
            if (m.freePass || !m.seasonPassPaid) return sum
            return sum + (m.seasonPassType === 'resident' ? 40 : 85)
          }, 0)
          const totalTournamentRevenue = tournaments.reduce((sum, t) => {
            if (!t.price) return sum
            return sum + t.price * t.registrations.length
          }, 0)
          const totalRevenue = totalPassRevenue + totalTournamentRevenue

          function fmtDate(iso) {
            if (!iso) return '—'
            const d = new Date(iso)
            return isNaN(d) ? '—' : format(d, 'd MMM yyyy', { locale: fr })
          }

          function exportCSV() {
            const rows = [['Nom', 'Courriel', "Date d'inscription", 'Date paiement passe', 'Statut passe', 'Montant passe', 'Tournois (nom · date paiement · montant)']]
            reportMembers.forEach(m => {
              const regDate = new Date(Number(m.id)).toLocaleDateString('fr-CA')
              const passDate = m.passPaymentDate ? new Date(m.passPaymentDate).toLocaleDateString('fr-CA') : '—'
              const statut = m.freePass ? 'Passe gratuit' : m.seasonPassPaid ? (m.seasonPassType === 'resident' ? 'Résident' : 'Non-résident') : 'Non payé'
              const montant = m.freePass ? '$0' : m.seasonPassPaid ? (m.seasonPassType === 'resident' ? '$40' : '$85') : '—'
              const memberTournaments = tournaments.filter(t => t.registrations.find(r => r.email === m.email))
              const tourStr = memberTournaments.map(t => {
                const reg = t.registrations.find(r => r.email === m.email)
                const regAt = reg?.registeredAt ? new Date(reg.registeredAt).toLocaleDateString('fr-CA') : '—'
                return `${t.name} · ${regAt} · ${t.price ? '$' + t.price : 'Gratuit'}`
              }).join(' | ')
              rows.push([m.name, m.email, regDate, passDate, statut, montant, tourStr])
            })
            const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'rapport-membres.csv'; a.click()
            URL.revokeObjectURL(url)
          }

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {[
                  { label: 'Revenus abonnements', value: `$${totalPassRevenue}`, color: '#7c3aed', bg: '#f5f3ff' },
                  { label: 'Revenus tournois', value: `$${totalTournamentRevenue}`, color: '#b45309', bg: '#fffbeb' },
                  { label: 'Total revenus', value: `$${totalRevenue}`, color: '#166534', bg: '#f0fdf4' },
                ].map(s => (
                  <div key={s.label} style={{ background: s.bg, borderRadius: '1rem', padding: '1.25rem', border: `1px solid ${s.color}22` }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>{s.label}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Members table */}
              <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.125rem' }}>Rapport des membres</h2>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{reportMembers.length} membres inscrits</p>
                  </div>
                  <button onClick={exportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#1B4E8B', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <Download size={15} /> Exporter CSV
                  </button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc' }}>
                        {['#', 'Nom', "Date d'inscription", 'Statut passe', 'Date paiement passe', 'Montant passe', 'Tournois payants'].map(h => (
                          <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportMembers.map((m, i) => {
                        const regDate = fmtDate(new Date(Number(m.id)).toISOString())
                        const passDate = fmtDate(m.passPaymentDate)
                        const amount = m.freePass ? 0 : m.seasonPassPaid ? (m.seasonPassType === 'resident' ? 40 : 85) : null
                        const memberTournaments = tournaments.filter(t => t.price > 0 && t.registrations.find(r => r.email === m.email))
                        return (
                          <tr key={m.id} style={{ borderBottom: i < reportMembers.length - 1 ? '1px solid #f1f5f9' : 'none', verticalAlign: 'top' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#EBF3FB', color: '#1B4E8B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                  {m.name[0].toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{m.name}</div>
                                  <a href={`mailto:${m.email}`} style={{ fontSize: '0.75rem', color: '#1B4E8B', textDecoration: 'none' }}>{m.email}</a>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} color="#94a3b8" />{regDate}</div>
                            </td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              {m.freePass
                                ? <span style={{ background: '#ecfeff', color: '#0891b2', border: '1px solid #a5f3fc', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Gift size={11} /> Gratuit</span>
                                : m.seasonPassPaid
                                ? <span style={{ background: '#f0fdf4', color: '#2E7D32', border: '1px solid #bbf7d0', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={11} />{m.seasonPassType === 'resident' ? 'Résident' : 'Non-résident'}</span>
                                : <span style={{ background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>Non payé</span>
                              }
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                              {m.seasonPassPaid
                                ? <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12} color="#94a3b8" />{passDate}</div>
                                : <span style={{ color: '#cbd5e1' }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>
                              {m.freePass
                                ? <span style={{ color: '#0891b2' }}>$0</span>
                                : amount !== null
                                ? <span style={{ color: '#7c3aed' }}>${amount}</span>
                                : <span style={{ color: '#cbd5e1' }}>—</span>
                              }
                            </td>
                            <td style={{ padding: '0.875rem 1rem', minWidth: 220 }}>
                              {memberTournaments.length === 0
                                ? <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                    {memberTournaments.map(t => {
                                      const reg = t.registrations.find(r => r.email === m.email)
                                      const regAt = fmtDate(reg?.registeredAt)
                                      return (
                                        <div key={t.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.5rem', padding: '0.3rem 0.625rem', fontSize: '0.78rem' }}>
                                          <div style={{ fontWeight: 700, color: '#b45309' }}>{t.name}</div>
                                          <div style={{ color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Calendar size={11} />{regAt}</span>
                                            <span style={{ fontWeight: 800 }}>· ${t.price}</span>
                                          </div>
                                        </div>
                                      )
                                    })}
                                  </div>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                        <td colSpan={5} style={{ padding: '0.875rem 1rem', fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Total abonnements</td>
                        <td style={{ padding: '0.875rem 1rem', fontWeight: 900, fontSize: '1.1rem', color: '#7c3aed' }}>${totalPassRevenue} CAD</td>
                        <td style={{ padding: '0.875rem 1rem' }} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )
        })()}

        {/* ── Tab: Cours ── */}
        {activeTab === 'courses' && (() => {
          function fmtDate(iso) {
            if (!iso) return '—'
            const d = new Date(iso)
            return isNaN(d) ? '—' : format(d, 'd MMM yyyy', { locale: fr })
          }

          const allRegistrations = courses.flatMap(c =>
            (c.registrations || []).map(r => ({ ...r, courseName: c.name, courseDates: c.dates || (c.date ? [c.date] : []), coursePrice: c.price }))
          ).sort((a, b) => new Date(b.registeredAt || 0) - new Date(a.registeredAt || 0))

          function exportCourseCSV() {
            const rows = [['Nom', 'Courriel', 'Cours', 'Séances', 'Date paiement', 'Montant']]
            allRegistrations.forEach(r => {
              const seances = (r.courseDates || []).map(d => new Date(d).toLocaleDateString('fr-CA')).join(' & ')
              const paidAt = r.registeredAt ? new Date(r.registeredAt).toLocaleDateString('fr-CA') : '—'
              rows.push([r.name || '—', r.email || '—', r.courseName, seances, paidAt, r.coursePrice ? `$${r.coursePrice}` : '—'])
            })
            const csv = rows.map(row => row.map(v => `"${v}"`).join(',')).join('\n')
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'rapport-cours.csv'; a.click()
            URL.revokeObjectURL(url)
          }

          const totalCourseRevenue = allRegistrations.reduce((sum, r) => sum + (r.coursePrice || 0), 0)

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                {courses.map(c => (
                  <div key={c.id} style={{ background: '#f0fdf4', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #bbf7d022' }}>
                    <div style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 600, marginBottom: '0.25rem' }}>{c.name}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#166534' }}>{(c.registrations || []).length} <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>/ {c.maxParticipants}</span></div>
                    <div style={{ fontSize: '0.75rem', color: '#4ade80', fontWeight: 700, marginTop: '0.25rem' }}>inscrits</div>
                  </div>
                ))}
                <div style={{ background: '#f5f3ff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #7c3aed22' }}>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.25rem' }}>Revenus cours</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#7c3aed' }}>${totalCourseRevenue}</div>
                </div>
              </div>

              {/* Registrations table */}
              <div style={{ background: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h2 style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', marginBottom: '0.125rem' }}>Inscriptions aux cours</h2>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{allRegistrations.length} inscription{allRegistrations.length !== 1 ? 's' : ''}</p>
                  </div>
                  <button onClick={exportCourseCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#166534', color: '#fff', border: 'none', padding: '0.625rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <Download size={15} /> Exporter CSV
                  </button>
                </div>
                {allRegistrations.length === 0 ? (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                    <GraduationCap size={40} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                    <div style={{ fontWeight: 600 }}>Aucune inscription pour le moment</div>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc' }}>
                          {['#', 'Nom', 'Courriel', 'Cours', 'Séances', 'Date paiement', 'Montant'].map(h => (
                            <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allRegistrations.map((r, i) => (
                          <tr key={i}
                            style={{ borderBottom: i < allRegistrations.length - 1 ? '1px solid #f1f5f9' : 'none', verticalAlign: 'top' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                            <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', flexShrink: 0 }}>
                                  {(r.name || '?')[0].toUpperCase()}
                                </div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{r.name || '—'}</div>
                              </div>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                              <a href={`mailto:${r.email}`} style={{ fontSize: '0.82rem', color: '#1B4E8B', textDecoration: 'none' }}>{r.email || '—'}</a>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{r.courseName}</td>
                            <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                {(r.courseDates || []).map((d, idx) => (
                                  <span key={d} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '0.375rem', padding: '0.15rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                                    Séance {idx + 1} · {fmtDate(d)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.85rem', color: '#475569', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <Calendar size={12} color="#94a3b8" />
                                {fmtDate(r.registeredAt)}
                              </div>
                            </td>
                            <td style={{ padding: '0.875rem 1rem', fontWeight: 800, fontSize: '1rem', color: '#7c3aed', whiteSpace: 'nowrap' }}>
                              {r.coursePrice ? `$${r.coursePrice}` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                          <td colSpan={6} style={{ padding: '0.875rem 1rem', fontWeight: 800, color: '#0f172a', fontSize: '0.9rem' }}>Total cours</td>
                          <td style={{ padding: '0.875rem 1rem', fontWeight: 900, fontSize: '1.1rem', color: '#7c3aed' }}>${totalCourseRevenue} CAD</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )
        })()}

      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-tabs-container { -ms-overflow-style: none; scrollbar-width: none; }
        .admin-tabs-container::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
