import { useState } from 'react'
import { PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer, FUNDING } from '@paypal/react-paypal-js'
import { CreditCard, Wallet, AlertCircle, ShieldCheck } from 'lucide-react'

const CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID

export default function PaymentStep({ amount, description, onSuccess, onBack }) {
  const isConfigured = CLIENT_ID && CLIENT_ID !== 'YOUR_PAYPAL_CLIENT_ID_HERE'
  if (!isConfigured) {
    return <DemoPayment amount={amount} description={description} onSuccess={onSuccess} onBack={onBack} />
  }
  return (
    <PayPalScriptProvider options={{
      'client-id': CLIENT_ID,
      currency: 'CAD',
      components: 'buttons',
      'enable-funding': 'card',
      'disable-funding': 'paylater',
    }}>
      <PaymentInner amount={amount} description={description} onSuccess={onSuccess} onBack={onBack} />
    </PayPalScriptProvider>
  )
}

function PaymentInner({ amount, description, onSuccess, onBack }) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer()
  const [payError, setPayError] = useState('')
  const [processing, setProcessing] = useState(false)

  const isConfigured = CLIENT_ID && CLIENT_ID !== 'YOUR_PAYPAL_CLIENT_ID_HERE'

  function createOrder(data, actions) {
    return actions.order.create({
      purchase_units: [{
        description,
        amount: {
          currency_code: 'CAD',
          value: amount.toFixed(2),
        },
      }],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
      },
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
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
            Paiement sécurisé
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
          Choisissez votre méthode de paiement. Vous pouvez payer avec PayPal (avec ou sans compte) ou directement par carte de crédit/débit.
        </p>
      </div>

      {/* Amount summary */}
      <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total à payer</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.1 }}>${amount} CAD</div>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#bbf7d0', textAlign: 'right' }}>
          Passe saisonnier<br />Été 2026
        </div>
      </div>

      {payError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.75rem', padding: '0.875rem 1rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#dc2626', fontSize: '0.9rem' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} /> {payError}
        </div>
      )}

      {processing && (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#166534', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
          Traitement du paiement…
        </div>
      )}

      {!processing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* PayPal button */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <Wallet size={15} color="#64748b" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PayPal</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>— avec ou sans compte</span>
            </div>
            {(isPending || isRejected) ? (
              <div style={{ height: 48, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                {isRejected ? 'Erreur de chargement PayPal' : 'Chargement…'}
              </div>
            ) : (
              <PayPalButtons
                fundingSource={FUNDING.PAYPAL}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                style={{ layout: 'horizontal', height: 48, tagline: false, shape: 'rect' }}
              />
            )}
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 600 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          </div>

          {/* Card button */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
              <CreditCard size={15} color="#64748b" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Carte de crédit / débit</span>
            </div>
            {!isPending && !isRejected && (
              <PayPalButtons
                fundingSource={FUNDING.CARD}
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                style={{ layout: 'horizontal', height: 48, tagline: false, shape: 'rect', label: 'pay' }}
              />
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={onBack} disabled={processing} style={{ opacity: processing ? 0.5 : 1 }}>
          ← Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#22c55e" />
          Paiement sécurisé par PayPal
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Shown when PayPal client ID is not yet configured
function DemoPayment({ amount, description, onSuccess, onBack }) {
  const [method, setMethod] = useState(null)
  const [processing, setProcessing] = useState(false)

  function simulatePay() {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      onSuccess({
        transactionId: 'DEMO-' + Date.now(),
        payerName: 'Utilisateur test',
        status: 'COMPLETED',
        demo: true,
      })
    }, 1500)
  }

  return (
    <div>
      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <AlertCircle size={18} color="#b45309" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.6 }}>
          <strong>Configuration requise :</strong> Pour activer les vrais paiements PayPal, ajoutez votre <code style={{ background: '#fef9c3', padding: '0.125rem 0.375rem', borderRadius: 3, fontFamily: 'monospace' }}>VITE_PAYPAL_CLIENT_ID</code> dans le fichier <code style={{ background: '#fef9c3', padding: '0.125rem 0.375rem', borderRadius: 3, fontFamily: 'monospace' }}>.env</code>. Obtenez-le sur{' '}
          <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" style={{ color: '#b45309', fontWeight: 700 }}>developer.paypal.com</a>.
        </div>
      </div>

      {/* Amount */}
      <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', color: '#fff', borderRadius: '0.875rem', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.8125rem', color: '#86efac', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total à payer</div>
          <div style={{ fontWeight: 900, fontSize: '2rem', lineHeight: 1.1 }}>${amount} CAD</div>
        </div>
        <div style={{ fontSize: '0.875rem', color: '#bbf7d0', textAlign: 'right' }}>Passe saisonnier<br />Été 2026</div>
      </div>

      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>Sélectionnez une méthode de paiement :</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { id: 'paypal', icon: '🅿️', label: 'PayPal', desc: 'Avec ou sans compte PayPal' },
          { id: 'card', icon: '💳', label: 'Carte de crédit / débit', desc: 'Visa, Mastercard, Interac' },
        ].map(opt => (
          <button key={opt.id} onClick={() => setMethod(opt.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', borderRadius: '0.875rem', border: method === opt.id ? '2px solid #166534' : '2px solid #e2e8f0', background: method === opt.id ? '#f0fdf4' : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}>
            <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
            <div>
              <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>{opt.label}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b' }}>{opt.desc}</div>
            </div>
            {method === opt.id && <ShieldCheck size={18} color="#166534" style={{ marginLeft: 'auto' }} />}
          </button>
        ))}
      </div>

      <button className="btn-primary" disabled={!method || processing} onClick={simulatePay}
        style={{ width: '100%', opacity: (!method || processing) ? 0.5 : 1, cursor: (!method || processing) ? 'not-allowed' : 'pointer', fontSize: '1.0625rem', padding: '1rem' }}>
        {processing ? (
          <><span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Traitement…</>
        ) : (
          <><CreditCard size={18} /> Payer ${amount} CAD (démo)</>
        )}
      </button>

      <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button className="btn-secondary" onClick={onBack} style={{ padding: '0.625rem 1.25rem', fontSize: '0.9rem' }}>← Retour</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#94a3b8' }}>
          <ShieldCheck size={14} color="#22c55e" /> Paiement sécurisé par PayPal
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
