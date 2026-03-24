import { useState, useEffect, useRef } from 'react'
import { CreditCard, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react'

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

export default function PaymentStep({ amount, description, onSuccess, onBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [payError, setPayError] = useState('')
  const containerRef = useRef(null)
  const buttonsRendered = useRef(false)

  useEffect(() => {
    // Remove any existing PayPal script
    const existing = document.getElementById('paypal-sdk')
    if (existing) existing.remove()
    if (window.paypal) delete window.paypal

    const script = document.createElement('script')
    script.id = 'paypal-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${CLIENT_ID}&currency=CAD`
    script.async = true

    script.onload = () => {
      setLoading(false)
      if (!window.paypal || !containerRef.current || buttonsRendered.current) return
      buttonsRendered.current = true

      window.paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', height: 48 },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              description,
              amount: { currency_code: 'CAD', value: Number(amount).toFixed(2) },
            }],
          })
        },
        onApprove: async (data, actions) => {
          setProcessing(true)
          setPayError('')
          try {
            const details = await actions.order.capture()
            setProcessing(false)
            onSuccess({
              transactionId: details.id,
              payerName: details.payer?.name?.given_name,
              payerEmail: details.payer?.email_address,
              status: details.status,
            })
          } catch {
            setProcessing(false)
            setPayError('Le paiement a échoué. Veuillez réessayer.')
          }
        },
        onError: (err) => {
          setProcessing(false)
          setPayError('Une erreur est survenue. Veuillez réessayer.')
          console.error('PayPal error:', err)
        },
        onCancel: () => {
          setProcessing(false)
        },
      }).render(containerRef.current)
    }

    script.onerror = () => {
      setLoading(false)
      setError(true)
    }

    document.body.appendChild(script)

    return () => {
      buttonsRendered.current = false
    }
  }, [amount, description])

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <ShieldCheck size={17} color="#166534" />
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>Paiement sécurisé</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
          Choisissez votre méthode de paiement — PayPal ou carte de crédit/débit.
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

      {/* Error from payment */}
      {payError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#dc2626', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {payError}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Chargement de PayPal…
        </div>
      )}

      {/* SDK load error */}
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '1.25rem', marginBottom: '1.25rem', textAlign: 'center' }}>
          <AlertCircle size={24} color="#dc2626" style={{ margin: '0 auto 0.5rem', display: 'block' }} />
          <p style={{ color: '#dc2626', fontWeight: 700, marginBottom: '0.375rem' }}>Impossible de charger PayPal</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>Vérifiez votre connexion et réessayez.</p>
          <button type="button" onClick={() => window.location.reload()}
            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1.25rem', cursor: 'pointer', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <RefreshCw size={15} /> Réessayer
          </button>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Traitement du paiement…
        </div>
      )}

      {/* Popup blocker warning */}
      {!loading && !error && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.75rem', padding: '0.625rem 1rem', marginBottom: '1rem', fontSize: '0.8125rem', color: '#92400e', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span>⚠️</span>
          <span>Si la fenêtre PayPal ne s'ouvre pas, <strong>autorisez les popups</strong> pour pickleballdonnacona.ca dans votre navigateur.</span>
        </div>
      )}

      {/* PayPal buttons container */}
      <div ref={containerRef} style={{ display: processing ? 'none' : 'block' }} />

      {/* Footer */}
      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} disabled={processing} style={{ opacity: processing ? 0.5 : 1 }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#22c55e" />
          <CreditCard size={14} color="#94a3b8" />
          Paiement sécurisé par PayPal
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
