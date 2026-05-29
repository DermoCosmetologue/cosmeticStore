import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../storefront/useAuth'

export default function RequireAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAdmin(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!error && data?.role === 'admin') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    }

    checkRole()
  }, [user])

  if (loading || isAdmin === null) return <p>Chargement...</p>
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}
