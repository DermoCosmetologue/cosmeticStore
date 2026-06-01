import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useWishlist } from '../context/useWishlist'

export default function WishlistPage() {
  const { addToCart } = useCart()
  const { items, removeFromWishlist, clearWishlist, totalItems } = useWishlist()

  if (items.length === 0) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Favoris</span>
        <h1>Votre wishlist est vide.</h1>
        <p>Gardez vos produits preferes ici pour les retrouver plus tard.</p>
        <Link to="/catalog" className="btn-primary">Decouvrir les produits</Link>
      </section>
    )
  }

  return (
    <section className="container wishlist-page">
      <div className="page-heading compact">
        <span className="eyebrow">Favoris</span>
        <h1>Ma wishlist</h1>
        <p>{totalItems} produit(s) mis de cote.</p>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <div className="cart-row wishlist-row" key={item.id}>
              <Link to={`/product/${item.slug}`}>
                <img src={item.thumbnail || '/placeholder.png'} alt={item.name} />
              </Link>
              <div className="cart-row-info">
                <Link to={`/product/${item.slug}`}>
                  <h3>{item.name}</h3>
                </Link>
                {item.short_description && <span>{item.short_description}</span>}
                <p>{item.price.toLocaleString('fr-FR')} FCFA</p>
              </div>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  addToCart({
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    slug: item.slug,
                    thumbnail: item.thumbnail,
                  })
                }
              >
                Ajouter au panier
              </button>
              <button type="button" className="btn-text danger" onClick={() => removeFromWishlist(item.id)}>
                Retirer
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <span className="eyebrow">Wishlist</span>
          <div className="summary-line">
            <span>Produits favoris</span>
            <strong>{totalItems}</strong>
          </div>
          <Link to="/catalog" className="btn-primary">Continuer vos achats</Link>
          <button type="button" className="btn-text" onClick={clearWishlist}>Vider la wishlist</button>
        </aside>
      </div>
    </section>
  )
}
