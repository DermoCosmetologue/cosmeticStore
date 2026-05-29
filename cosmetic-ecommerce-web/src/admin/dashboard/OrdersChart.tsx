import type { SalesPoint } from '../hooks/useDashboardStats'

export default function OrdersChart({ data }: { data: SalesPoint[] }) {
  const totalOrders = data.reduce((total, point) => total + point.orders, 0)
  const bestDay = [...data].sort((a, b) => b.orders - a.orders)[0]

  return (
    <section className="dashboard-panel dashboard-performance">
      <div className="admin-table-heading">
        <div>
          <span>Performance</span>
          <h2>Activite commandes</h2>
        </div>
      </div>

      <div className="performance-grid">
        <div>
          <span>Commandes payees</span>
          <strong>{totalOrders}</strong>
        </div>
        <div>
          <span>Meilleur jour</span>
          <strong>{bestDay?.label || '-'}</strong>
        </div>
        <div>
          <span>Pic commandes</span>
          <strong>{bestDay?.orders ?? 0}</strong>
        </div>
      </div>
    </section>
  )
}
