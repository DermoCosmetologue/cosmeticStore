import { useEffect, useMemo, useState } from 'react'
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  replaceProductImages,
  updateProduct,
  uploadProductDescriptionImageFiles,
  uploadProductImageFiles,
} from './ProductService'
import type { ProductInput } from './ProductService'
import { fetchCategories } from '../categories/CategoriesService'

type Category = {
  id: string
  name: string
  slug: string
}

type Product = ProductInput & {
  id: string
  created_at?: string
  categories?: {
    name: string
  } | null
  product_images?: ProductImage[]
}

type ProductImage = {
  id: string
  image_url: string
  alt_text: string | null
  sort_order: number
}

const emptyForm: ProductInput = {
  category_id: '',
  name: '',
  slug: '',
  description: '',
  short_description: '',
  price: 0,
  wholesale_price: null,
  wholesale_min_quantity: 6,
  is_wholesale_enabled: false,
  is_recommended: false,
  stock: 0,
  brand: '',
  ingredient_list: '',
  skin_type: '',
  size: '',
  shade: '',
  is_featured: false,
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

function appendDescriptionImages(description: string, imageUrls: string[], productName: string) {
  const cleanUrls = imageUrls.map((url) => url.trim()).filter(Boolean)

  if (cleanUrls.length === 0) return description

  const markdownImages = cleanUrls.map(
    (url, index) => `![${productName || 'Image description'} ${index + 1}](${url})`,
  )
  const currentDescription = description.trimEnd()

  return [currentDescription, ...markdownImages].filter(Boolean).join('\n\n')
}

function getSaveErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : String(error)

  if (/row-level security|permission denied|not authorized/i.test(message)) {
    return "Enregistrement refuse : votre compte n'a pas les droits administrateur Supabase."
  }

  if (/bucket|storage|mime|file size/i.test(message)) {
    return "Le produit a ete cree, mais l'image n'a pas pu etre importee. Verifiez le bucket product-images et ses droits."
  }

  if (/duplicate key|unique|slug/i.test(message)) {
    return "Ce slug est deja utilise. Choisissez-en un autre."
  }

  return `Impossible d'enregistrer le produit : ${message}`
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductInput>(emptyForm)
  const [imageUrls, setImageUrls] = useState<string[]>([''])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [descriptionImageUrls, setDescriptionImageUrls] = useState<string[]>([''])
  const [descriptionImageFiles, setDescriptionImageFiles] = useState<File[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const totalStock = useMemo(
    () => products.reduce((total, product) => total + Number(product.stock || 0), 0),
    [products],
  )
  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active).length,
    [products],
  )

  const loadProducts = async () => {
    const data = await fetchProducts()
    setProducts((data ?? []) as Product[])
  }

  useEffect(() => {
    let mounted = true

    const loadInitialData = async () => {
      try {
        setLoading(true)
        setErrorMessage('')
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
        ])

        if (!mounted) return
        setProducts((productsData ?? []) as Product[])
        setCategories((categoriesData ?? []) as Category[])
      } catch (error) {
        console.error(error)
        if (mounted) setErrorMessage('Impossible de charger les produits.')
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target
    const nextValue =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
          ? Number(value)
          : value

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(name === 'name' && !editingId ? { slug: toSlug(value) } : {}),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setErrorMessage('')

    try {
      const urlImages = imageUrls.map((url) => url.trim()).filter(Boolean)
      const descriptionUrlImages = descriptionImageUrls.map((url) => url.trim()).filter(Boolean)
      let productId = editingId

      if (!productId) {
        const createdProduct = await createProduct(form)
        productId = createdProduct.id
      }

      const productPayload = {
        ...form,
        wholesale_price: form.is_wholesale_enabled ? form.wholesale_price : null,
        wholesale_min_quantity: form.is_wholesale_enabled ? form.wholesale_min_quantity : 0,
        is_wholesale_enabled: form.is_wholesale_enabled,
      }

      const uploadedUrls = productId && imageFiles.length > 0
        ? await uploadProductImageFiles(productId, imageFiles)
        : []
      const uploadedDescriptionUrls = productId && descriptionImageFiles.length > 0
        ? await uploadProductDescriptionImageFiles(productId, descriptionImageFiles)
        : []
      const finalPayload = {
        ...productPayload,
        description: appendDescriptionImages(
          form.description,
          [...descriptionUrlImages, ...uploadedDescriptionUrls],
          form.name,
        ),
      }

      if (productId) {
        await updateProduct(productId, finalPayload)
      }

      const productImages = [...urlImages, ...uploadedUrls].map((image_url, index) => ({
        image_url,
        alt_text: `${form.name} image ${index + 1}`,
        sort_order: index,
      }))

      if (productId) {
        await replaceProductImages(productId, productImages)
      }

      setForm(emptyForm)
      setImageUrls([''])
      setImageFiles([])
      setDescriptionImageUrls([''])
      setDescriptionImageFiles([])
      setEditingId(null)
      await loadProducts()
    } catch (error) {
      console.error(error)
      setErrorMessage(getSaveErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product: Product) => {
    const sortedImages = [...(product.product_images ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    )

    setEditingId(product.id)
    setForm({
      category_id: product.category_id || '',
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      short_description: product.short_description || '',
      price: Number(product.price || 0),
      wholesale_price: product.wholesale_price != null ? Number(product.wholesale_price) : null,
      wholesale_min_quantity: Number(product.wholesale_min_quantity || 0),
      is_wholesale_enabled: Boolean(product.is_wholesale_enabled),
      is_recommended: Boolean(product.is_recommended),
      stock: Number(product.stock || 0),
      brand: product.brand || '',
      ingredient_list: product.ingredient_list || '',
      skin_type: product.skin_type || '',
      size: product.size || '',
      shade: product.shade || '',
      is_featured: Boolean(product.is_featured),
      is_active: product.is_active ?? true,
    })
    setImageUrls(sortedImages.length > 0 ? sortedImages.map((image) => image.image_url) : [''])
    setImageFiles([])
    setDescriptionImageUrls([''])
    setDescriptionImageFiles([])
  }

  const resetForm = () => {
    setForm(emptyForm)
    setImageUrls([''])
    setImageFiles([])
    setDescriptionImageUrls([''])
    setDescriptionImageFiles([])
    setEditingId(null)
    setErrorMessage('')
  }

  const updateImageUrl = (index: number, value: string) => {
    setImageUrls((prev) => prev.map((url, currentIndex) => (currentIndex === index ? value : url)))
  }

  const addImageUrl = () => {
    setImageUrls((prev) => [...prev, ''])
  }

  const removeImageUrl = (index: number) => {
    setImageUrls((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  const handleImageFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageFiles(Array.from(event.target.files ?? []))
  }

  const updateDescriptionImageUrl = (index: number, value: string) => {
    setDescriptionImageUrls((prev) =>
      prev.map((url, currentIndex) => (currentIndex === index ? value : url)),
    )
  }

  const addDescriptionImageUrl = () => {
    setDescriptionImageUrls((prev) => [...prev, ''])
  }

  const removeDescriptionImageUrl = (index: number) => {
    setDescriptionImageUrls((prev) =>
      prev.length === 1 ? [''] : prev.filter((_, currentIndex) => currentIndex !== index),
    )
  }

  const handleDescriptionImageFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDescriptionImageFiles(Array.from(event.target.files ?? []))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return

    try {
      await deleteProduct(id)
      await loadProducts()
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de supprimer le produit.')
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Catalogue</span>
          <h1>Produits</h1>
          <p>Gérez les références, le stock, les prix et la visibilité boutique.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={resetForm}>
          Nouveau produit
        </button>
      </div>

      <div className="admin-stats-grid">
        <div>
          <span>Total produits</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Produits actifs</span>
          <strong>{activeProducts}</strong>
        </div>
        <div>
          <span>Stock global</span>
          <strong>{totalStock}</strong>
        </div>
      </div>

      {errorMessage && <p className="admin-alert">{errorMessage}</p>}

      <div className="admin-products-layout">
        <form onSubmit={handleSubmit} className="admin-form admin-product-form">
          <div className="admin-form-heading">
            <h2>{editingId ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
            <p>Les champs principaux alimentent la boutique publique.</p>
          </div>

          <label>
            Catégorie
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Choisir une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-grid">
            <label>
              Nom
              <input name="name" value={form.name} onChange={handleChange} placeholder="Sérum éclat" required />
            </label>
            <label>
              Slug
              <input name="slug" value={form.slug} onChange={handleChange} placeholder="serum-eclat" required />
            </label>
          </div>

          <label>
            Description courte
            <input
              name="short_description"
              value={form.short_description}
              onChange={handleChange}
              placeholder="Une phrase claire pour la carte produit"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Détails, bénéfices, conseils d'utilisation. Image manuelle : ![Texte](https://...)"
              rows={6}
            />
          </label>

          <div className="admin-image-fields">
            <div className="admin-form-heading compact">
              <h2>Images dans la description</h2>
              <p>Ces images seront ajoutees a la fin de la description du produit.</p>
            </div>

            {descriptionImageUrls.map((url, index) => (
              <div className="admin-image-field" key={index}>
                <label>
                  Image description {index + 1}
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => updateDescriptionImageUrl(index, event.target.value)}
                    placeholder="https://exemple.com/detail-produit.jpg"
                  />
                </label>

                {url.trim() && <img src={url.trim()} alt={`Apercu description ${index + 1}`} />}

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() => removeDescriptionImageUrl(index)}
                >
                  Retirer
                </button>
              </div>
            ))}

            <button type="button" className="admin-secondary-button" onClick={addDescriptionImageUrl}>
              Ajouter une image de description
            </button>

            <label>
              Importer des images de description
              <input type="file" accept="image/*" multiple onChange={handleDescriptionImageFilesChange} />
            </label>

            {descriptionImageFiles.length > 0 && (
              <p className="admin-help-text">
                {descriptionImageFiles.length} image(s) de description prete(s) a envoyer.
              </p>
            )}
          </div>

          <div className="admin-form-grid">
            <label>
              Prix boutique
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} />
            </label>
            <label>
              Stock
              <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} />
            </label>
          </div>

          <div className="admin-toggle-row">
            <label>
              <input
                type="checkbox"
                name="is_wholesale_enabled"
                checked={form.is_wholesale_enabled}
                onChange={handleChange}
              />
              Activer la vente en gros
            </label>
          </div>

          {form.is_wholesale_enabled && (
            <div className="admin-form-grid">
              <label>
                Prix gros
                <input
                  name="wholesale_price"
                  type="number"
                  min="0"
                  value={form.wholesale_price ?? ''}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      wholesale_price: event.target.value === '' ? null : Number(event.target.value),
                    }))
                  }
                />
              </label>
              <label>
                Seuil gros (50 pièces pour toute la commande)
                <input
                  name="wholesale_min_quantity"
                  type="number"
                  min="0"
                  value={form.wholesale_min_quantity}
                  onChange={handleChange}
                />
              </label>
            </div>
          )}

          <div className="admin-form-grid">
            <label>
              Marque
              <input name="brand" value={form.brand} onChange={handleChange} placeholder="Marque" />
            </label>
            <label>
              Type de peau
              <input name="skin_type" value={form.skin_type} onChange={handleChange} placeholder="Tous types" />
            </label>
          </div>

          <div className="admin-form-grid">
            <label>
              Taille
              <input name="size" value={form.size} onChange={handleChange} placeholder="50 ml" />
            </label>
            <label>
              Teinte
              <input name="shade" value={form.shade} onChange={handleChange} placeholder="Naturel" />
            </label>
          </div>

          <label>
            Ingrédients
            <input
              name="ingredient_list"
              value={form.ingredient_list}
              onChange={handleChange}
              placeholder="Liste des ingrédients clés"
            />
          </label>

          <div className="admin-image-fields">
            <div className="admin-form-heading compact">
              <h2>Images produit</h2>
              <p>Ajoutez une ou plusieurs URL. La premiere image sera la miniature boutique.</p>
            </div>

            {imageUrls.map((url, index) => (
              <div className="admin-image-field" key={index}>
                <label>
                  Image {index + 1}
                  <input
                    type="url"
                    value={url}
                    onChange={(event) => updateImageUrl(index, event.target.value)}
                    placeholder="https://exemple.com/image-produit.jpg"
                  />
                </label>

                {url.trim() && <img src={url.trim()} alt={`Apercu produit ${index + 1}`} />}

                <button type="button" className="admin-secondary-button" onClick={() => removeImageUrl(index)}>
                  Retirer
                </button>
              </div>
            ))}

            <button type="button" className="admin-secondary-button" onClick={addImageUrl}>
              Ajouter une image
            </button>

            <label>
              Importer depuis l'ordinateur
              <input type="file" accept="image/*" multiple onChange={handleImageFilesChange} />
            </label>

            {imageFiles.length > 0 && (
              <p className="admin-help-text">{imageFiles.length} fichier(s) pret(s) a envoyer.</p>
            )}
          </div>

          <div className="admin-toggle-row">
            <label>
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} />
              Produit vedette
            </label>
            <label>
              <input type="checkbox" name="is_recommended" checked={form.is_recommended} onChange={handleChange} />
              Recommandé
            </label>
            <label>
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              Actif
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button" disabled={saving}>
              {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter'}
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
            <h2>Liste produits</h2>
            <span>{loading ? 'Chargement...' : `${products.length} élément(s)`}</span>
          </div>

          <div className="admin-table">
            {products.map((product) => (
              <div key={product.id} className="admin-row">
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.categories?.name || 'Sans catégorie'}</span>
                </div>
                <span>{Number(product.price).toLocaleString('fr-FR')} FCFA</span>
                <span>Stock {product.stock}</span>
                <span className={product.is_active ? 'admin-status active' : 'admin-status muted'}>
                  {product.is_active ? 'Actif' : 'Masqué'}
                </span>
                <div className="admin-row-actions">
                  <button type="button" onClick={() => handleEdit(product)}>Modifier</button>
                  <button type="button" onClick={() => handleDelete(product.id)}>Supprimer</button>
                </div>
              </div>
            ))}

            {!loading && products.length === 0 && (
              <div className="admin-empty-state">
                Aucun produit pour le moment.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
