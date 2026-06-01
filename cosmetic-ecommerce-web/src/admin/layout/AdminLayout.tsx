import { Link, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/homepage">Page d'accueil</Link>
          <Link to="/admin/categories">Categories</Link>
          <Link to="/admin/products">Produits</Link>
          <Link to="/admin/inventory">Stock</Link>
          <Link to="/admin/orders">Commandes</Link>
        </nav>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
