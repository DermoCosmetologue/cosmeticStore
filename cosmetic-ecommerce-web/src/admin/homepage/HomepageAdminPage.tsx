import { useEffect, useState } from 'react'
import { DEFAULT_HOME_CONTENT } from '../../storefront/homepageContent'
import type { HomeContent } from '../../storefront/homepageContent'
import { fetchHomeContent, saveHomeContent } from '../../storefront/homepageService'
import { uploadHomepageImageFile } from './homepageImageService'

function cloneDefaultHomeContent(): HomeContent {
  return JSON.parse(JSON.stringify(DEFAULT_HOME_CONTENT)) as HomeContent
}

export default function HomepageAdminPage() {
  const [form, setForm] = useState<HomeContent>(cloneDefaultHomeContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingField, setUploadingField] = useState('')
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let mounted = true

    const loadSettings = async () => {
      try {
        setLoading(true)
        const settings = await fetchHomeContent()
        if (mounted) setForm(settings)
      } catch (error) {
        console.error(error)
        if (mounted) setErrorMessage("Impossible de charger la configuration de la page d'accueil.")
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadSettings()

    return () => {
      mounted = false
    }
  }, [])

  const updateHero = (field: keyof HomeContent['hero'], value: string) => {
    setForm((prev) => ({ ...prev, hero: { ...prev.hero, [field]: value } }))
  }

  const updateEditorial = (field: keyof HomeContent['editorial'], value: string) => {
    setForm((prev) => ({ ...prev, editorial: { ...prev.editorial, [field]: value } }))
  }

  const updateFeatured = (field: keyof HomeContent['featured'], value: string) => {
    setForm((prev) => ({ ...prev, featured: { ...prev.featured, [field]: value } }))
  }

  const updateFinalCta = (field: keyof HomeContent['final_cta'], value: string) => {
    setForm((prev) => ({ ...prev, final_cta: { ...prev.final_cta, [field]: value } }))
  }

  const updateVisibility = (field: keyof HomeContent['visibility'], value: boolean) => {
    setForm((prev) => ({ ...prev, visibility: { ...prev.visibility, [field]: value } }))
  }

  const updateFeature = (index: number, field: keyof HomeContent['features'][number], value: string) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const updateCollection = (
    index: number,
    field: keyof HomeContent['collections'][number],
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      collections: prev.collections.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const updateRitual = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      ritual: {
        ...prev.ritual,
        items: prev.ritual.items.map((item, currentIndex) =>
          currentIndex === index ? { ...item, title: value } : item,
        ),
      },
    }))
  }

  const updateService = (
    index: number,
    field: keyof HomeContent['service']['items'][number],
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      service: {
        ...prev.service,
        items: prev.service.items.map((item, currentIndex) =>
          currentIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }))
  }

  const updateServiceHeading = (field: keyof HomeContent['service'], value: string) => {
    if (field === 'items') return
    setForm((prev) => ({ ...prev, service: { ...prev.service, [field]: value } }))
  }

  const updateRitualHeading = (field: keyof HomeContent['ritual'], value: string) => {
    if (field === 'items') return
    setForm((prev) => ({ ...prev, ritual: { ...prev.ritual, [field]: value } }))
  }

  const updateFallbackPick = (
    index: number,
    field: keyof HomeContent['fallback_picks'][number],
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      fallback_picks: prev.fallback_picks.map((item, currentIndex) =>
        currentIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const uploadImage = async (
    fieldKey: string,
    file: File | undefined,
    applyUrl: (url: string) => void,
  ) => {
    if (!file) return

    setUploadingField(fieldKey)
    setMessage('')
    setErrorMessage('')

    try {
      const publicUrl = await uploadHomepageImageFile(file)
      applyUrl(publicUrl)
      setMessage('Image importee. Pensez a enregistrer la page.')
    } catch (error) {
      console.error(error)
      setErrorMessage("Impossible d'importer l'image. Verifiez le bucket Supabase homepage-images.")
    } finally {
      setUploadingField('')
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setErrorMessage('')

    try {
      await saveHomeContent(form)
      setMessage("Page d'accueil enregistree.")
    } catch (error) {
      console.error(error)
      setErrorMessage("Impossible d'enregistrer. Verifiez que la table homepage_settings existe dans Supabase.")
    } finally {
      setSaving(false)
    }
  }

  const resetDefaults = () => {
    if (!confirm("Remettre le contenu par defaut de la page d'accueil ?")) return
    setForm(cloneDefaultHomeContent())
    setMessage('')
    setErrorMessage('')
  }

  if (loading) {
    return <section className="admin-page"><p className="admin-empty-state">Chargement...</p></section>
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Storefront</span>
          <h1>Page d'accueil</h1>
          <p>Modifiez les textes, images et sections visibles sur la page d'accueil.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={resetDefaults}>
          Reinitialiser
        </button>
      </div>

      {message && <p className="auth-notice success">{message}</p>}
      {errorMessage && <p className="admin-alert">{errorMessage}</p>}

      <form className="admin-form homepage-admin-form" onSubmit={handleSubmit}>
        <div className="admin-form-heading">
          <h2>Sections visibles</h2>
          <p>Masquez temporairement les blocs qui ne sont pas prets.</p>
        </div>

        <div className="admin-toggle-row">
          {Object.entries(form.visibility).map(([key, value]) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={value}
                onChange={(event) => updateVisibility(key as keyof HomeContent['visibility'], event.target.checked)}
              />
              {key}
            </label>
          ))}
        </div>

        <div className="admin-form-heading">
          <h2>Hero</h2>
          <p>Premiere section visible au chargement de la page.</p>
        </div>

        <div className="admin-form-grid">
          <label>
            Eyebrow
            <input value={form.hero.eyebrow} onChange={(event) => updateHero('eyebrow', event.target.value)} />
          </label>
          <label>
            Image hero
            <input
              type="url"
              value={form.hero.image_url}
              onChange={(event) => updateHero('image_url', event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>
        <label>
          Importer l'image hero
          <input
            type="file"
            accept="image/*"
            disabled={uploadingField === 'hero'}
            onChange={(event) => {
              void uploadImage('hero', event.target.files?.[0], (url) => updateHero('image_url', url))
              event.target.value = ''
            }}
          />
        </label>
        {form.hero.image_url && (
          <div className="admin-image-preview">
            <img src={form.hero.image_url} alt="Apercu hero" />
          </div>
        )}

        <label>
          Titre principal
          <textarea value={form.hero.title} onChange={(event) => updateHero('title', event.target.value)} rows={2} />
        </label>

        <label>
          Texte
          <textarea value={form.hero.text} onChange={(event) => updateHero('text', event.target.value)} rows={3} />
        </label>

        <div className="admin-form-grid">
          <label>
            Bouton principal
            <input value={form.hero.primary_label} onChange={(event) => updateHero('primary_label', event.target.value)} />
          </label>
          <label>
            Bouton secondaire
            <input value={form.hero.secondary_label} onChange={(event) => updateHero('secondary_label', event.target.value)} />
          </label>
          <label>
            Badge titre
            <input value={form.hero.badge_title} onChange={(event) => updateHero('badge_title', event.target.value)} />
          </label>
          <label>
            Badge texte
            <input value={form.hero.badge_text} onChange={(event) => updateHero('badge_text', event.target.value)} />
          </label>
        </div>

        <div className="admin-form-heading">
          <h2>Avantages</h2>
          <p>Trois chiffres courts sous le hero.</p>
        </div>

        <div className="admin-form-grid">
          {form.features.map((feature, index) => (
            <div className="admin-nested-card" key={index}>
              <label>
                Valeur
                <input value={feature.value} onChange={(event) => updateFeature(index, 'value', event.target.value)} />
              </label>
              <label>
                Label
                <input value={feature.label} onChange={(event) => updateFeature(index, 'label', event.target.value)} />
              </label>
            </div>
          ))}
        </div>

        <div className="admin-form-heading">
          <h2>Collections illustrees</h2>
          <p>Ajoutez des URL d'images pour obtenir une disposition plus premium.</p>
        </div>

        {form.collections.map((collection, index) => (
          <div className="admin-nested-card" key={index}>
            <div className="admin-form-grid">
              <label>
                Nom
                <input value={collection.name} onChange={(event) => updateCollection(index, 'name', event.target.value)} />
              </label>
              <label>
                Image
                <input
                  type="url"
                  value={collection.image_url}
                  onChange={(event) => updateCollection(index, 'image_url', event.target.value)}
                  placeholder="https://..."
                />
              </label>
            </div>
            <label>
              Importer l'image collection
              <input
                type="file"
                accept="image/*"
                disabled={uploadingField === `collection-${index}`}
                onChange={(event) => {
                  void uploadImage(`collection-${index}`, event.target.files?.[0], (url) =>
                    updateCollection(index, 'image_url', url),
                  )
                  event.target.value = ''
                }}
              />
            </label>
            {collection.image_url && (
              <div className="admin-image-preview">
                <img src={collection.image_url} alt={`Apercu ${collection.name}`} />
              </div>
            )}
            <label>
              Texte
              <input value={collection.text} onChange={(event) => updateCollection(index, 'text', event.target.value)} />
            </label>
          </div>
        ))}

        <div className="admin-form-heading">
          <h2>Editorial</h2>
          <p>Bloc image + texte pour raconter la selection boutique.</p>
        </div>

        <div className="admin-form-grid">
          <label>
            Eyebrow section
            <input value={form.editorial.eyebrow} onChange={(event) => updateEditorial('eyebrow', event.target.value)} />
          </label>
          <label>
            Image
            <input
              type="url"
              value={form.editorial.image_url}
              onChange={(event) => updateEditorial('image_url', event.target.value)}
              placeholder="https://..."
            />
          </label>
        </div>
        <label>
          Importer l'image editorial
          <input
            type="file"
            accept="image/*"
            disabled={uploadingField === 'editorial'}
            onChange={(event) => {
              void uploadImage('editorial', event.target.files?.[0], (url) => updateEditorial('image_url', url))
              event.target.value = ''
            }}
          />
        </label>
        {form.editorial.image_url && (
          <div className="admin-image-preview">
            <img src={form.editorial.image_url} alt="Apercu editorial" />
          </div>
        )}
        <label>
          Titre section
          <input value={form.editorial.title} onChange={(event) => updateEditorial('title', event.target.value)} />
        </label>
        <label>
          Titre du panneau
          <input value={form.editorial.heading} onChange={(event) => updateEditorial('heading', event.target.value)} />
        </label>
        <label>
          Texte du panneau
          <textarea value={form.editorial.text} onChange={(event) => updateEditorial('text', event.target.value)} rows={3} />
        </label>
        <div className="admin-form-grid">
          <label>
            Label
            <input value={form.editorial.label} onChange={(event) => updateEditorial('label', event.target.value)} />
          </label>
          <label>
            Bouton
            <input value={form.editorial.button_label} onChange={(event) => updateEditorial('button_label', event.target.value)} />
          </label>
        </div>

        <div className="admin-form-heading">
          <h2>Produits mis en avant</h2>
          <p>Le site utilise les produits vedettes. Ces cartes servent de secours si aucun produit vedette n'a d'image.</p>
        </div>

        <div className="admin-form-grid">
          <label>
            Eyebrow
            <input value={form.featured.eyebrow} onChange={(event) => updateFeatured('eyebrow', event.target.value)} />
          </label>
          <label>
            Titre
            <input value={form.featured.title} onChange={(event) => updateFeatured('title', event.target.value)} />
          </label>
        </div>

        {form.fallback_picks.map((pick, index) => (
          <div className="admin-nested-card" key={index}>
            <div className="admin-form-grid">
              <label>
                Titre carte
                <input value={pick.title} onChange={(event) => updateFallbackPick(index, 'title', event.target.value)} />
              </label>
              <label>
                Image
                <input
                  type="url"
                  value={pick.image_url}
                  onChange={(event) => updateFallbackPick(index, 'image_url', event.target.value)}
                />
              </label>
              <label>
                Label
                <input value={pick.label} onChange={(event) => updateFallbackPick(index, 'label', event.target.value)} />
              </label>
              <label>
                Prix
                <input value={pick.price} onChange={(event) => updateFallbackPick(index, 'price', event.target.value)} />
              </label>
            </div>
            <label>
              Importer l'image carte
              <input
                type="file"
                accept="image/*"
                disabled={uploadingField === `fallback-${index}`}
                onChange={(event) => {
                  void uploadImage(`fallback-${index}`, event.target.files?.[0], (url) =>
                    updateFallbackPick(index, 'image_url', url),
                  )
                  event.target.value = ''
                }}
              />
            </label>
            {pick.image_url && (
              <div className="admin-image-preview">
                <img src={pick.image_url} alt={`Apercu ${pick.title}`} />
              </div>
            )}
          </div>
        ))}

        <div className="admin-form-heading">
          <h2>Rituel</h2>
          <p>Quatre etapes simples pour guider le client.</p>
        </div>
        <div className="admin-form-grid">
          <label>
            Eyebrow
            <input value={form.ritual.eyebrow} onChange={(event) => updateRitualHeading('eyebrow', event.target.value)} />
          </label>
          <label>
            Titre
            <input value={form.ritual.title} onChange={(event) => updateRitualHeading('title', event.target.value)} />
          </label>
        </div>
        <div className="admin-form-grid">
          {form.ritual.items.map((item, index) => (
            <label key={index}>
              Geste {index + 1}
              <input value={item.title} onChange={(event) => updateRitual(index, event.target.value)} />
            </label>
          ))}
        </div>

        <div className="admin-form-heading">
          <h2>Services</h2>
          <p>Arguments rassurants avant le dernier appel a l'action.</p>
        </div>
        <div className="admin-form-grid">
          <label>
            Eyebrow
            <input value={form.service.eyebrow} onChange={(event) => updateServiceHeading('eyebrow', event.target.value)} />
          </label>
          <label>
            Titre
            <input value={form.service.title} onChange={(event) => updateServiceHeading('title', event.target.value)} />
          </label>
        </div>
        {form.service.items.map((item, index) => (
          <div className="admin-nested-card" key={index}>
            <div className="admin-form-grid">
              <label>
                Titre
                <input value={item.title} onChange={(event) => updateService(index, 'title', event.target.value)} />
              </label>
              <label>
                Texte
                <input value={item.text} onChange={(event) => updateService(index, 'text', event.target.value)} />
              </label>
            </div>
          </div>
        ))}

        <div className="admin-form-heading">
          <h2>Appel final</h2>
        </div>
        <div className="admin-form-grid">
          <label>
            Eyebrow
            <input value={form.final_cta.eyebrow} onChange={(event) => updateFinalCta('eyebrow', event.target.value)} />
          </label>
          <label>
            Bouton
            <input value={form.final_cta.button_label} onChange={(event) => updateFinalCta('button_label', event.target.value)} />
          </label>
        </div>
        <label>
          Titre
          <input value={form.final_cta.title} onChange={(event) => updateFinalCta('title', event.target.value)} />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? 'Enregistrement...' : "Enregistrer la page d'accueil"}
          </button>
          <a href="/" className="admin-secondary-button" target="_blank" rel="noreferrer">
            Voir la page
          </a>
        </div>
      </form>
    </section>
  )
}
