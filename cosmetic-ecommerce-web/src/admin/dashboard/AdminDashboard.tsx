import OrdersChart from './OrdersChart'
import SalesChart from './SalesChart'
import StatCards from './StatCards'
import TopProducts from './TopProducts'
import { useDashboardStats } from '../hooks/useDashboardStats'

export default function AdminDashboard() {
  const { loading, errorMessage, stats, salesByDay, topProducts } = useDashboardStats()

  return (
    <section className="admin-page dashboard-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Analytics</span>
          <h1>Dashboard</h1>
          <p>Vue globale des ventes, commandes, clients actifs et produits performants.</p>
        </div>
      </div>

      {errorMessage && <p className="admin-alert">{errorMessage}</p>}

      {loading ? (
        <p className="admin-empty-state">Chargement des analytics...</p>
      ) : (
        <>
          <StatCards stats={stats} />

          <div className="dashboard-grid">
            <SalesChart data={salesByDay} />
            <OrdersChart data={salesByDay} />
          </div>

          <div className="dashboard-grid wide">
            <TopProducts products={topProducts} />
            <section className="dashboard-panel dashboard-global">
              <div className="admin-table-heading">
                <div>
                  <span>Global</span>
                  <h2>Performance boutique</h2>
                </div>
              </div>

              <div className="global-performance-list">
                <div>
                  <span>Catalogue</span>
                  <strong>{stats.productsCount} produit(s)</strong>
                </div>
                <div>
                  <span>Taux encaissement</span>
                  <strong>{stats.conversionRate}%</strong>
                </div>
                <div>
                  <span>Revenu moyen / commande payee</span>
                  <strong>{stats.averageOrderValue.toLocaleString('fr-FR')} FCFA</strong>
                </div>
              </div>
            </section>
          </div>
        </>
      )}
    </section>
  )
}
