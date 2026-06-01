import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useWishlist } from '../../context/useWishlist'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const formattedPrice = `${product.price.toLocaleString('fr-FR')} FCFA`
  const isFavorite = isInWishlist(product.id)
  const description = product.short_description?.trim()

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-image-wrap">
          <img src={product.thumbnail || '/placeholder.png'} alt={product.name} />
          <span className="product-pill">Premium</span>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          {description && <p className="product-card-description">{description}</p>}
          <div className="product-card-meta">
            <span>Disponible boutique</span>
            <strong>{formattedPrice}</strong>
          </div>
        </div>
      </Link>

      <div className="product-card-actions">
        <button
          type="button"
          className={`wishlist-button ${isFavorite ? 'active' : ''}`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          aria-pressed={isFavorite}
          onClick={() =>
            toggleWishlist({
              id: product.id,
              name: product.name,
              price: product.price,
              slug: product.slug,
              thumbnail: product.thumbnail,
              short_description: product.short_description,
            })
          }
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M20.8 8.6c0 5.1-8.8 10.4-8.8 10.4S3.2 13.7 3.2 8.6A4.6 4.6 0 0 1 12 6.4a4.6 4.6 0 0 1 8.8 2.2Z" />
          </svg>
        </button>
        <button
          className="btn-secondary"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              slug: product.slug,
              thumbnail: product.thumbnail,
            })
          }
        >
          Ajouter au panier
        </button>
      </div>
    </div>
  )
}
