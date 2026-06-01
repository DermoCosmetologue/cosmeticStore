import { Navigate, Route } from 'react-router-dom'
import AdminLayout from '../layout/AdminLayout'
import AdminDashboard from '../dashboard/AdminDashboard'
import CategoriesPage from '../categories/CategoriesPage'
import ProductsPage from '../products/ProductsPage'
import OrdersPage from '../orders/OrdersPage'
import InventoryPage from '../inventory/Inventorypage'
import HomepageAdminPage from '../homepage/HomepageAdminPage'
import RequireAdmin from '../auth/RequireAdmin'

export default function AdminRoutes() {
  return (
    <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="homepage" element={<HomepageAdminPage />} />
        <Route path="inventory" element={<InventoryPage />} />
        <Route path="orders" element={<OrdersPage />} />
      </Route>
    </Route>
  )
}
