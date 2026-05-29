import { useEffect, useMemo, useState } from 'react'
import StockTable from './StockTable'
import {
  fetchInventoryProducts,
  updateProductStock,
  type InventoryProduct,
} from './inventoryService'

type StockFilter = 'all' | 'available' | 'low' | 'out'

export default function InventoryPage() {
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [stockDrafts, setStockDrafts] = useState<Record<string, number>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadProducts = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const data = await fetchInventoryProducts()
      setProducts(data ?? [])
      setStockDrafts(
        Object.fromEntries((data ?? []).map((product) => [product.id, Number(product.stock || 0)])),
      )
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de charger le stock.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  const stats = useMemo(() => {
    const totalStock = products.reduce((total, product) => total + Number(product.stock || 0), 0)
    const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 5).length
    const outOfStock = products.filter((product) => product.stock === 0).length

    return { totalStock, lowStock, outOfStock }
  }, [products])

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return products.filter((product) => {
      const draftStock = stockDrafts[product.id] ?? Number(product.stock || 0)
      const matchesQuery =
        !query ||
        [product.name, product.slug, product.sku]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query)

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'available' && draftStock > 5) ||
        (stockFilter === 'low' && draftStock > 0 && draftStock <= 5) ||
        (stockFilter === 'out' && draftStock === 0)

      return matchesQuery && matchesStock
    })
  }, [products, searchTerm, stockDrafts, stockFilter])

  const handleDraftChange = (productId: string, stock: number) => {
    setStockDrafts((current) => ({
      ...current,
      [productId]: Math.max(0, Math.floor(stock)),
    }))
  }

  const handleAdjust = (productId: string, delta: number) => {
    setStockDrafts((current) => ({
      ...current,
      [productId]: Math.max(0, Number(current[productId] || 0) + delta),
    }))
  }

  const handleSave = async (productId: string) => {
    try {
      setSavingId(productId)
      setErrorMessage('')
      setSuccessMessage('')
      const stock = stockDrafts[productId] ?? 0
      await updateProductStock(productId, stock)
      setProducts((current) =>
        current.map((product) => (product.id === productId ? { ...product, stock } : product)),
      )
      setSuccessMessage('Stock mis a jour.')
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de sauvegarder le stock.')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Inventaire</span>
          <h1>Gestion de stock</h1>
          <p>Ajustez les quantites disponibles et reperez rapidement les ruptures.</p>
        </div>
      </div>

      {errorMessage && <p className="admin-alert">{errorMessage}</p>}
      {successMessage && <p className="auth-notice success">{successMessage}</p>}

      <div className="admin-stats-grid">
        <div>
          <span>Unites en stock</span>
          <strong>{stats.totalStock}</strong>
        </div>
        <div>
          <span>Stock bas</span>
          <strong>{stats.lowStock}</strong>
        </div>
        <div>
          <span>Ruptures</span>
          <strong>{stats.outOfStock}</strong>
        </div>
      </div>

      <div className="admin-filter-panel inventory-filter-panel">
        <label>
          Recherche
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Produit, SKU, slug..."
          />
        </label>
        <label>
          Etat stock
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as StockFilter)}>
            <option value="all">Tous</option>
            <option value="available">Disponible</option>
            <option value="low">Stock bas</option>
            <option value="out">Rupture</option>
          </select>
        </label>
        <button type="button" className="admin-secondary-button" onClick={() => void loadProducts()}>
          Actualiser
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-heading">
          <div>
            <span>Produits</span>
            <h2>{filteredProducts.length} produit(s)</h2>
          </div>
        </div>

        {loading ? (
          <p className="admin-empty-state">Chargement du stock...</p>
        ) : (
          <StockTable
            products={filteredProducts}
            stockDrafts={stockDrafts}
            savingId={savingId}
            onDraftChange={handleDraftChange}
            onAdjust={handleAdjust}
            onSave={(productId) => void handleSave(productId)}
          />
        )}
      </div>
    </section>
  )
}
