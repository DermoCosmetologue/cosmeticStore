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
  const formattedPrice = `${product.price.toLocaleString('fr-FR')} FCFA`

  return (
    <div className="product-card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-image-wrap">
          <img src={product.thumbnail || '/placeholder.png'} alt={product.name} />
          <span className="product-pill">Premium</span>
        </div>
        <div className="product-card-body">
          <h3>{product.name}</h3>
          {product.short_description && <p>{product.short_description}</p>}
          <strong>{formattedPrice}</strong>
        </div>
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
