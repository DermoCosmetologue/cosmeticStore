import { supabase } from '../../lib/supabaseClient'

const HOMEPAGE_IMAGES_BUCKET = 'homepage-images'

export async function uploadHomepageImageFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = `${crypto.randomUUID()}.${extension}`
  const path = safeName

  const { error } = await supabase.storage
    .from(HOMEPAGE_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from(HOMEPAGE_IMAGES_BUCKET).getPublicUrl(path)
  return data.publicUrl
}
