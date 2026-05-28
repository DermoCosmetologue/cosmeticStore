import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import ProductGrid from '../components/products/ProductGrid'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('storefront_products')
        .select('*')
        .eq('is_active', true)

      if (!error && data) {
        setProducts(data as Product[])
      }
      setLoading(false)
    }

    fetchProducts()
  }, [])

  if (loading) return <p>Chargement...</p>

  return (
    <div>
      <h2>Catalogue</h2>
      <ProductGrid products={products} />
    </div>
  )
}
