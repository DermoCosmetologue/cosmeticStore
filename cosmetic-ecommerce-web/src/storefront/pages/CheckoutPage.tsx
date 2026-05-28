import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCart } from '../context/useCart'

export default function CheckoutPage() {
  const { items, totalPrice } = useCart()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log({
      fullName,
      phone,
      address,
      city,
      items,
      totalPrice,
    })
    alert('Commande prête à être envoyée à Supabase')
  }

  return (
    <section className="checkout">
      <h1>Checkout</h1>

      <form onSubmit={handleSubmit} className="checkout-form">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Nom complet"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Téléphone"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Adresse"
        />
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Ville"
        />

        <button type="submit" className="btn-primary">
          Confirmer la commande
        </button>
      </form>

      <aside>
        <h3>Résumé</h3>
        <p>{items.length} produit(s)</p>
        <strong>Total : {totalPrice} FCFA</strong>
      </aside>
    </section>
  )
}
