import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  description?: string | null
  price: number
  thumbnail: string | null
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

export default function ProductDetailsPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('storefront_products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (!error && data) {
        setProduct(data as Product)
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

  return (
    <section className="container product-details">
      <div className="product-detail-media">
        <img src={product.thumbnail || '/placeholder.png'} alt={product.name} />
      </div>
      <div className="product-detail-copy">
        <span className="eyebrow">Produit premium</span>
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
              })
            }
          >
            Ajouter au panier
          </button>
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
