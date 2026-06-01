import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import heroImage from '../../assets/hero.png'
import { DEFAULT_HOME_CONTENT } from '../homepageContent'
import type { HomeContent } from '../homepageContent'
import { fetchHomeContent } from '../homepageService'

type FeaturedProduct = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
}

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [homeContent, setHomeContent] = useState<HomeContent>(DEFAULT_HOME_CONTENT)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data: featuredData } = await supabase
        .from('storefront_products')
        .select('id, name, slug, short_description, price, thumbnail')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(3)

      if (featuredData && featuredData.length > 0) {
        setFeaturedProducts(featuredData as FeaturedProduct[])
        return
      }

      const { data: activeData } = await supabase
        .from('storefront_products')
        .select('id, name, slug, short_description, price, thumbnail')
        .eq('is_active', true)
        .limit(3)

      if (activeData) {
        setFeaturedProducts(activeData as FeaturedProduct[])
      }
    }

    void fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    let mounted = true

    const loadHomeContent = async () => {
      const settings = await fetchHomeContent()
      if (mounted) setHomeContent(settings)
    }

    void loadHomeContent()

    const handleFocus = () => {
      void loadHomeContent()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadHomeContent()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      mounted = false
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const heroSrc = homeContent.hero.image_url || heroImage
  const editorialSrc = homeContent.editorial.image_url || heroImage

  return (
    <>
      <section className="hero-section">
        <img src={heroSrc} alt="Selection de cosmetiques premium" />
        <div className="hero-overlay" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{homeContent.hero.eyebrow}</span>
            <h1>{homeContent.hero.title}</h1>
            <p>{homeContent.hero.text}</p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn-primary">{homeContent.hero.primary_label}</Link>
              <Link to="/catalog" className="btn-ghost">{homeContent.hero.secondary_label}</Link>
            </div>
          </div>

          <div className="hero-badge" aria-label="Mise en avant boutique">
            <strong>{homeContent.hero.badge_title}</strong>
            <span>{homeContent.hero.badge_text}</span>
          </div>
        </div>
      </section>

      {homeContent.visibility.stats && (
        <section className="container stats-band" aria-label="Avantages boutique">
          {homeContent.features.map((feature) => (
            <div key={feature.label}>
              <strong>{feature.value}</strong>
              <span>{feature.label}</span>
            </div>
          ))}
        </section>
      )}

      {homeContent.visibility.collections && (
        <section className="container section-block">
          <div className="section-heading">
            <span className="eyebrow">Collections</span>
            <h2>Un shopping beaute plus clair, plus rapide, plus premium.</h2>
          </div>
          <div className="collection-grid">
            {homeContent.collections.map((collection) => (
              <Link
                to="/catalog"
                className={`collection-card ${collection.image_url ? 'has-image' : ''}`}
                key={collection.name}
              >
                {collection.image_url && <img src={collection.image_url} alt={collection.name} />}
                <span>{collection.name}</span>
                <p>{collection.text}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {homeContent.visibility.editorial && (
        <section className="luxury-editorial">
          <div className="container luxury-editorial-inner">
            <div className="section-heading">
              <span className="eyebrow">{homeContent.editorial.eyebrow}</span>
              <h2>{homeContent.editorial.title}</h2>
            </div>

            <div className="editorial-panel">
              <img src={editorialSrc} alt="Details de cosmetiques luxe" />
              <div>
                <span className="eyebrow">{homeContent.editorial.label}</span>
                <h3>{homeContent.editorial.heading}</h3>
                <p>{homeContent.editorial.text}</p>
                <Link to="/catalog" className="btn-primary">{homeContent.editorial.button_label}</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {homeContent.visibility.featured && (
        <section className="container section-block">
          <div className="section-heading">
            <span className="eyebrow">{homeContent.featured.eyebrow}</span>
            <h2>{homeContent.featured.title}</h2>
          </div>

          <div className="luxury-picks-grid">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link to={`/product/${product.slug}`} className="luxury-pick" key={product.id}>
                  <img src={product.thumbnail || heroImage} alt={product.name} />
                  <span>Selection premium</span>
                  <h3>{product.name}</h3>
                  <p>{Number(product.price || 0).toLocaleString('fr-FR')} FCFA</p>
                </Link>
              ))
            ) : (
              homeContent.fallback_picks.map((pick) => (
                <Link to="/catalog" className="luxury-pick" key={pick.title}>
                  <img src={pick.image_url || heroImage} alt={pick.title} />
                  <span>{pick.label}</span>
                  <h3>{pick.title}</h3>
                  <p>{pick.price}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      )}

      {homeContent.visibility.ritual && (
        <section className="ritual-section">
          <div className="container ritual-layout">
            <div className="section-heading">
              <span className="eyebrow">{homeContent.ritual.eyebrow}</span>
              <h2>{homeContent.ritual.title}</h2>
            </div>

            <div className="ritual-list">
              {homeContent.ritual.items.map((ritual, index) => (
                <Link to="/catalog" className="ritual-item" key={ritual.title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{ritual.title}</strong>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {homeContent.visibility.service && (
        <section className="container maison-service">
          <div>
            <span className="eyebrow">{homeContent.service.eyebrow}</span>
            <h2>{homeContent.service.title}</h2>
          </div>
          <div className="service-grid">
            {homeContent.service.items.map((item) => (
              <div key={item.title}>
                <strong>{item.title}</strong>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {homeContent.visibility.final_cta && (
        <section className="final-cta">
          <div className="container final-cta-inner">
            <span className="eyebrow">{homeContent.final_cta.eyebrow}</span>
            <h2>{homeContent.final_cta.title}</h2>
            <Link to="/catalog" className="btn-primary">{homeContent.final_cta.button_label}</Link>
          </div>
        </section>
      )}
    </>
  )
}
