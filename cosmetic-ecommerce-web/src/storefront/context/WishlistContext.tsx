import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { WishlistContext } from './wishlistContextValue'

export type WishlistItem = {
  id: string
  name: string
  price: number
  slug: string
  thumbnail: string | null
  short_description?: string | null
}

export type WishlistContextType = {
  items: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (id: string) => void
  toggleWishlist: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
  totalItems: number
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('wishlist')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items))
  }, [items])

  const addToWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((existingItem) => existingItem.id === item.id)) return prev
      return [...prev, item]
    })
  }

  const removeFromWishlist = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) =>
      prev.some((existingItem) => existingItem.id === item.id)
        ? prev.filter((existingItem) => existingItem.id !== item.id)
        : [...prev, item]
    )
  }

  const isInWishlist = (id: string) => items.some((item) => item.id === id)

  const clearWishlist = () => {
    localStorage.removeItem('wishlist')
    setItems([])
  }

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
        totalItems: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
