import { createContext } from 'react'
import type { WishlistContextType } from './WishlistContext'

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined)
