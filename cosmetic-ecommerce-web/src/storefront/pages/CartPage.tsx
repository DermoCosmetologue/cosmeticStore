import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import CartItemRow from '../components/CartItemRow'

export default function CartPage() {
  const { items, totalPrice, totalItems, clearCart, isWholesaleOrder, remainingForWholesale } = useCart()
  const formattedTotal = `${totalPrice.toLocaleString('fr-FR')} FCFA`

  if (items.length === 0) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Panier</span>
        <h1>Votre panier est vide.</h1>
        <p>Ajoutez vos favoris beauté et retrouvez-les ici avant le checkout.</p>
        <Link to="/catalog" className="btn-primary">Continuer vos achats</Link>
      </section>
    )
  }

  return (
    <section className="container cart-page">
      <div className="page-heading compact">
        <span className="eyebrow">Panier</span>
        <h1>Mon panier</h1>
        <p>{totalItems} article(s) dans votre sélection.</p>
      </div>

      <div className={`cart-order-banner ${isWholesaleOrder ? 'wholesale' : 'retail'}`}>
        {isWholesaleOrder ? (
          <>
            <span className="eyebrow">Commande grossiste</span>
            <strong>Votre commande atteint 50 pieces ou plus : les prix de gros sont appliques automatiquement.</strong>
          </>
        ) : (
          <>
            <span className="eyebrow">Commande boutique</span>
            <strong>Ajoutez encore {remainingForWholesale} piece(s) pour profiter automatiquement des prix de gros.</strong>
          </>
        )}
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        <aside className="cart-summary">
          <span className="eyebrow">Résumé</span>
          <div className="summary-line">
            <span>{isWholesaleOrder ? 'Total grossiste' : 'Sous-total'}</span>
            <strong>{formattedTotal}</strong>
          </div>
          <div className="summary-line muted">
            <span>Livraison</span>
            <span>Calculée au checkout</span>
          </div>
          <Link to="/checkout" className="btn-primary">Passer à la caisse</Link>
          <button className="btn-text" onClick={clearCart}>Vider le panier</button>
        </aside>
      </div>
    </section>
  )
}
