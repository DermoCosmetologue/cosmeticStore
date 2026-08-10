import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import ProductGrid from '../components/products/ProductGrid'
import { applyProductBadges, fetchProductEngagementStats } from '../services/productEngagement'

type Product = {
  id: string
  category_id: string
  category_name: string
  name: string
  slug: string
  short_description: string | null
  price: number
  wholesale_price?: number | null
  wholesale_min_quantity?: number | null
  is_wholesale_enabled?: boolean | null
  thumbnail: string | null
  image_urls: string[]
  is_featured: boolean
  badge_label?: string | null
}

type ProductImage = {
  image_url: string | null
  sort_order: number | null
}

type ProductRow = {
  id: string
  category_id: string
  categories: { name: string } | { name: string }[] | null
  name: string
  slug: string
  short_description: string | null
  price: number
  wholesale_price?: number | null
  wholesale_min_quantity?: number | null
  is_wholesale_enabled?: boolean | null
  is_featured: boolean
  product_images?: ProductImage[] | null
}

function getCategoryName(categories: ProductRow['categories']) {
  const category = Array.isArray(categories) ? categories[0] : categories
  return category?.name || 'Sans categorie'
}

function getProductImageUrls(images?: ProductImage[] | null) {
  return [...(images ?? [])]
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((image) => image.image_url)
    .filter(Boolean) as string[]
}

function mapProductRow(row: ProductRow): Product {
  const imageUrls = getProductImageUrls(row.product_images)

  return {
    id: row.id,
    category_id: row.category_id,
    category_name: getCategoryName(row.categories),
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    price: Number(row.price || 0),
    wholesale_price: row.wholesale_price != null ? Number(row.wholesale_price) : null,
    wholesale_min_quantity: row.wholesale_min_quantity != null ? Number(row.wholesale_min_quantity) : null,
    is_wholesale_enabled: Boolean(row.is_wholesale_enabled),
    thumbnail: imageUrls[0] || null,
    image_urls: imageUrls,
    is_featured: Boolean(row.is_featured),
  }
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'
type DisplayMode = 'retail' | 'wholesale'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortOption, setSortOption] = useState<SortOption>('featured')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('retail')

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, category_id, name, slug, short_description, price, wholesale_price, wholesale_min_quantity, is_wholesale_enabled, is_featured, categories(name), product_images(image_url, sort_order)')
        .eq('is_active', true)

      if (!error && data) {
        const mappedProducts = (data as unknown as ProductRow[]).map(mapProductRow)
        const statsMap = await fetchProductEngagementStats(mappedProducts.map((product) => product.id))
        setProducts(applyProductBadges(mappedProducts, statsMap))
      }
      setLoading(false)
    }

    void fetchProducts()
  }, [])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [searchParams])

  const selectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: categoryId })
    }
  }

  const categories = useMemo(() => {
    const categoryMap = new Map<string, string>()

    products.forEach((product) => {
      if (product.category_id && product.category_name) {
        categoryMap.set(product.category_id, product.category_name)
      }
    })

    return Array.from(categoryMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [products])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const priceLimit = Number(maxPrice)

    const nextProducts = products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'all' || product.category_id === selectedCategory
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.short_description?.toLowerCase().includes(normalizedSearch) ||
        product.category_name.toLowerCase().includes(normalizedSearch)
      const matchesPrice = !priceLimit || Number(product.price || 0) <= priceLimit

      return matchesCategory && matchesSearch && matchesPrice
    })

    return [...nextProducts].sort((a, b) => {
      if (sortOption === 'price-asc') return Number(a.price) - Number(b.price)
      if (sortOption === 'price-desc') return Number(b.price) - Number(a.price)
      if (sortOption === 'name') return a.name.localeCompare(b.name, 'fr')
      return 0
    })
  }, [maxPrice, products, searchTerm, selectedCategory, sortOption])

  const groupedProducts = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        products: filteredProducts.filter((product) => product.category_id === category.id),
      }))
      .filter((category) => category.products.length > 0)
  }, [categories, filteredProducts])

  const resetFilters = () => {
    selectCategory('all')
    setSearchTerm('')
    setMaxPrice('')
    setSortOption('featured')
  }

  const activeCategoryName =
    selectedCategory === 'all'
      ? 'Toutes les categories'
      : categories.find((category) => category.id === selectedCategory)?.name || 'Categorie'

  return (
    <section className="container catalog-page">
      <div className="page-heading">
        <span className="eyebrow">Boutique</span>
        <h1>Catalogue beaute</h1>
        <p>Des essentiels selectionnes pour construire une routine soignee, sensorielle et efficace.</p>
      </div>

      <div className="catalog-mode-switch" aria-label="Choisir l'espace boutique ou gros">
        <button
          type="button"
          className={displayMode === 'retail' ? 'active' : ''}
          onClick={() => setDisplayMode('retail')}
        >
          Boutique
        </button>
        <button
          type="button"
          className={displayMode === 'wholesale' ? 'active' : ''}
          onClick={() => setDisplayMode('wholesale')}
        >
          Vente en gros
        </button>
      </div>

      <div className={`catalog-mode-banner ${displayMode === 'wholesale' ? 'wholesale' : 'retail'}`}>
        {displayMode === 'wholesale' ? (
          <>
            <span className="eyebrow">Espace grossiste</span>
            <strong>Les prix de gros sont automatiquement appliqués dès 50 pièces dans le panier.</strong>
          </>
        ) : (
          <>
            <span className="eyebrow">Espace boutique</span>
            <strong>À partir de 50 pièces, la commande bascule automatiquement aux prix de gros.</strong>
          </>
        )}
      </div>

      <div className="catalog-filter-panel">
        <label>
          Rechercher
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Nom, routine, categorie..."
          />
        </label>

        <label>
          Categorie
          <select value={selectedCategory} onChange={(event) => selectCategory(event.target.value)}>
            <option value="all">Toutes les categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Prix maximum
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
            placeholder="Ex: 25000"
          />
        </label>

        <label>
          Trier
          <select value={sortOption} onChange={(event) => setSortOption(event.target.value as SortOption)}>
            <option value="featured">Selection boutique</option>
            <option value="price-asc">Prix croissant</option>
            <option value="price-desc">Prix decroissant</option>
            <option value="name">Nom A-Z</option>
          </select>
        </label>

        <button type="button" className="btn-secondary" onClick={resetFilters}>
          Reinitialiser
        </button>
      </div>

      <div className="catalog-category-tabs" aria-label="Filtrer par categorie">
        <button
          type="button"
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => selectCategory('all')}
        >
          Toutes
        </button>
        {categories.map((category) => (
          <button
            type="button"
            key={category.id}
            className={selectedCategory === category.id ? 'active' : ''}
            onClick={() => selectCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-card">Chargement des produits...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-state inline">
          <span className="eyebrow">{activeCategoryName}</span>
          <h2>Aucun produit trouve</h2>
          <p>Ajustez les filtres pour retrouver une selection plus large.</p>
          <button type="button" className="btn-primary" onClick={resetFilters}>
            Voir tout le catalogue
          </button>
        </div>
      ) : selectedCategory === 'all' ? (
        <div className="catalog-category-sections">
          {groupedProducts.map((category) => (
            <section className="catalog-category-section" key={category.id}>
              <div className="catalog-category-heading">
                <div>
                  <span className="eyebrow">Categorie</span>
                  <h2>{category.name}</h2>
                </div>
                <span>{category.products.length} produit(s)</span>
              </div>
              <ProductGrid products={category.products} displayMode={displayMode} />
            </section>
          ))}
        </div>
      ) : (
        <div className="catalog-category-section">
          <div className="catalog-category-heading">
            <div>
              <span className="eyebrow">Categorie</span>
              <h2>{activeCategoryName}</h2>
            </div>
            <span>{filteredProducts.length} produit(s)</span>
          </div>
          <ProductGrid products={filteredProducts} displayMode={displayMode} />
        </div>
      )}
    </section>
  )
}
