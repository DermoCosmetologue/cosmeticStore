import { useCart } from '../context/useCart'
import QuantitySelector from './QuantitySelector'

type CartItem = {
  id: string
  name: string
  price: number
  retailPrice?: number
  wholesalePrice?: number | null
  isWholesaleEnabled?: boolean
  slug: string
  thumbnail: string | null
  quantity: number
  salesMode?: 'retail' | 'wholesale'
}

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart, isWholesaleOrder, getItemUnitPrice } = useCart()
  const formattedPrice = `${getItemUnitPrice(item).toLocaleString('fr-FR')} FCFA`
  const modeLabel = isWholesaleOrder && item.isWholesaleEnabled ? 'Vente en gros' : 'Prix normal'

  return (
    <div className="cart-row">
      <img src={item.thumbnail || '/placeholder.png'} alt={item.name} />
      <div className="cart-row-info">
        <h3>{item.name}</h3>
        <p>{formattedPrice}</p>
        <span className={`cart-item-mode ${isWholesaleOrder && item.isWholesaleEnabled ? 'wholesale' : 'retail'}`}>
          {modeLabel}
        </span>
      </div>

      <QuantitySelector
        quantity={item.quantity}
        onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
        onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
      />

      <button className="btn-text danger" onClick={() => removeFromCart(item.id)}>
        Supprimer
      </button>
    </div>
  )
}
