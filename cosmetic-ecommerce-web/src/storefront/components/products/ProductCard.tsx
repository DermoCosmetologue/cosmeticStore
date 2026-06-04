import { useEffect, useMemo, useState } from 'react'
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
  image_urls?: (string | null)[] | null
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const formattedPrice = `${product.price.toLocaleString('fr-FR')} FCFA`
  const isFavorite = isInWishlist(product.id)
  const description = product.short_description?.trim()
  const [isPreviewingImages, setIsPreviewingImages] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const displayImages = useMemo(() => {
    const productImages = Array.from(
      new Set([product.thumbnail, ...(product.image_urls ?? [])].filter(Boolean) as string[]),
    )

    return productImages.length > 0 ? productImages : ['/placeholder.png']
  }, [product.image_urls, product.thumbnail])

  useEffect(() => {
    if (!isPreviewingImages || displayImages.length <= 1) {
      setActiveImageIndex(0)
      return
    }

    const intervalId = window.setInterval(() => {
      setActiveImageIndex((currentIndex) => (currentIndex + 1) % displayImages.length)
    }, 900)

    return () => window.clearInterval(intervalId)
  }, [displayImages.length, isPreviewingImages])

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div
          className={`product-image-wrap ${displayImages.length > 1 ? 'has-gallery' : ''}`}
          onMouseEnter={() => setIsPreviewingImages(true)}
          onMouseLeave={() => setIsPreviewingImages(false)}
          onFocus={() => setIsPreviewingImages(true)}
          onBlur={() => setIsPreviewingImages(false)}
        >
          {displayImages.map((imageUrl, index) => (
            <img
              key={`${imageUrl}-${index}`}
              className={index === activeImageIndex ? 'active' : ''}
              src={imageUrl}
              alt={index === 0 ? product.name : `${product.name} image ${index + 1}`}
            />
          ))}
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
