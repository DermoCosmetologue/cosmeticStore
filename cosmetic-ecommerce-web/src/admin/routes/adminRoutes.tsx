import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

const AdminLayout = lazy(() => import('../layout/AdminLayout'))
const AdminDashboard = lazy(() => import('../dashboard/AdminDashboard'))
const CategoriesPage = lazy(() => import('../categories/CategoriesPage'))
const ProductsPage = lazy(() => import('../products/ProductsPage'))
const OrdersPage = lazy(() => import('../orders/OrdersPage'))
const InventoryPage = lazy(() => import('../inventory/Inventorypage'))
const HomepageAdminPage = lazy(() => import('../homepage/HomepageAdminPage'))
const RequireAdmin = lazy(() => import('../auth/RequireAdmin'))

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="homepage" element={<HomepageAdminPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
