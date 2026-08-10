import ProductCard from './ProductCard'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
  image_urls?: (string | null)[] | null
  badge_label?: string | null
}

type DisplayMode = 'retail' | 'wholesale'

export default function ProductGrid({
  products,
  displayMode = 'retail',
}: {
  products: Product[]
  displayMode?: DisplayMode
}) {
  if (products.length === 0) {
    return (
      <div className="empty-state inline">
        <h2>Aucun produit disponible</h2>
        <p>La sélection boutique sera bientôt mise à jour.</p>
      </div>
    )
  }

  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} displayMode={displayMode} />
      ))}
    </div>
  )
}
