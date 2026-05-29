import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useAuth } from '../useAuth'

type NavIconName = 'home' | 'catalog' | 'cart' | 'profile' | 'orders' | 'login' | 'logout'

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

export default function MainLayout() {
  const { totalItems } = useCart()
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

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
          <Link to="/" className="logo" aria-label="CosmeticStore accueil" onClick={closeMenu}>
            <span className="logo-mark">CS</span>
            <span>CosmeticStore</span>
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

      <footer className="footer">
        <div className="container footer-inner">
          <div>
            <Link to="/" className="logo footer-logo">
              <span className="logo-mark">CS</span>
              <span>CosmeticStore</span>
            </Link>
            <p>Beaute premium, selectionnee avec soin.</p>
          </div>

          <div className="footer-links">
            <Link to="/catalog">Catalogue</Link>
            <Link to="/cart">Panier</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
