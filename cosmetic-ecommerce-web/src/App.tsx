import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './storefront/layouts/MainLayouts'
import { CartProvider } from './storefront/context/CartContext'
import { WishlistProvider } from './storefront/context/WishlistContext'
import { AuthProvider } from './storefront/AuthContext'

const HomePage = lazy(() => import('./storefront/pages/HomePage'))
const CatalogPage = lazy(() => import('./storefront/pages/CatalogPage'))
const ProductDetailsPage = lazy(() => import('./storefront/pages/ProductDetailsPage'))
const CartPage = lazy(() => import('./storefront/pages/CartPage'))
const CheckoutPage = lazy(() => import('./storefront/pages/CheckoutPage'))
const PaymentPage = lazy(() => import('./storefront/pages/PaymentPage'))
const WishlistPage = lazy(() => import('./storefront/pages/WishlistPage'))
const AuthPage = lazy(() => import('./storefront/AuthPage'))
const AuthCallbackPage = lazy(() => import('./storefront/AuthCallbackPage'))
const ProfilePage = lazy(() => import('./storefront/pages/ProfilePage'))
const OrdersPage = lazy(() => import('./storefront/pages/OrdersPage'))
const NotFoundPage = lazy(() => import('./storefront/pages/NotFoundPage'))
const AdminRoutes = lazy(() => import('./admin/routes/adminRoutes'))

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Suspense fallback={<div className="container loading-card">Chargement...</div>}>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:slug" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/payment/:orderId" element={<PaymentPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
              <Route path="/admin/*" element={<AdminRoutes />} />
            </Routes>
          </Suspense>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
