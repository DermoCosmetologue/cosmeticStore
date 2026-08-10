import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'
import { useAuth } from '../useAuth'

type NavIconName = 'home' | 'catalog' | 'wishlist' | 'cart' | 'profile' | 'orders' | 'login' | 'logout'

function NavIcon({ name }: { name: NavIconName }) {
  const paths: Record<NavIconName, string[]> = {
    home: [
      'M3 10.5 12 3l9 7.5',
      'M5 10v10h14V10',
      'M9 20v-6h6v6',
    ],
    catalog: [
      'M4 7h16',
      'M6 7l1 13h10l1-13',
      'M9 7a3 3 0 0 1 6 0',
    ],
    wishlist: [
      'M20.8 8.6c0 5.1-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.2Z',
    ],
    cart: [
      'M4 5h2l2 10h9l2-7H7',
      'M9 20h.01',
      'M17 20h.01',
    ],
    profile: [
      'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
      'M4 21a8 8 0 0 1 16 0',
    ],
    orders: [
      'M7 3h10v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z',
      'M9 8h6',
      'M9 12h6',
    ],
    login: [
      'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4',
      'M10 17l5-5-5-5',
      'M15 12H3',
    ],
    logout: [
      'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
      'M16 17l5-5-5-5',
      'M21 12H9',
    ],
  }

  return (
    <svg className="nav-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {paths[name].map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="whatsapp-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.5 11.8A8.5 8.5 0 0 1 8 19.3L3.5 20.5 4.7 16A8.5 8.5 0 1 1 20.5 11.8Z" />
      <path d="M8.8 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c-.1.1-.2.3 0 .6.5.9 1.3 1.7 2.3 2.2.3.2.5.1.6 0l.7-.8c.2-.2.4-.2.7-.1l1.5.7c.3.1.4.3.4.6 0 .6-.5 1.4-1 1.7-.6.4-1.7.5-3.4-.2-2.9-1.2-4.8-4-5-5.8-.1-.8.1-1.4.4-1.8Z" />
    </svg>
  )
}

export default function MainLayout() {
  const { totalItems } = useCart()
  const { totalItems: wishlistItems } = useWishlist()
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const whatsappPhone =
    import.meta.env.VITE_WHATSAPP_PHONE?.replace(/\D/g, '') || '0709969567'
  const whatsappMessage =
    import.meta.env.VITE_WHATSAPP_MESSAGE ||
    'Bonjour, je souhaite avoir des informations sur vos produits.'
  const whatsappUrl = whatsappPhone
    ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
    : ''

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    await signOut()
    closeMenu()
    navigate('/')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-link active' : 'nav-link'

  return (
    <div className="site-shell">
      <header className="header" aria-label="Navigation principale">
        <div className="container header-inner">
          <Link to="/" className="logo logo-brand" aria-label="Dermocosmetologue accueil" onClick={closeMenu}>
            <span className="logo-mark logo-mark-custom">
              <img src="/dermo-logo.svg" alt="Dermocosmetologue" />
            </span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            <span />
            <span />
            <span />
          </button>

          <nav className={`nav ${menuOpen ? 'open' : ''}`}>
            <NavLink to="/" className={navLinkClass} onClick={closeMenu} end>
              <NavIcon name="home" />
              Accueil
            </NavLink>
            <NavLink to="/catalog" className={navLinkClass} onClick={closeMenu}>
              <NavIcon name="catalog" />
              Produits
            </NavLink>
            <NavLink to="/cart" className={navLinkClass} onClick={closeMenu}>
              <NavIcon name="cart" />
              Panier
              <span className="cart-count">{totalItems}</span>
            </NavLink>
            <NavLink to="/wishlist" className={navLinkClass} onClick={closeMenu}>
              <NavIcon name="wishlist" />
              Favoris
              <span className="cart-count">{wishlistItems}</span>
            </NavLink>

            {!loading && (
              user ? (
                <>
                  <NavLink to="/profile" className={navLinkClass} onClick={closeMenu}>
                    <NavIcon name="profile" />
                    Compte
                  </NavLink>
                  <NavLink to="/orders" className={navLinkClass} onClick={closeMenu}>
                    <NavIcon name="orders" />
                    Commandes
                  </NavLink>
                  <button type="button" onClick={handleLogout} className="btn-link">
                    <NavIcon name="logout" />
                    Deconnexion
                  </button>
                </>
              ) : (
                <NavLink to="/auth" className={navLinkClass} onClick={closeMenu}>
                  <NavIcon name="login" />
                  Connexion
                </NavLink>
              )
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          className="whatsapp-float"
          target="_blank"
          rel="noreferrer"
          aria-label="Contacter la boutique sur WhatsApp"
        >
          <WhatsAppIcon />
          <span>WhatsApp</span>
        </a>
      )}

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <p>Beauté premium, sélectionnée avec soin par Dermocosmetologue.</p>
            <p className="footer-signature">Conçu par Yvannti T.I KOUAME - Copyright 2026</p>
          </div>

          <div className="footer-links">
            <Link to="/catalog">Catalogue</Link>
            <Link to="/wishlist">Favoris</Link>
            <Link to="/cart">Panier</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
