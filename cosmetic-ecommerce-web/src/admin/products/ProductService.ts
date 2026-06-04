import { supabase } from '../../lib/supabaseClient'

export type ProductInput = {
  category_id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  stock: number
  brand: string
  ingredient_list: string
  skin_type: string
  size: string
  shade: string
  is_featured: boolean
  is_active: boolean
}

export type ProductImageInput = {
  image_url: string
  alt_text?: string
  sort_order: number
}

const PRODUCT_IMAGES_BUCKET = 'product-images'

async function uploadProductFiles(productId: string, files: File[], directory = '') {
  const uploadedUrls: string[] = []

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const safeName = `${crypto.randomUUID()}.${extension}`
    const path = [productId, directory, safeName].filter(Boolean).join('/')

    const { error } = await supabase.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage.from(PRODUCT_IMAGES_BUCKET).getPublicUrl(path)
    uploadedUrls.push(data.publicUrl)
  }

  return uploadedUrls
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name), product_images(id, image_url, alt_text, sort_order)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(payload: ProductInput) {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, payload: ProductInput) {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) throw error
}

export async function replaceProductImages(productId: string, images: ProductImageInput[]) {
  const { error: deleteError } = await supabase
    .from('product_images')
    .delete()
    .eq('product_id', productId)

  if (deleteError) throw deleteError

  if (images.length === 0) return []

  const { data, error } = await supabase
    .from('product_images')
    .insert(images.map((image) => ({ ...image, product_id: productId })))
    .select()

  if (error) throw error
  return data
}

export async function uploadProductImageFiles(productId: string, files: File[]) {
  return uploadProductFiles(productId, files)
}

export async function uploadProductDescriptionImageFiles(productId: string, files: File[]) {
  return uploadProductFiles(productId, files, 'description')
}
