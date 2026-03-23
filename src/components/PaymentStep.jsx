import { useState, Component } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer, FUNDING } from '@paypal/react-paypal-js'
import { CreditCard, Wallet, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react'

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

// Empêche PayPal de faire planter toute la page si ça crash
class PayPalBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false } }
  static getDerivedStateFromError() { return { crashed: true } }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <AlertCircle size={36} color="#dc2626" style={{ margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ color: '#dc2626', fontWeight: 700, marginBottom: '0.5rem' }}>Erreur de chargement PayPal</p>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Vérifiez votre connexion Internet et réessayez.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => window.location.reload()}
              style={{ background: '#166534', color: '#fff', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1.5rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <RefreshCw size={16} /> Réessayer
            </button>
            <button type="button" onClick={this.props.onBack}
              style={{ background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '0.625rem', padding: '0.625rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}>
              ← Retour
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function PaymentStep({ amount, description, onSuccess, onBack }) {
  return (
    <PayPalBoundary onBack={onBack}>
      <PayPalScriptProvider options={{
        'client-id': CLIENT_ID,
        currency: 'CAD',
      }}>
        <PaymentInner amount={amount} description={description} onSuccess={onSuccess} onBack={onBack} />
      </PayPalScriptProvider>
    </PayPalBoundary>
  )
}

function PaymentInner({ amount, description, onSuccess, onBack }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [payError, setPayError] = useState('')
  const [processing, setProcessing] = useState(false)

  function createOrder(data, actions) {
    return actions.order.create({
      purchase_units: [{ description, amount: { currency_code: 'CAD', value: String(amount) } }],
      application_context: { shipping_preference: 'NO_SHIPPING' },
    })
  }

  function onApprove(data, actions) {
    setProcessing(true)
    setPayError('')
    return actions.order.capture().then((details) => {
      setProcessing(false)
      onSuccess({
        transactionId: details.id,
        payerName: details.payer?.name?.given_name,
        payerEmail: details.payer?.email_address,
        status: details.status,
      })
    }).catch(() => {
      setProcessing(false)
      setPayError('Le paiement a échoué. Veuillez réessayer.')
    })
  }

  function onError(err) {
    setProcessing(false)
    setPayError('Une erreur est survenue lors du paiement. Veuillez réessayer.')
    console.error('PayPal error:', err)
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.375rem' }}>
          <ShieldCheck size={17} color="#166534" />
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>Paiement sécurisé</span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
          Choisissez votre méthode de paiement — PayPal ou carte de crédit/débit.
        </p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total à payer</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.1 }}>${amount} CAD</div>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#bbf7d0', textAlign: 'right' }}>Passe saisonnier<br />Été 2026</div>
      </div>

      {payError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#dc2626', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {payError}
        </div>
      )}

      {isPending && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Chargement de PayPal…
        </div>
      )}

      {isRejected && (
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

      {processing && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Traitement du paiement…
        </div>
      )}

      {!isPending && !isRejected && !processing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Wallet size={15} color="#64748b" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PayPal</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— avec ou sans compte</span>
            </div>
            <PayPalButtons
              fundingSource={FUNDING.PAYPAL}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              style={{ layout: 'horizontal', height: 48, tagline: false, shape: 'rect' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <CreditCard size={15} color="#64748b" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carte de crédit / débit</span>
            </div>
            <PayPalButtons
              fundingSource={FUNDING.CARD}
              createOrder={createOrder}
              onApprove={onApprove}
              onError={onError}
              style={{ layout: 'horizontal', height: 48, tagline: false, shape: 'rect', label: 'pay' }}
            />
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button type="button" className="btn-secondary" onClick={onBack} disabled={processing} style={{ opacity: processing ? 0.5 : 1 }}>← Retour</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#22c55e" /> Paiement sécurisé par PayPal
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
