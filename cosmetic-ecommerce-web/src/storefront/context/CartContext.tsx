import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { readJsonStorage, removeStorageItem, writeJsonStorage } from '../../shared/utils/storage'
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

function isCartItems(value: unknown): value is CartItem[] {
  return Array.isArray(value)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const notificationTimer = useRef<number | null>(null)
  const [items, setItems] = useState<CartItem[]>(() => readJsonStorage('cart', [], isCartItems))
  const [addedProductName, setAddedProductName] = useState('')

  useEffect(() => {
    writeJsonStorage('cart', items)
  }, [items])

  useEffect(() => {
    return () => {
      if (notificationTimer.current) {
        window.clearTimeout(notificationTimer.current)
      }
    }
  }, [])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
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
  }, [])

  const setCartItems = useCallback((nextItems: CartItem[]) => setItems(nextItems), [])

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(id)
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    removeStorageItem('cart')
    setItems([])
  }, [])

  const totalItems = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items])
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [items],
  )
  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      setCartItems,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice,
    }),
    [addToCart, clearCart, items, removeFromCart, setCartItems, totalItems, totalPrice, updateQuantity],
  )

  return (
    <CartContext.Provider value={contextValue}>
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
