import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'
import { useWishlist } from '../../context/useWishlist'
import QuantitySelector from '../QuantitySelector'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  wholesale_price?: number | null
  wholesale_min_quantity?: number | null
  is_wholesale_enabled?: boolean | null
  thumbnail: string | null
  image_urls?: (string | null)[] | null
  badge_label?: string | null
}

type DisplayMode = 'retail' | 'wholesale'

export default function ProductCard({ product, displayMode = 'retail' }: { product: Product; displayMode?: DisplayMode }) {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const wholesalePrice = product.is_wholesale_enabled ? Number(product.wholesale_price ?? product.price) : product.price
  const effectivePrice = displayMode === 'wholesale' ? wholesalePrice : product.price
  const formattedPrice = `${effectivePrice.toLocaleString('fr-FR')} FCFA`
  const minQtyText = product.wholesale_min_quantity && product.wholesale_min_quantity > 0
    ? `À partir de ${product.wholesale_min_quantity} unités`
    : 'Quantité sur devis'
  const priceLabel = displayMode === 'wholesale'
    ? (product.is_wholesale_enabled ? 'Prix gros' : 'Boutique uniquement')
    : 'Prix boutique'
  const isFavorite = isInWishlist(product.id)
  const description = product.short_description?.trim()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const displayImages = useMemo(() => {
    const productImages = Array.from(
      new Set([product.thumbnail, ...(product.image_urls ?? [])].filter(Boolean) as string[]),
    )

    return productImages.length > 0 ? productImages : ['/placeholder.png']
  }, [product.image_urls, product.thumbnail])
  const hasGallery = displayImages.length > 1
  const activeImage = displayImages[activeImageIndex] || displayImages[0]

  const showPreviousImage = () => {
    setActiveImageIndex((currentIndex) =>
      currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1,
    )
  }

  const showNextImage = () => {
    setActiveImageIndex((currentIndex) => (currentIndex + 1) % displayImages.length)
  }

  return (
    <div className="product-card">
      <div className={`product-image-wrap ${hasGallery ? 'has-gallery' : ''}`}>
        <Link to={`/product/${product.slug}`} className="product-image-link" aria-label={`Voir ${product.name}`}>
          <img src={activeImage} alt={activeImageIndex === 0 ? product.name : `${product.name} image ${activeImageIndex + 1}`} loading="lazy" decoding="async" />
          {product.badge_label && <span className="product-pill">{product.badge_label}</span>}
        </Link>

        {hasGallery && (
          <>
            <button
              type="button"
              className="product-gallery-button previous"
              aria-label="Image precedente"
              onClick={showPreviousImage}
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>
            <button
              type="button"
              className="product-gallery-button next"
              aria-label="Image suivante"
              onClick={showNextImage}
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>

            <div className="product-gallery-dots" aria-label="Images du produit">
              {displayImages.map((imageUrl, index) => (
                <button
                  type="button"
                  key={`${imageUrl}-dot-${index}`}
                  className={index === activeImageIndex ? 'active' : ''}
                  aria-label={`Afficher l'image ${index + 1}`}
                  aria-current={index === activeImageIndex}
                  onClick={() => setActiveImageIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-body">
          <h3>{product.name}</h3>
          {description && <p className="product-card-description">{description}</p>}
          <div className="product-card-meta">
            <span>{priceLabel}</span>
            <strong>{formattedPrice}</strong>
          </div>
          {displayMode === 'retail' && product.is_wholesale_enabled && product.wholesale_price != null && (
            <div className="product-card-wholesale-meta">
              <small>Prix gros dès 50 pièces : {wholesalePrice.toLocaleString('fr-FR')} FCFA</small>
            </div>
          )}
          {displayMode === 'wholesale' && (
            <div className="product-card-wholesale-meta">
              <small>{product.is_wholesale_enabled ? minQtyText : 'Mode boutique'}</small>
            </div>
          )}
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
        <QuantitySelector
          quantity={selectedQuantity}
          onDecrease={() => setSelectedQuantity((quantity) => Math.max(1, quantity - 1))}
          onIncrease={() => setSelectedQuantity((quantity) => quantity + 1)}
        />
        <button
          className="btn-secondary"
          onClick={() =>
            addToCart({
              id: product.id,
              name: product.name,
              price: product.price,
              retailPrice: product.price,
              wholesalePrice: product.is_wholesale_enabled ? wholesalePrice : null,
              isWholesaleEnabled: Boolean(product.is_wholesale_enabled),
              slug: product.slug,
              thumbnail: product.thumbnail,
              salesMode: displayMode,
            }, selectedQuantity)
          }
        >
          Ajouter {selectedQuantity} au panier
        </button>
      </div>
    </div>
  )
}
