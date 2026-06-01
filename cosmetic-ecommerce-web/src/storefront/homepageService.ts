import { supabase } from '../lib/supabaseClient'
import { DEFAULT_HOME_CONTENT } from './homepageContent'
import type { HomeContent } from './homepageContent'

const HOMEPAGE_SETTINGS_ID = 'main'

function mergeHomeContent(settings: Partial<HomeContent> | null | undefined): HomeContent {
  return {
    ...DEFAULT_HOME_CONTENT,
    ...settings,
    hero: { ...DEFAULT_HOME_CONTENT.hero, ...settings?.hero },
    editorial: { ...DEFAULT_HOME_CONTENT.editorial, ...settings?.editorial },
    featured: { ...DEFAULT_HOME_CONTENT.featured, ...settings?.featured },
    ritual: {
      ...DEFAULT_HOME_CONTENT.ritual,
      ...settings?.ritual,
      items: settings?.ritual?.items?.length ? settings.ritual.items : DEFAULT_HOME_CONTENT.ritual.items,
    },
    service: {
      ...DEFAULT_HOME_CONTENT.service,
      ...settings?.service,
      items: settings?.service?.items?.length ? settings.service.items : DEFAULT_HOME_CONTENT.service.items,
    },
    final_cta: { ...DEFAULT_HOME_CONTENT.final_cta, ...settings?.final_cta },
    visibility: { ...DEFAULT_HOME_CONTENT.visibility, ...settings?.visibility },
    features: settings?.features?.length ? settings.features : DEFAULT_HOME_CONTENT.features,
    collections: settings?.collections?.length ? settings.collections : DEFAULT_HOME_CONTENT.collections,
    fallback_picks: settings?.fallback_picks?.length ? settings.fallback_picks : DEFAULT_HOME_CONTENT.fallback_picks,
  }
}

export async function fetchHomeContent() {
  const { data, error } = await supabase
    .from('homepage_settings')
    .select('settings')
    .eq('id', HOMEPAGE_SETTINGS_ID)
    .maybeSingle()

  if (error) {
    console.warn('Homepage settings unavailable, using defaults.', error.message)
    return DEFAULT_HOME_CONTENT
  }

  return mergeHomeContent(data?.settings as Partial<HomeContent> | null)
}

export async function saveHomeContent(settings: HomeContent) {
  const { data, error } = await supabase
    .from('homepage_settings')
    .upsert(
      {
        id: HOMEPAGE_SETTINGS_ID,
        settings,
      },
      { onConflict: 'id' },
    )
    .select('settings')
    .single()

  if (error) throw new Error(error.message)

  return mergeHomeContent(data.settings as Partial<HomeContent> | null)
}
