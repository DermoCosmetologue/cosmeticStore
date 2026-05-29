import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import heroImage from '../../assets/hero.png'

type FeaturedProduct = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
}

const features = [
  { value: '48h', label: 'Livraison urbaine' },
  { value: '+80', label: 'References beaute' },
  { value: '4.9', label: 'Note moyenne' },
]

const collections = [
  {
    name: 'Soins visage',
    text: 'Textures fines, actifs precis et resultats visibles au quotidien.',
  },
  {
    name: 'Parfums signature',
    text: 'Sillages elegants pour les moments qui meritent une empreinte.',
  },
  {
    name: 'Glow routine',
    text: 'Essentiels eclat pour une peau lumineuse sans surcharge.',
  },
  {
    name: 'Coffrets premium',
    text: 'Idees cadeaux et routines completes pretes a offrir.',
  },
]

const rituals = [
  'Nettoyer avec douceur',
  'Hydrater en profondeur',
  'Illuminer le teint',
  'Signer avec un parfum',
]

const luxuryPicks = [
  {
    title: 'Edition peau parfaite',
    label: 'Routine complete',
    price: 'A partir de 18 000 FCFA',
  },
  {
    title: 'Parfum de soiree',
    label: 'Signature intense',
    price: 'A partir de 25 000 FCFA',
  },
  {
    title: 'Coffret eclat',
    label: 'Selection cadeau',
    price: 'A partir de 32 000 FCFA',
  },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      const { data: featuredData } = await supabase
        .from('storefront_products')
        .select('id, name, slug, short_description, price, thumbnail')
        .eq('is_active', true)
        .eq('is_featured', true)
        .not('thumbnail', 'is', null)
        .limit(3)

      if (featuredData && featuredData.length > 0) {
        setFeaturedProducts(featuredData as FeaturedProduct[])
        return
      }

      const { data: activeData } = await supabase
        .from('storefront_products')
        .select('id, name, slug, short_description, price, thumbnail')
        .eq('is_active', true)
        .not('thumbnail', 'is', null)
        .limit(3)

      if (activeData) {
        setFeaturedProducts(activeData as FeaturedProduct[])
      }
    }

    void fetchFeaturedProducts()
  }, [])

  return (
    <>
      <section className="hero-section">
        <img src={heroImage} alt="Selection de cosmetiques premium" />
        <div className="hero-overlay" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">Nouvelle selection 2026</span>
            <h1>Cosmetiques premium pour une routine beaute elegante.</h1>
            <p>
              Decouvrez des soins, parfums et essentiels beaute choisis pour leur
              efficacite, leur texture et leur finition luxueuse.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn-primary">Explorer la boutique</Link>
              <Link to="/catalog" className="btn-ghost">Voir les nouveautes</Link>
            </div>
          </div>

          <div className="hero-badge" aria-label="Mise en avant boutique">
            <strong>Routine complete</strong>
            <span>Soins, parfums et accessoires</span>
          </div>
        </div>
      </section>

      <section className="container stats-band" aria-label="Avantages boutique">
        {features.map((feature) => (
          <div key={feature.label}>
            <strong>{feature.value}</strong>
            <span>{feature.label}</span>
          </div>
        ))}
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Collections</span>
          <h2>Un shopping beaute plus clair, plus rapide, plus premium.</h2>
        </div>
        <div className="collection-grid">
          {collections.map((collection) => (
            <Link to="/catalog" className="collection-card" key={collection.name}>
              <span>{collection.name}</span>
              <p>{collection.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="luxury-editorial">
        <div className="container luxury-editorial-inner">
          <div className="section-heading">
            <span className="eyebrow">Maison beaute</span>
            <h2>Une selection inspiree des comptoirs premium.</h2>
          </div>

          <div className="editorial-panel">
            <img src={heroImage} alt="Details de cosmetiques luxe" />
            <div>
              <span className="eyebrow">Selection experte</span>
              <h3>Des essentiels choisis pour la sensation, la tenue et le fini.</h3>
              <p>
                Chaque produit est pense pour trouver sa place dans une routine simple:
                soin net, parfum juste, geste efficace et presentation soignee.
              </p>
              <Link to="/catalog" className="btn-primary">Decouvrir les essentiels</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow">Selections</span>
          <h2>Les pieces fortes du moment.</h2>
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
            luxuryPicks.map((pick) => (
              <Link to="/catalog" className="luxury-pick" key={pick.title}>
                <img src={heroImage} alt={pick.title} />
                <span>{pick.label}</span>
                <h3>{pick.title}</h3>
                <p>{pick.price}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="ritual-section">
        <div className="container ritual-layout">
          <div className="section-heading">
            <span className="eyebrow">Rituel</span>
            <h2>Composer une routine elegante en quatre gestes.</h2>
          </div>

          <div className="ritual-list">
            {rituals.map((ritual, index) => (
              <Link to="/catalog" className="ritual-item" key={ritual}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{ritual}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container maison-service">
        <div>
          <span className="eyebrow">Service premium</span>
          <h2>Une experience soignee, du panier a la reception.</h2>
        </div>
        <div className="service-grid">
          <div>
            <strong>Paiement securise</strong>
            <span>XPAYE, carte et mobile money selon disponibilite.</span>
          </div>
          <div>
            <strong>Preparation attentive</strong>
            <span>Commande verifiee avant expedition.</span>
          </div>
          <div>
            <strong>Suivi client</strong>
            <span>Historique et statut accessibles depuis votre compte.</span>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="container final-cta-inner">
          <span className="eyebrow">Boutique</span>
          <h2>Trouvez la routine qui signe votre style.</h2>
          <Link to="/catalog" className="btn-primary">Entrer dans le catalogue</Link>
        </div>
      </section>
    </>
  )
}
