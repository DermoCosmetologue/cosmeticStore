import { Routes, Route } from 'react-router-dom'
import MainLayout from './storefront/layouts/MainLayouts'
import HomePage from './storefront/pages/HomePage'
import CatalogPage from './storefront/pages/CatalogPage'
import ProductDetailsPage from './storefront/pages/ProductDetailsPage'
import CartPage from './storefront/pages/CartPage'
import CheckoutPage from './storefront/pages/CheckoutPage'
import { CartProvider } from './storefront/context/CartContext'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
      </Routes>
    </CartProvider>
  )
}
