import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export type DashboardOrder = {
  id: string
  user_id: string
  status: string
  payment_status: string
  total_amount: number
  created_at: string
  order_items?: {
    product_id: string
    product_name: string
    quantity: number
    line_total: number
  }[]
}

export type SalesPoint = {
  label: string
  sales: number
  orders: number
}

export type TopProduct = {
  productId: string
  name: string
  quantity: number
  revenue: number
}

function getDayLabel(value: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(value)
}

function getLastDays(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() - (days - 1 - index))
    return date
  })
}

export function useDashboardStats() {
  const [orders, setOrders] = useState<DashboardOrder[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const fetchDashboard = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const since = new Date()
        since.setDate(since.getDate() - 29)
        since.setHours(0, 0, 0, 0)

        const [ordersResult, productsResult] = await Promise.all([
          supabase
            .from('orders')
            .select(`
              id,
              user_id,
              status,
              payment_status,
              total_amount,
              created_at,
              order_items(product_id, product_name, quantity, line_total)
            `)
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }),
        ])

        if (ordersResult.error) throw ordersResult.error
        if (productsResult.error) throw productsResult.error
        if (!mounted) return

        setOrders((ordersResult.data ?? []) as unknown as DashboardOrder[])
        setProductsCount(productsResult.count ?? 0)
      } catch (error) {
        console.error(error)
        if (mounted) setErrorMessage('Impossible de charger les analytics.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void fetchDashboard()

    return () => {
      mounted = false
    }
  }, [])

  return useMemo(() => {
    const paidOrders = orders.filter((order) => order.payment_status === 'paid')
    const revenue = paidOrders.reduce((total, order) => total + Number(order.total_amount || 0), 0)
    const activeCustomers = new Set(orders.map((order) => order.user_id)).size
    const conversionRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0
    const averageOrderValue = paidOrders.length > 0 ? Math.round(revenue / paidOrders.length) : 0

    const days = getLastDays(14)
    const salesByDay: SalesPoint[] = days.map((day) => {
      const dayKey = day.toISOString().slice(0, 10)
      const dayOrders = paidOrders.filter((order) => order.created_at.slice(0, 10) === dayKey)

      return {
        label: getDayLabel(day),
        sales: dayOrders.reduce((total, order) => total + Number(order.total_amount || 0), 0),
        orders: dayOrders.length,
      }
    })

    const topProductsMap = new Map<string, TopProduct>()

    for (const order of paidOrders) {
      for (const item of order.order_items ?? []) {
        const current = topProductsMap.get(item.product_id) ?? {
          productId: item.product_id,
          name: item.product_name,
          quantity: 0,
          revenue: 0,
        }

        current.quantity += Number(item.quantity || 0)
        current.revenue += Number(item.line_total || 0)
        topProductsMap.set(item.product_id, current)
      }
    }

    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)

    return {
      loading,
      errorMessage,
      stats: {
        revenue,
        orders: orders.length,
        paidOrders: paidOrders.length,
        activeCustomers,
        productsCount,
        conversionRate,
        averageOrderValue,
      },
      salesByDay,
      topProducts,
    }
  }, [errorMessage, loading, orders, productsCount])
}
