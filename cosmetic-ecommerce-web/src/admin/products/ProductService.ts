import { supabase } from '../../lib/supabaseClient'

export type ProductInput = {
  category_id: string
  name: string
  slug: string
  description: string
  short_description: string
  price: number
  wholesale_price: number | null
  wholesale_min_quantity: number
  is_wholesale_enabled: boolean
  is_recommended: boolean
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

type ProductPayload = ProductInput

const OPTIONAL_PRODUCT_COLUMNS = [
  'is_recommended',
  'wholesale_price',
  'wholesale_min_quantity',
  'is_wholesale_enabled',
] as const

function getMissingProductColumn(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error)
  const match = message.match(/(?:column of 'products'|column)\s+['\"]?([a-z_]+)['\"]?/i)
  const column = match?.[1]

  return OPTIONAL_PRODUCT_COLUMNS.includes(column as (typeof OPTIONAL_PRODUCT_COLUMNS)[number])
    ? column
    : null
}

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

function getSafeProductPayload(payload: ProductInput): ProductPayload {
  return {
    ...payload,
    ...(payload.is_recommended !== undefined ? { is_recommended: Boolean(payload.is_recommended) } : {}),
  }
}

async function saveProduct<T>(
  payload: ProductInput,
  save: (safePayload: Partial<ProductInput>) => PromiseLike<{ data: T; error: unknown }>,
) {
  const safePayload: Partial<ProductInput> = getSafeProductPayload(payload)

  while (true) {
    const result = await save(safePayload)
    const { error } = result
    if (!error) return result

    const missingColumn = getMissingProductColumn(error)
    if (!missingColumn || !(missingColumn in safePayload)) throw error

    delete safePayload[missingColumn as keyof ProductInput]
  }
}

export async function createProduct(payload: ProductInput) {
  const { data } = await saveProduct(payload, (safePayload) =>
    supabase.from('products').insert(safePayload).select().single(),
  )
  return data
}

export async function updateProduct(id: string, payload: ProductInput) {
  const { data } = await saveProduct(payload, (safePayload) =>
    supabase.from('products').update(safePayload).eq('id', id).select().single(),
  )
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
