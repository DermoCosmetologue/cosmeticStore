import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart'

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

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`}>
        <img src={product.thumbnail || '/placeholder.png'} alt={product.name} />
        <h3>{product.name}</h3>
        <p>{product.short_description}</p>
        <strong>{product.price} FCFA</strong>
      </Link>

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
  )
}
