import { Routes, Route } from 'react-router-dom'
import MainLayout from './storefront/layouts/MainLayouts'
import HomePage from './storefront/pages/HomePage'
import CatalogPage from './storefront/pages/CatalogPage'
import ProductDetailsPage from './storefront/pages/ProductDetailsPage'
import CartPage from './storefront/pages/CartPage'
import CheckoutPage from './storefront/pages/CheckoutPage'
import PaymentPage from './storefront/pages/PaymentPage'
import AuthPage from './storefront/AuthPage'
import AuthCallbackPage from './storefront/AuthCallbackPage'
import ProfilePage from './storefront/pages/ProfilePage'
import OrdersPage from './storefront/pages/OrdersPage'
import NotFoundPage from './storefront/pages/NotFoundPage'
import { CartProvider } from './storefront/context/CartContext'
import { AuthProvider } from './storefront/AuthContext'
import AdminRoutes from './admin/routes/adminRoutes'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductDetailsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          {AdminRoutes()}
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}
