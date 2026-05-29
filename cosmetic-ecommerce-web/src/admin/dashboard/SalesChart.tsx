import type { SalesPoint } from '../hooks/useDashboardStats'

export default function SalesChart({ data }: { data: SalesPoint[] }) {
  const maxSales = Math.max(...data.map((point) => point.sales), 1)

  return (
    <section className="dashboard-panel">
      <div className="admin-table-heading">
        <div>
          <span>Ventes</span>
          <h2>Evolution sur 14 jours</h2>
        </div>
      </div>

      <div className="sales-chart" aria-label="Graphique des ventes">
        {data.map((point) => (
          <div className="sales-chart-column" key={point.label}>
            <span>{point.sales > 0 ? `${Math.round(point.sales / 1000)}k` : ''}</span>
            <div style={{ height: `${Math.max((point.sales / maxSales) * 100, point.sales > 0 ? 8 : 2)}%` }} />
            <small>{point.label}</small>
          </div>
        ))}
      </div>
    </section>
  )
}
