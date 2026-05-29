import { useState, useEffect, useRef } from 'react'
import { ShieldCheck, AlertCircle, CreditCard } from 'lucide-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

export default function PaymentStep({ amount, description, onSuccess, onBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const stripeRef = useRef(null)
  const elementsRef = useRef(null)
  const mountRef = useRef(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      // Load Stripe.js
      if (!window.Stripe) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://js.stripe.com/v3/'
          script.async = true
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      if (!mounted) return
      stripeRef.current = window.Stripe(PUBLISHABLE_KEY)

      // Create payment intent
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, description }),
      })
      const data = await res.json()
      if (!mounted) return
      if (data.error) throw new Error(data.error)

      // Mount Stripe Elements
      elementsRef.current = stripeRef.current.elements({
        clientSecret: data.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#166534',
            colorBackground: '#ffffff',
            colorText: '#0f172a',
            colorDanger: '#dc2626',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
        locale: 'fr-CA',
      })

      const paymentElement = elementsRef.current.create('payment')
      paymentElement.mount(mountRef.current)
      paymentElement.on('ready', () => { if (mounted) setLoading(false) })
    }

    init().catch(err => {
      if (mounted) {
        setError('Impossible de charger le paiement. Vérifiez votre connexion.')
        setLoading(false)
        console.error(err)
      }
    })

    return () => { mounted = false }
  }, [amount, description])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!stripeRef.current || !elementsRef.current || processing) return
    setProcessing(true)
    setError('')

    const { error, paymentIntent } = await stripeRef.current.confirmPayment({
      elements: elementsRef.current,
      redirect: 'if_required',
    })

    if (error) {
      setError(error.message)
      setProcessing(false)
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess({
        transactionId: paymentIntent.id,
        status: 'COMPLETED',
        provider: 'stripe',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <ShieldCheck size={17} color="#166534" />
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>Paiement sécurisé</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
          Entrez vos informations de paiement — carte de crédit, débit ou autres méthodes.
        </p>
      </div>

      {/* Amount card */}
      <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total à payer</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.1 }}>${amount} CAD</div>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#bbf7d0', textAlign: 'right' }}>Passe saisonnier<br />Été 2026</div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#dc2626', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Chargement du paiement…
        </div>
      )}

      {/* Stripe Elements container */}
      <div ref={mountRef} style={{ marginBottom: '1.5rem', minHeight: loading ? 0 : 'auto' }} />

      {/* Processing */}
      {processing && (
        <div style={{ textAlign: 'center', padding: '1rem', color: '#64748b', marginBottom: '1rem' }}>
          <div style={{ width: 28, height: 28, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.5rem' }} />
          Traitement du paiement…
        </div>
      )}

      {/* Submit button */}
      {!loading && (
        <button type="submit" disabled={processing}
          style={{ width: '100%', background: processing ? '#94a3b8' : 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', border: 'none', borderRadius: '0.875rem', padding: '1rem', fontSize: '1.0625rem', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <CreditCard size={20} />
          {processing ? 'Traitement…' : `Payer $${amount} CAD`}
        </button>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} disabled={processing} style={{ opacity: processing ? 0.5 : 1 }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#22c55e" /> Paiement sécurisé par Stripe
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  )
}
