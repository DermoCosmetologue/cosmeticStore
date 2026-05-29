import { supabase } from '../../lib/supabaseClient'

export type InventoryProduct = {
  id: string
  name: string
  slug: string
  sku: string | null
  stock: number
  price: number
  is_active: boolean
  updated_at: string
  categories?: {
    name: string
  } | {
    name: string
  }[] | null
  product_images?: {
    image_url: string
    sort_order: number
  }[]
}

export async function fetchInventoryProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, sku, stock, price, is_active, updated_at, categories(name), product_images(image_url, sort_order)')
    .order('stock', { ascending: true })

  if (error) throw error
  return data as unknown as InventoryProduct[]
}

export async function updateProductStock(productId: string, stock: number) {
  const { data, error } = await supabase
    .from('products')
    .update({ stock })
    .eq('id', productId)
    .select('id, stock, updated_at')
    .single()

  if (error) throw error
  return data
}
