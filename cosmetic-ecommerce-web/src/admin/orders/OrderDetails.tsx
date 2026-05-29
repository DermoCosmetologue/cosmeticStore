import type { AdminOrder } from './OrderService'

function getRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default function OrderDetails({ order }: { order: AdminOrder }) {
  const address = getRelation(order.addresses)
  const profile = getRelation(order.profiles)

  return (
    <div className="admin-order-details">
      <div>
        <h3>Client</h3>
        <p>{address?.full_name || profile?.full_name || 'Client'}</p>
        <span>{address?.phone || profile?.phone || 'Telephone non renseigne'}</span>
      </div>

      <div>
        <h3>Livraison</h3>
        <p>{address?.address_line1 || 'Adresse non renseignee'}</p>
        <span>
          {[address?.district, address?.city, address?.country].filter(Boolean).join(', ')}
        </span>
      </div>

      <div className="admin-order-items">
        <h3>Articles</h3>
        {(order.order_items ?? []).map((item) => (
          <div className="admin-order-item" key={item.id}>
            <span>{item.product_name}</span>
            <span>x{item.quantity}</span>
            <strong>{Number(item.line_total || 0).toLocaleString('fr-FR')} FCFA</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
