import type { InventoryProduct } from './inventoryService'

type StockTableProps = {
  products: InventoryProduct[]
  stockDrafts: Record<string, number>
  savingId: string | null
  onDraftChange: (productId: string, stock: number) => void
  onAdjust: (productId: string, delta: number) => void
  onSave: (productId: string) => void
}

function getCategoryName(product: InventoryProduct) {
  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories
  return category?.name || 'Sans categorie'
}

function getThumbnail(product: InventoryProduct) {
  return [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url
}

function getStockState(stock: number) {
  if (stock === 0) return { className: 'danger', label: 'Rupture' }
  if (stock <= 5) return { className: 'warning', label: 'Stock bas' }
  return { className: 'active', label: 'Disponible' }
}

export default function StockTable({
  products,
  stockDrafts,
  savingId,
  onDraftChange,
  onAdjust,
  onSave,
}: StockTableProps) {
  if (products.length === 0) {
    return <p className="admin-empty-state">Aucun produit ne correspond aux filtres.</p>
  }

  return (
    <div className="admin-table inventory-table">
      {products.map((product) => {
        const draftStock = stockDrafts[product.id] ?? Number(product.stock || 0)
        const stockState = getStockState(draftStock)
        const hasChanges = draftStock !== Number(product.stock || 0)

        return (
          <article className="inventory-row" key={product.id}>
            <div className="inventory-product">
              <img src={getThumbnail(product) || '/placeholder.png'} alt={product.name} />
              <div>
                <strong>{product.name}</strong>
                <span>{getCategoryName(product)}</span>
                <span>{product.sku || product.slug}</span>
              </div>
            </div>

            <span className={`admin-status ${stockState.className}`}>{stockState.label}</span>

            <div className="inventory-stock-control">
              <button type="button" onClick={() => onAdjust(product.id, -1)} disabled={draftStock <= 0}>
                -
              </button>
              <input
                type="number"
                min="0"
                value={draftStock}
                onChange={(e) => onDraftChange(product.id, Number(e.target.value || 0))}
              />
              <button type="button" onClick={() => onAdjust(product.id, 1)}>
                +
              </button>
            </div>

            <strong>{Number(product.price || 0).toLocaleString('fr-FR')} FCFA</strong>

            <button
              type="button"
              className="admin-primary-button"
              disabled={!hasChanges || savingId === product.id}
              onClick={() => onSave(product.id)}
            >
              {savingId === product.id ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </article>
        )
      })}
    </div>
  )
}
