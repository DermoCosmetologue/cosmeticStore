import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { readJsonStorage, removeStorageItem, writeJsonStorage } from '../../shared/utils/storage'
import { CartContext } from './cartContextValue'

export type CartItem = {
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

export type CartContextType = {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  setCartItems: (items: CartItem[]) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
  isWholesaleOrder: boolean
  remainingForWholesale: number
  itemsBelowWholesaleMinimum: CartItem[]
  getItemUnitPrice: (item: CartItem) => number
}

const WHOLESALE_MIN_TOTAL_QUANTITY = 50
const WHOLESALE_MIN_PRODUCT_QUANTITY = 6

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

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity))
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id)
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + amount } : p
        )
      }
      return [...prev, { ...item, quantity: amount }]
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
  const itemsBelowWholesaleMinimum = useMemo(
    () => items.filter((item) => item.quantity < WHOLESALE_MIN_PRODUCT_QUANTITY),
    [items],
  )
  const isWholesaleOrder = totalItems >= WHOLESALE_MIN_TOTAL_QUANTITY && itemsBelowWholesaleMinimum.length === 0
  const getItemUnitPrice = useCallback((item: CartItem) => {
    if (isWholesaleOrder && item.isWholesaleEnabled && item.wholesalePrice != null) return item.wholesalePrice
    return item.retailPrice ?? item.price
  }, [isWholesaleOrder])
  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * getItemUnitPrice(item), 0),
    [getItemUnitPrice, items],
  )
  const remainingForWholesale = Math.max(0, WHOLESALE_MIN_TOTAL_QUANTITY - totalItems)
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
      isWholesaleOrder,
      remainingForWholesale,
      itemsBelowWholesaleMinimum,
      getItemUnitPrice,
    }),
    [addToCart, clearCart, getItemUnitPrice, isWholesaleOrder, items, itemsBelowWholesaleMinimum, remainingForWholesale, removeFromCart, setCartItems, totalItems, totalPrice, updateQuantity],
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
