import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

export default function InstallPWA() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      setIsInstalled(true)
      return
    }

    // Detect iOS
    const iOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(iOS)

    // Android Chrome install prompt
    const handler = e => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // For iOS or if no prompt after 5s, show instructions banner
    const timer = setTimeout(() => {
      if (iOS && !isInstalled) {
        setShow(true)
      }
    }, 5000)

    // Don't show again if dismissed
    const dismissed = localStorage.getItem('pwa_dismissed')
    if (dismissed) setShow(false)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null)
        setShow(false)
      })
    }
  }

  function handleDismiss() {
    setShow(false)
    localStorage.setItem('pwa_dismissed', '1')
  }

  if (isInstalled || !show) return null

  return (
    <div style={{
      position: 'fixed', bottom: '1rem', left: '1rem', right: '1rem',
      zIndex: 9999, maxWidth: 400, margin: '0 auto',
    }}>
      <div style={{
        background: '#fff', borderRadius: '1rem', padding: '1rem 1.25rem',
        boxShadow: '0 8px 40px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <div style={{ width: 40, height: 40, borderRadius: '0.75rem', background: 'linear-gradient(135deg, #1B4E8B, #2563A8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Download size={20} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
            Installez l'application
          </div>
          {isIOS ? (
            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
              Appuyez sur <strong>Partager</strong> <span style={{ fontSize: '1rem' }}>⎋</span> puis <strong>"Sur l'écran d'accueil"</strong> pour utiliser le site comme une app.
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5 }}>
              Ajoutez Pickleball Donnacona à votre écran d'accueil pour un accès rapide comme une application.
            </div>
          )}
          {!isIOS && deferredPrompt && (
            <button onClick={handleInstall}
              style={{ marginTop: '0.625rem', background: '#1B4E8B', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.625rem', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              <Smartphone size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Installer
            </button>
          )}
          {isIOS && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
              1. Appuyez sur <strong>Partager</strong> en bas <br />
              2. Faites défiler et choisissez <strong>"Sur l'écran d'accueil"</strong><br />
              3. Appuyez sur <strong>"Ajouter"</strong>
            </div>
          )}
        </div>
        <button onClick={handleDismiss}
          style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0, marginTop: '0.125rem' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}