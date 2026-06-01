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
  const descriptionParagraphs = detailDescription
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

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
        {descriptionParagraphs.length > 0 && (
          <div className="product-description-panel">
            <span className="eyebrow">Description</span>
            {descriptionParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
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
