import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { readJsonStorage, removeStorageItem, writeJsonStorage } from '../../shared/utils/storage'
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

function isWishlistItems(value: unknown): value is WishlistItem[] {
  return Array.isArray(value)
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>(() => {
    return readJsonStorage('wishlist', [], isWishlistItems)
  })

  useEffect(() => {
    writeJsonStorage('wishlist', items)
  }, [items])

  const addToWishlist = useCallback((item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((existingItem) => existingItem.id === item.id)) return prev
      return [...prev, item]
    })
  }, [])

  const removeFromWishlist = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const toggleWishlist = useCallback((item: WishlistItem) => {
    setItems((prev) =>
      prev.some((existingItem) => existingItem.id === item.id)
        ? prev.filter((existingItem) => existingItem.id !== item.id)
        : [...prev, item]
    )
  }, [])

  const isInWishlist = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  )

  const clearWishlist = useCallback(() => {
    removeStorageItem('wishlist')
    setItems([])
  }, [])

  const contextValue = useMemo(
    () => ({
      items,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      totalItems: items.length,
    }),
    [addToWishlist, clearWishlist, isInWishlist, items, removeFromWishlist, toggleWishlist],
  )

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  )
}
