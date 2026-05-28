import { Link, Outlet } from 'react-router-dom'
import { useCart } from '../context/useCart'

export default function MainLayout() {
  const { totalItems } = useCart()

  return (
    <div>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo">CosmeticStore</Link>
          <nav className="nav">
            <Link to="/">Accueil</Link>
            <Link to="/catalog">Produits</Link>
            <Link to="/cart">Panier ({totalItems})</Link>
          </nav>
        </div>
      </header>

      <main className="container main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <p>© 2026 CosmeticStore</p>
        </div>
      </footer>
    </div>
  )
}
