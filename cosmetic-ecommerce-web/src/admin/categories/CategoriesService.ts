import { supabase } from '../../lib/supabaseClient'

export type CategoryInput = {
  name: string
  slug: string
  description: string
  image_url: string
  is_active: boolean
}

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, is_active')
    .order('name', { ascending: true })

  if (error) throw error
  return data
}

export async function createCategory(payload: CategoryInput) {
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCategory(id: string, payload: CategoryInput) {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
