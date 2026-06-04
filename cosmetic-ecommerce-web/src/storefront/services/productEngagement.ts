import { supabase } from '../../lib/supabaseClient'

export type ProductEngagementStat = {
  product_id: string
  wishlist_count: number
  order_count: number
  review_count: number
  average_rating: number | null
}

export type BadgeableProduct = {
  id: string
  is_featured?: boolean
  badge_label?: string | null
}

export async function fetchProductEngagementStats(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds)).filter(Boolean)

  if (uniqueProductIds.length === 0) {
    return new Map<string, ProductEngagementStat>()
  }

  const { data, error } = await supabase
    .from('product_engagement_stats')
    .select('product_id, wishlist_count, order_count, review_count, average_rating')
    .in('product_id', uniqueProductIds)

  if (error) {
    console.warn('Product engagement stats unavailable.', error)
    return new Map<string, ProductEngagementStat>()
  }

  return new Map(
    (data ?? []).map((stat) => [
      stat.product_id,
      {
        product_id: stat.product_id,
        wishlist_count: Number(stat.wishlist_count || 0),
        order_count: Number(stat.order_count || 0),
        review_count: Number(stat.review_count || 0),
        average_rating: stat.average_rating === null ? null : Number(stat.average_rating),
      },
    ]),
  )
}

export function applyProductBadges<TProduct extends BadgeableProduct>(
  products: TProduct[],
  statsMap: Map<string, ProductEngagementStat>,
) {
  const stats = products.map((product) => statsMap.get(product.id)).filter(Boolean) as ProductEngagementStat[]
  const maxWishlistCount = Math.max(0, ...stats.map((stat) => stat.wishlist_count))
  const maxOrderCount = Math.max(0, ...stats.map((stat) => stat.order_count))

  return products.map((product) => {
    const stat = statsMap.get(product.id)
    let badgeLabel: string | null = null

    if (product.is_featured) {
      badgeLabel = 'Produit vedette'
    } else if (stat?.wishlist_count && stat.wishlist_count >= 3 && stat.wishlist_count === maxWishlistCount) {
      badgeLabel = 'Meilleur produit'
    } else if (stat?.order_count && stat.order_count >= 5 && stat.order_count === maxOrderCount) {
      badgeLabel = 'Très demandé'
    } else if (stat?.average_rating && stat.average_rating >= 4.5 && stat.review_count >= 3) {
      badgeLabel = 'Coup de coeur clients'
    } else if (stat?.order_count && stat.order_count >= 2) {
      badgeLabel = 'Populaire'
    }

    return {
      ...product,
      badge_label: badgeLabel,
    }
  })
}
