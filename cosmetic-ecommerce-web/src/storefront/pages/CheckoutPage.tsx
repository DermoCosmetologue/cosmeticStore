import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { useAuth } from '../useAuth'
import { createOrderWithItems } from '../services/checkoutService'

function getCheckoutErrorMessage(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error !== null && 'message' in error
        ? String(error.message)
        : ''

  if (message.includes('Could not find the function')) {
    return "La fonction SQL de commande n'est pas encore installee dans Supabase."
  }

  if (message.includes('violates foreign key constraint') || message.includes('profiles')) {
    return "Votre profil client n'existe pas encore dans Supabase. Reconnectez-vous puis reessayez."
  }

  if (message.includes('Stock insuffisant')) {
    return message
  }

  if (message.includes('Produit introuvable')) {
    return 'Un produit du panier est introuvable ou desactive.'
  }

  if (message.includes('row-level security')) {
    return "Supabase bloque l'enregistrement. Verifiez les politiques RLS et la fonction de commande."
  }

  if (message.includes('Failed to fetch') || message.includes('NetworkError')) {
    return "Impossible de joindre Supabase. Verifiez votre connexion, puis rechargez la page avant de reessayer."
  }

  return message || "Erreur lors de l'enregistrement de la commande."
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart, isWholesaleOrder } = useCart()
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine1, setAddressLine1] = useState('')
  const [city, setCity] = useState('')
  const [district, setDistrict] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (loading) {
    return <div className="container loading-card">Chargement...</div>
  }

  if (items.length === 0) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Checkout</span>
        <h1>Aucun produit à commander.</h1>
        <Link to="/catalog" className="btn-primary">Retour au catalogue</Link>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Compte client</span>
        <h1>Connectez-vous avant de commander.</h1>
        <p>Votre panier est prêt. Il ne reste qu'à vous connecter pour l'enregistrer.</p>
        <button type="button" onClick={() => navigate('/auth')} className="btn-primary">
          Se connecter
        </button>
      </section>
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      const orderId = await createOrderWithItems({
        userId: user.id,
        address: {
          full_name: fullName,
          phone,
          city,
          district,
          address_line1: addressLine1,
          country: 'CI',
        },
        items: items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
        })),
        paymentMethod: 'xpaye',
        notes: 'Commande créée depuis le site public',
      })

      clearCart()
      alert('Commande enregistrée avec succès')
      navigate(`/payment/${orderId}`)
    } catch (error) {
      console.error(error)
      setErrorMessage(getCheckoutErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container checkout-page">
      <div className="page-heading compact">
        <span className="eyebrow">Checkout sécurisé</span>
        <h1>Finaliser la commande</h1>
        <p>Renseignez vos informations de livraison pour préparer votre commande.</p>
      </div>

      <div className="checkout">
        <form onSubmit={handleSubmit} className="checkout-form">
          {errorMessage && <p className="auth-notice error" role="alert">{errorMessage}</p>}

          <label>
            Nom complet
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aminata Diallo"
              required
            />
          </label>
          <label>
            Téléphone
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+225 00 00 00 00 00"
              required
            />
          </label>
          <label>
            Adresse
            <input
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="Rue, quartier, repère"
              required
            />
          </label>
          <label>
            Ville
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Abidjan"
              required
            />
          </label>
          <label>
            Quartier
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Cocody"
            />
          </label>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Envoi...' : 'Confirmer la commande'}
          </button>
        </form>

        <aside className="checkout-summary">
          <span className="eyebrow">Résumé</span>
          <p>{totalItems} pièce(s) · {items.length} produit(s)</p>
          <strong>{isWholesaleOrder ? 'Total grossiste' : 'Total normal'} : {totalPrice.toLocaleString('fr-FR')} FCFA</strong>
        </aside>
      </div>
    </section>
  )
}
