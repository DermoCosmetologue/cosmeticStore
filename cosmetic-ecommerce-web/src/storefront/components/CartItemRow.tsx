import { useCart } from '../context/useCart'
import QuantitySelector from './QuantitySelector'

type CartItem = {
  id: string
  name: string
  price: number
  slug: string
  thumbnail: string | null
  quantity: number
}

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeFromCart } = useCart()
  const formattedPrice = `${item.price.toLocaleString('fr-FR')} FCFA`

  return (
    <div className="cart-row">
      <img src={item.thumbnail || '/placeholder.png'} alt={item.name} />
      <div className="cart-row-info">
        <h3>{item.name}</h3>
        <p>{formattedPrice}</p>
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
