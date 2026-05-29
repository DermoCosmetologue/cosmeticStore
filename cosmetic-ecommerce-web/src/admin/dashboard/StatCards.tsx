type DashboardStats = {
  revenue: number
  orders: number
  paidOrders: number
  activeCustomers: number
  productsCount: number
  conversionRate: number
  averageOrderValue: number
}

export default function StatCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      label: 'Ventes payees',
      value: `${stats.revenue.toLocaleString('fr-FR')} FCFA`,
      hint: `${stats.paidOrders} commande(s) encaissee(s)`,
    },
    {
      label: 'Commandes',
      value: stats.orders.toLocaleString('fr-FR'),
      hint: '30 derniers jours',
    },
    {
      label: 'Clients actifs',
      value: stats.activeCustomers.toLocaleString('fr-FR'),
      hint: 'Clients ayant commande',
    },
    {
      label: 'Panier moyen',
      value: `${stats.averageOrderValue.toLocaleString('fr-FR')} FCFA`,
      hint: `${stats.conversionRate}% de commandes payees`,
    },
  ]

  return (
    <div className="admin-stats-grid dashboard-stats-grid">
      {cards.map((card) => (
        <div key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.hint}</small>
        </div>
      ))}
    </div>
  )
}
