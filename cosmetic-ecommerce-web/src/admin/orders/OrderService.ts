import { supabase } from '../../lib/supabaseClient'

export type AdminOrderStatus =
  | 'pending_payment'
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export type AdminPaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded'

export type AdminOrderItem = {
  id: string
  product_id: string
  product_name: string
  product_image: string | null
  unit_price: number
  quantity: number
  line_total: number
}

export type AdminOrderAddress = {
  full_name: string
  phone: string
  country: string
  city: string
  district: string | null
  address_line1: string
  address_line2: string | null
}

export type AdminOrderProfile = {
  full_name: string | null
  phone: string | null
}

export type AdminOrder = {
  id: string
  order_number: string | null
  user_id: string
  status: AdminOrderStatus
  subtotal: number
  shipping_fee: number
  discount_amount: number
  total_amount: number
  payment_method: string | null
  payment_status: AdminPaymentStatus
  notes: string | null
  created_at: string
  updated_at: string
  addresses?: AdminOrderAddress | AdminOrderAddress[] | null
  profiles?: AdminOrderProfile | AdminOrderProfile[] | null
  order_items?: AdminOrderItem[]
}

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      user_id,
      status,
      subtotal,
      shipping_fee,
      discount_amount,
      total_amount,
      payment_method,
      payment_status,
      notes,
      created_at,
      updated_at,
      addresses(full_name, phone, country, city, district, address_line1, address_line2),
      profiles(full_name, phone),
      order_items(id, product_id, product_name, product_image, unit_price, quantity, line_total)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as unknown as AdminOrder[]
}

export async function updateOrderStatus(orderId: string, status: AdminOrderStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()

  if (error) throw error
  return data
}

export async function updatePaymentStatus(orderId: string, paymentStatus: AdminPaymentStatus) {
  const patch: {
    payment_status: AdminPaymentStatus
    status?: AdminOrderStatus
  } = {
    payment_status: paymentStatus,
  }

  if (paymentStatus === 'paid') {
    patch.status = 'processing'
  }

  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', orderId)
    .select()

  if (error) throw error
  return data
}
