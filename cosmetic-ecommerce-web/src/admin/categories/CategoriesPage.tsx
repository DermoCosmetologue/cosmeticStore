import { useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from './CategoriesService'
import type { CategoryInput } from './CategoriesService'

type Category = CategoryInput & {
  id: string
}

const emptyForm: CategoryInput = {
  name: '',
  slug: '',
  description: '',
  image_url: '',
  is_active: true,
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<CategoryInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const activeCategories = useMemo(
    () => categories.filter((category) => category.is_active).length,
    [categories],
  )

  const loadCategories = async () => {
    const data = await fetchCategories()
    setCategories((data ?? []) as Category[])
  }

  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      try {
        setLoading(true)
        setErrorMessage('')
        const data = await fetchCategories()
        if (mounted) setCategories((data ?? []) as Category[])
      } catch (error) {
        console.error(error)
        if (mounted) setErrorMessage('Impossible de charger les categories.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void loadInitialData()

    return () => {
      mounted = false
    }
  }, [])

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = event.target
    const nextValue = type === 'checkbox'
      ? (event.target as HTMLInputElement).checked
      : value

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'name' && !editingId ? { slug: toSlug(value) } : {}),
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setErrorMessage('')

    try {
      if (editingId) {
        await updateCategory(editingId, form)
      } else {
        await createCategory(form)
      }

      setForm(emptyForm)
      setEditingId(null)
      await loadCategories()
    } catch (error) {
      console.error(error)
      setErrorMessage("Impossible d'enregistrer la categorie.")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
      is_active: category.is_active ?? true,
    })
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setErrorMessage('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette categorie ?')) return

    try {
      await deleteCategory(id)
      await loadCategories()
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de supprimer la categorie. Elle contient peut-etre des produits.')
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Catalogue</span>
          <h1>Categories</h1>
          <p>Creez les familles de produits avant de renseigner le catalogue.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={resetForm}>
          Nouvelle categorie
        </button>
      </div>

      <div className="admin-stats-grid">
        <div>
          <span>Total categories</span>
          <strong>{categories.length}</strong>
        </div>
        <div>
          <span>Categories actives</span>
          <strong>{activeCategories}</strong>
        </div>
      </div>

      {errorMessage && <p className="admin-alert">{errorMessage}</p>}

      <div className="admin-products-layout">
        <form onSubmit={handleSubmit} className="admin-form admin-product-form">
          <div className="admin-form-heading">
            <h2>{editingId ? 'Modifier la categorie' : 'Ajouter une categorie'}</h2>
            <p>Le slug sert aux liens et aux filtres du catalogue.</p>
          </div>

          <div className="admin-form-grid">
            <label>
              Nom
              <input name="name" value={form.name} onChange={handleChange} placeholder="Soins visage" required />
            </label>
            <label>
              Slug
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="soins-visage" required />
            </label>
          </div>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Courte description de la categorie"
              rows={4}
            />
          </label>

          <label>
            Image
            <input
              type="url"
              name="image_url"
              value={form.image_url}
              onChange={handleChange}
              placeholder="https://exemple.com/categorie.jpg"
            />
          </label>

          {form.image_url.trim() && (
            <div className="admin-image-preview">
              <img src={form.image_url.trim()} alt="Apercu categorie" />
            </div>
          )}

          <div className="admin-toggle-row">
            <label>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              Active
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Ajouter'}
            </button>
            {editingId && (
              <button type="button" className="admin-secondary-button" onClick={resetForm}>
                Annuler
              </button>
            )}
          </div>
        </form>

        <div className="admin-table-card">
          <div className="admin-table-heading">
            <h2>Liste categories</h2>
            <span>{loading ? 'Chargement...' : `${categories.length} element(s)`}</span>
          </div>

          <div className="admin-table">
            {categories.map((category) => (
              <div key={category.id} className="admin-row admin-category-row">
                <div>
                  <strong>{category.name}</strong>
                  <span>{category.slug}</span>
                </div>
                <span className={category.is_active ? 'admin-status active' : 'admin-status muted'}>
                  {category.is_active ? 'Active' : 'Masquee'}
                </span>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => handleEdit(category)}>Modifier</button>
                  <button type="button" onClick={() => handleDelete(category.id)}>Supprimer</button>
                </div>
              </div>
            ))}

            {!loading && categories.length === 0 && (
              <div className="admin-empty-state">
                Aucune categorie pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
