import { useState, useEffect } from 'react'
import { Trophy, Calendar, MapPin, Users, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { format, parseISO, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import PaymentStep from '../components/PaymentStep'

export default function Tournaments() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [registering, setRegistering] = useState(null)
  const [registerResult, setRegisterResult] = useState({})
  // payingTournament = { id, price, name } when showing payment modal
  const [payingTournament, setPayingTournament] = useState(null)

  useEffect(() => {
    fetch('/api/tournaments')
      .then(r => r.json())
      .then(data => { setTournaments(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleRegister(tournamentId) {
    if (!user) return
    const tournament = tournaments.find(t => t.id === tournamentId)
    if (!tournament) return

    // If paid tournament, show payment form first
    if (tournament.price && Number(tournament.price) > 0) {
      setPayingTournament({ id: tournamentId, price: tournament.price, name: tournament.name })
      return
    }

    // Free tournament — register directly
    await doRegister(tournamentId)
  }

  async function doRegister(tournamentId) {
    setRegistering(tournamentId)
    setRegisterResult(r => ({ ...r, [tournamentId]: null }))
    try {
      const res = await fetch('/api/tournament-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournamentId, userName: user.name, userEmail: user.email }),
      })
      const data = await res.json()
      if (data.success) {
        setRegisterResult(r => ({ ...r, [tournamentId]: { ok: true } }))
        setTournaments(ts => ts.map(t => t.id === tournamentId ? data.tournament : t))
      } else {
        setRegisterResult(r => ({ ...r, [tournamentId]: { error: data.error } }))
      }
    } catch {
      setRegisterResult(r => ({ ...r, [tournamentId]: { error: 'Erreur réseau' } }))
    }
    setRegistering(null)
  }

  async function handlePaymentSuccess(tournamentId) {
    setPayingTournament(null)
    await doRegister(tournamentId)
  }

  const upcoming = tournaments.filter(t => !isPast(parseISO(t.date + 'T23:59:59')))
  const past = tournaments.filter(t => isPast(parseISO(t.date + 'T23:59:59')))

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '2.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '1rem', background: 'linear-gradient(135deg, #b45309, #d97706)', marginBottom: '1rem', boxShadow: '0 4px 20px rgba(180,83,9,0.25)' }}>
          <Trophy size={30} color="#fff" />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>Tournois</h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>Inscrivez-vous aux tournois de pickleball de Donnacona</p>
      </div>

      {/* Payment modal overlay */}
      {payingTournament && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2rem', width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', margin: 'auto' }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="#b45309" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a' }}>Paiement — {payingTournament.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Frais d'inscription : ${payingTournament.price} CAD</div>
              </div>
            </div>
            <PaymentStep
              amount={payingTournament.price}
              description={`Inscription au tournoi : ${payingTournament.name}`}
              label={`Tournoi — ${payingTournament.name}`}
              onSuccess={() => handlePaymentSuccess(payingTournament.id)}
              onBack={() => setPayingTournament(null)}
            />
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>Chargement…</div>
      ) : upcoming.length === 0 && past.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#f8fafc', borderRadius: '1.5rem', border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🏆</div>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.625rem' }}>Aucun tournoi prévu</h2>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', maxWidth: 380, margin: '0 auto', lineHeight: 1.6 }}>
            Il n'y a présentement aucun tournoi envisagé à l'horizon. Revenez plus tard ou suivez-nous pour rester informé !
          </p>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="#b45309" /> Tournois à venir
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {upcoming.map(t => <TournamentCard key={t.id} tournament={t} user={user} expanded={expanded} setExpanded={setExpanded} onRegister={handleRegister} registering={registering} result={registerResult[t.id]} />)}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#64748b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={18} color="#94a3b8" /> Tournois passés
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7 }}>
                {past.map(t => <TournamentCard key={t.id} tournament={t} user={user} expanded={expanded} setExpanded={setExpanded} onRegister={null} registering={null} result={null} isPast />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function TournamentCard({ tournament: t, user, expanded, setExpanded, onRegister, registering, result, isPast }) {
  const isExpanded = expanded === t.id
  const alreadyRegistered = user && t.registrations.find(r => r.email === user.email)
  const isFull = t.maxPlayers && t.registrations.length >= t.maxPlayers
  const spotsLeft = t.maxPlayers ? t.maxPlayers - t.registrations.length : null
  const isPaid = t.price && Number(t.price) > 0

  let dateStr = t.date
  try { dateStr = format(parseISO(t.date), 'EEEE d MMMM yyyy', { locale: fr }) } catch {}

  return (
    <div style={{ background: '#fff', borderRadius: '1.125rem', border: `1.5px solid ${isExpanded ? '#b45309' : '#e2e8f0'}`, overflow: 'hidden', boxShadow: isExpanded ? '0 4px 24px rgba(180,83,9,0.1)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 0.2s' }}>
      <button
        onClick={() => setExpanded(isExpanded ? null : t.id)}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <div style={{ width: 48, height: 48, borderRadius: '0.75rem', background: isPast ? '#f1f5f9' : 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Trophy size={22} color={isPast ? '#94a3b8' : '#b45309'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '1.0625rem', color: '#0f172a', marginBottom: '0.25rem' }}>{t.name}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {dateStr}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {t.location}</span>
            {t.maxPlayers && <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Users size={13} /> {t.registrations.length}/{t.maxPlayers} inscrits</span>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          {isPaid && !isPast && <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CreditCard size={11} /> ${t.price}</span>}
          {alreadyRegistered && <span style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>Inscrit ✓</span>}
          {isFull && !alreadyRegistered && <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '0.2rem 0.625rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: 700 }}>Complet</span>}
          {isExpanded ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
        </div>
      </button>

      {isExpanded && (
        <div style={{ borderTop: '1px solid #f1f5f9', padding: '1.25rem 1.5rem' }}>
          {t.description && (
            <p style={{ color: '#475569', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{t.description}</p>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Frais : </span>
              <span style={{ fontWeight: 700, color: isPaid ? '#b45309' : '#166534' }}>{isPaid ? `$${t.price} CAD` : 'Gratuit'}</span>
            </div>
            {t.maxPlayers && (
              <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
                <span style={{ color: '#94a3b8', fontWeight: 600 }}>Places restantes : </span>
                <span style={{ fontWeight: 700, color: spotsLeft === 0 ? '#dc2626' : spotsLeft <= 3 ? '#b45309' : '#166534' }}>{spotsLeft}</span>
              </div>
            )}
            <div style={{ background: '#f8fafc', borderRadius: '0.625rem', padding: '0.625rem 1rem', fontSize: '0.875rem' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600 }}>Inscrits : </span>
              <span style={{ fontWeight: 700, color: '#0f172a' }}>{t.registrations.length}</span>
            </div>
          </div>

          {t.registrations.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Participants</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                {t.registrations.map((r, i) => (
                  <span key={i} style={{ background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.75rem', borderRadius: '2rem', fontSize: '0.8125rem', fontWeight: 600 }}>{r.name}</span>
                ))}
              </div>
            </div>
          )}

          {!isPast && (
            <>
              {result?.ok && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#166534', fontWeight: 600, marginBottom: '1rem' }}>
                  <CheckCircle size={16} /> Vous êtes inscrit ! Un email a été envoyé à l'administrateur.
                </div>
              )}
              {result?.error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#dc2626', fontWeight: 600, marginBottom: '1rem' }}>
                  <AlertCircle size={16} /> {result.error}
                </div>
              )}
              {!user ? (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.875rem 1rem', color: '#78350f', fontSize: '0.9rem' }}>
                  Vous devez être <a href="/login" style={{ color: '#b45309', fontWeight: 700 }}>connecté</a> pour vous inscrire.
                </div>
              ) : alreadyRegistered ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '0.9375rem' }}>
                  <CheckCircle size={18} /> Vous êtes inscrit à ce tournoi
                </div>
              ) : isFull ? (
                <div style={{ color: '#dc2626', fontWeight: 600 }}>Ce tournoi est complet.</div>
              ) : (
                <button
                  onClick={() => onRegister(t.id)}
                  disabled={registering === t.id}
                  style={{ background: isPaid ? 'linear-gradient(135deg, #92400e, #b45309)' : 'linear-gradient(135deg, #b45309, #d97706)', color: '#fff', border: 'none', padding: '0.875rem 2rem', borderRadius: '0.75rem', fontWeight: 700, fontSize: '1rem', cursor: registering === t.id ? 'not-allowed' : 'pointer', opacity: registering === t.id ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isPaid ? <CreditCard size={16} /> : <Trophy size={16} />}
                  {registering === t.id ? 'Inscription…' : isPaid ? `Payer $${t.price} et s'inscrire` : "S'inscrire au tournoi"}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
