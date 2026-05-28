import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import CartItemRow from '../components/CartItemRow'

export default function CartPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <section>
        <h1>Mon panier</h1>
        <p>Votre panier est vide.</p>
        <Link to="/catalog">Continuer vos achats</Link>
      </section>
    )
  }

  return (
    <section>
      <h1>Mon panier</h1>
      <p>{totalItems} article(s)</p>

      <div className="cart-list">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>

      <div className="cart-summary">
        <h3>Total : {totalPrice} FCFA</h3>
        <div className="cart-actions">
          <button onClick={clearCart}>Vider le panier</button>
          <Link to="/checkout" className="btn-primary">Passer à la caisse</Link>
        </div>
      </div>
    </section>
  )
}
