import { supabase } from '../../lib/supabaseClient'

type CartItem = {
  id: string
  quantity: number
}

type AddressInput = {
  label?: string
  full_name: string
  phone: string
  country?: string
  city: string
  district?: string
  postal_code?: string
  address_line1: string
  address_line2?: string
}

export async function createOrderWithItems(params: {
  userId: string
  address: AddressInput
  items: CartItem[]
  paymentMethod?: string | null
  notes?: string | null
}) {
  const { data, error } = await supabase.rpc('create_order_with_items', {
    p_user_id: params.userId,
    p_address: params.address,
    p_items: params.items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
    })),
    p_payment_method: params.paymentMethod ?? null,
    p_notes: params.notes ?? null,
  })

  if (error) {
    throw new Error(error.message || "Erreur lors de l'enregistrement de la commande.")
  }

  return data as string
}
