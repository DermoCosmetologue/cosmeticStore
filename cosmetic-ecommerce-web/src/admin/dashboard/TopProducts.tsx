import type { TopProduct } from '../hooks/useDashboardStats'

export default function TopProducts({ products }: { products: TopProduct[] }) {
  const maxQuantity = Math.max(...products.map((product) => product.quantity), 1)

  return (
    <section className="dashboard-panel">
      <div className="admin-table-heading">
        <div>
          <span>Produits</span>
          <h2>Top ventes</h2>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="admin-empty-state">Aucun produit vendu sur la periode.</p>
      ) : (
        <div className="top-products-list">
          {products.map((product) => (
            <div className="top-product-row" key={product.productId}>
              <div>
                <strong>{product.name}</strong>
                <span>{product.quantity} unite(s)</span>
              </div>
              <div className="top-product-bar">
                <span style={{ width: `${(product.quantity / maxQuantity) * 100}%` }} />
              </div>
              <strong>{product.revenue.toLocaleString('fr-FR')} FCFA</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
