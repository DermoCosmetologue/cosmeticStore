import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useCart } from '../context/useCart'

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

  if (loading) return <p>Chargement...</p>

  if (!product) {
    return (
      <section>
        <h1>Produit introuvable</h1>
        <Link to="/catalog">Retour au catalogue</Link>
      </section>
    )
  }

  return (
    <section className="product-details">
      <img src={product.thumbnail || '/placeholder.png'} alt={product.name} />
      <div>
        <h1>{product.name}</h1>
        <p>{product.description || product.short_description}</p>
        <strong>{product.price} FCFA</strong>
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
      </div>
    </section>
  )
}
