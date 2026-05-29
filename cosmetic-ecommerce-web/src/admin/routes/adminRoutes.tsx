import { Navigate, Route } from 'react-router-dom'
import AdminLayout from '../layout/AdminLayout'
import CategoriesPage from '../categories/CategoriesPage'
import ProductsPage from '../products/ProductsPage'
import RequireAdmin from '../auth/RequireAdmin'

export default function AdminRoutes() {
  return (
    <Route element={<RequireAdmin />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="categories" replace />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="products" element={<ProductsPage />} />
      </Route>
    </Route>
  )
}
