import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CartContext } from './cartContextValue'

export type CartItem = {
  id: string
  name: string
  price: number
  slug: string
  thumbnail: string | null
  quantity: number
}

export type CartContextType = {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  setCartItems: (items: CartItem[]) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

export function CartProvider({ children }: { children: ReactNode }) {
  const notificationTimer = useRef<number | null>(null)
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart')
    return saved ? JSON.parse(saved) : []
  })
  const [addedProductName, setAddedProductName] = useState('')

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        window.clearTimeout(notificationTimer.current)
      }
    }
  }, [])

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })

    setAddedProductName(item.name)

    if (notificationTimer.current) {
      window.clearTimeout(notificationTimer.current)
    }

    notificationTimer.current = window.setTimeout(() => {
      setAddedProductName('')
    }, 3500)
  }

  const setCartItems = (nextItems: CartItem[]) => setItems(nextItems)

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    localStorage.removeItem('cart')
    setItems([])
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0)

  return (
    <CartContext.Provider
      value={{ items, addToCart, setCartItems, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
      {addedProductName && (
        <div className="cart-toast" role="status" aria-live="polite">
          <div>
            <strong>Produit ajoute au panier</strong>
            <span>{addedProductName}</span>
          </div>
          <Link to="/cart">Voir le panier</Link>
        </div>
      )}
    </CartContext.Provider>
  )
}
