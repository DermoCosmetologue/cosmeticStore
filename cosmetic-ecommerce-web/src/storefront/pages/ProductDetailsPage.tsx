import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'
import { applyProductBadges, fetchProductEngagementStats } from '../services/productEngagement'
import QuantitySelector from '../components/QuantitySelector'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  description?: string | null
  price: number
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
  name: string
  slug: string
  short_description: string | null
  description: string | null
  price: number
  is_featured: boolean
  product_images?: ProductImage[] | null
}

type DescriptionBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'image'; alt: string; src: string }

function parseDescriptionBlocks(description: string): DescriptionBlock[] {
  return description
    .split(/\n+/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const imageMatch = block.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)

      if (imageMatch) {
        return {
          type: 'image',
          alt: imageMatch[1] || 'Image description produit',
          src: imageMatch[2],
        }
      }

      return { type: 'paragraph', content: block }
    })
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
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    description: row.description,
    price: Number(row.price || 0),
    thumbnail: imageUrls[0] || null,
    image_urls: imageUrls,
    is_featured: Boolean(row.is_featured),
  }
}

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, slug, short_description, description, price, is_featured, product_images(image_url, sort_order)')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle()

      if (!error && data) {
        const mappedProduct = mapProductRow(data as unknown as ProductRow)
        const statsMap = await fetchProductEngagementStats([mappedProduct.id])
        setProduct(applyProductBadges([mappedProduct], statsMap)[0])
        setActiveImageIndex(0)
        setSelectedQuantity(1)
      }
      setLoading(false)
    }

    fetchProduct()
  }, [slug])

  if (loading) {
    return <div className="container loading-card">Chargement du produit...</div>
  }

  if (!product) {
    return (
      <section className="container empty-state">
        <h1>Produit introuvable</h1>
        <Link to="/catalog" className="btn-primary">Retour au catalogue</Link>
      </section>
    )
  }

  const isFavorite = isInWishlist(product.id)
  const detailDescription = product.description?.trim() || product.short_description?.trim() || ''
  const descriptionBlocks = parseDescriptionBlocks(detailDescription)
  const displayImages = product.image_urls.length > 0 ? product.image_urls : ['/placeholder.png']
  const activeImage = displayImages[activeImageIndex] || displayImages[0]

  return (
    <section className="container product-details">
      <div className={`product-detail-media ${displayImages.length > 1 ? 'has-thumbnails' : ''}`}>
        {displayImages.length > 1 && (
          <div className="product-detail-thumbnails" aria-label="Images du produit">
            {displayImages.map((imageUrl, index) => (
              <button
                type="button"
                key={`${imageUrl}-${index}`}
                className={index === activeImageIndex ? 'active' : ''}
                aria-label={`Afficher l'image ${index + 1}`}
                aria-current={index === activeImageIndex}
                onClick={() => setActiveImageIndex(index)}
              >
                <img src={imageUrl} alt={`${product.name} miniature ${index + 1}`} />
              </button>
            ))}
          </div>
        )}
        <div className="product-detail-main-image">
          <img src={activeImage} alt={product.name} />
        </div>
      </div>
      <div className="product-detail-copy">
        {product.badge_label && <span className="eyebrow">{product.badge_label}</span>}
        <h1>{product.name}</h1>
        {product.short_description && (
          <p className="product-detail-lead">{product.short_description}</p>
        )}
        <div className="product-detail-price-row">
          <span>Prix boutique</span>
          <strong>{product.price.toLocaleString('fr-FR')} FCFA</strong>
        </div>
        {descriptionBlocks.length > 0 && (
          <div className="product-description-panel">
            <span className="eyebrow">Description</span>
            {descriptionBlocks.map((block, index) => (
              block.type === 'image' ? (
                <img
                  className="product-description-image"
                  key={`${block.src}-${index}`}
                  src={block.src}
                  alt={block.alt}
                  loading="lazy"
                />
              ) : (
                <p key={index}>{block.content}</p>
              )
            ))}
          </div>
        )}
        <div className="product-detail-actions">
          <button
            className="btn-primary"
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                slug: product.slug,
                thumbnail: product.thumbnail,
              }, selectedQuantity)
            }
          >
            Ajouter {selectedQuantity} au panier
          </button>
          <QuantitySelector
            quantity={selectedQuantity}
            onDecrease={() => setSelectedQuantity((quantity) => Math.max(1, quantity - 1))}
            onIncrease={() => setSelectedQuantity((quantity) => quantity + 1)}
          />
          <button
            type="button"
            className="btn-secondary"
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
            {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          </button>
        </div>
      </div>
    </section>
  )
}
