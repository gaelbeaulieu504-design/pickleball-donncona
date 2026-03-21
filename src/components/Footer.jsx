import { NavLink } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{
      background: '#0D2044',
      color: '#94a3b8',
      paddingTop: '3.5rem',
      paddingBottom: '2rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          paddingBottom: '2.5rem',
          borderBottom: '1px solid #1e3a6e',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <img src="/logo.png" alt="Pickleball Donnacona" style={{ height: 48, width: 'auto' }} />
            </div>
            <p style={{ fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 260 }}>
              L'installation de pickleball de référence à Donnacona. 4 terrains extérieurs, ouverts aux résidents et aux visiteurs.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {[Facebook, Instagram].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, background: '#1e3a6e', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', transition: 'background 0.2s, color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1B4E8B'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#1e3a6e'; e.currentTarget.style.color = '#94a3b8' }}
                ><Icon size={17} /></a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Liens rapides</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {[
                { to: '/', label: 'Accueil' },
                { to: '/book', label: 'Réserver un terrain' },
                { to: '/pricing', label: 'Tarifs' },
                { to: '/about', label: 'Nos terrains' },
                { to: '/contact', label: 'Contact' },
              ].map(l => (
                <li key={l.to}>
                  <NavLink to={l.to} style={{ fontSize: '0.9rem', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#A8D5E8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >{l.label}</NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Heures d'ouverture</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                <span>Lundi – Dimanche</span>
                <span style={{ color: '#A8D5E8', fontWeight: 600 }}>6h00 – 22h00</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: '#f1f5f9', fontWeight: 700, marginBottom: '1rem', fontSize: '0.9375rem' }}>Contact</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
                <MapPin size={16} style={{ flexShrink: 0, color: '#A8D5E8', marginTop: 3 }} />
                <span>Donnacona, Québec,<br />Canada</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Phone size={16} style={{ flexShrink: 0, color: '#A8D5E8' }} />
                <a href="tel:+14185551234" style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#A8D5E8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >(418) 555-1234</a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Mail size={16} style={{ flexShrink: 0, color: '#A8D5E8' }} />
                <a href="mailto:info@pickleballdonnacona.ca" style={{ transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#A8D5E8'}
                  onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                >info@pickleballdonnacona.ca</a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem', fontSize: '0.85rem' }}>
          <p>© {new Date().getFullYear()} Pickleball Donnacona. Tous droits réservés.</p>
          <p>Fait avec ❤️ à Donnacona, Québec</p>
        </div>
      </div>
    </footer>
  )
}
