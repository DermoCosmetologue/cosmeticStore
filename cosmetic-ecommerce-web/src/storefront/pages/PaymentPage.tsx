import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../useAuth'
import XpayeButton from '../payments/XpayeButton'

type OrderAddress = {
  full_name: string | null
  phone: string | null
}

type Order = {
  id: string
  order_number: string | null
  total_amount: number
  status: string
  payment_status: string
  payment_method: string | null
  created_at: string
  addresses?: OrderAddress | OrderAddress[] | null
}

const statusLabels: Record<string, string> = {
  pending_payment: 'Paiement attendu',
  pending: 'En attente',
  paid: 'Payee',
  processing: 'Preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
  refunded: 'Remboursee',
}

const paymentLabels: Record<string, string> = {
  unpaid: 'Impaye',
  pending: 'En attente',
  paid: 'Paye',
  failed: 'Echoue',
  refunded: 'Rembourse',
}

function getOrderAddress(order: Order) {
  return Array.isArray(order.addresses) ? order.addresses[0] : order.addresses
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || 'Client',
    lastName: parts.slice(1).join(' ') || parts[0] || 'Client',
  }
}

export default function PaymentPage() {
  const { orderId } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirmingDeliveryPayment, setConfirmingDeliveryPayment] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchOrder = async () => {
      if (authLoading) return

      if (!user || !orderId) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          payment_status,
          payment_method,
          created_at,
          addresses(full_name, phone)
        `)
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        setErrorMessage(error.message)
      } else {
        setOrder(data as Order | null)
      }

      setLoading(false)
    }

    void fetchOrder()
  }, [authLoading, orderId, user])

  const handleDeliveryPayment = async () => {
    if (!order || !user) return

    setConfirmingDeliveryPayment(true)
    setErrorMessage('')

    const { error } = await supabase
      .from('orders')
      .update({
        status: 'processing',
        payment_status: 'pending',
        payment_method: 'cash_on_delivery',
      })
      .eq('id', order.id)
      .eq('user_id', user.id)

    if (error) {
      setErrorMessage(error.message)
    } else {
      setOrder({
        ...order,
        status: 'processing',
        payment_status: 'pending',
        payment_method: 'cash_on_delivery',
      })
    }

    setConfirmingDeliveryPayment(false)
  }

  if (authLoading || loading) {
    return <div className="container loading-card">Chargement du paiement...</div>
  }

  if (!user) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Paiement</span>
        <h1>Connectez-vous pour payer votre commande.</h1>
        <Link to="/auth" className="btn-primary">Connexion</Link>
      </section>
    )
  }

  if (!order) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Paiement</span>
        <h1>Commande introuvable.</h1>
        {errorMessage && <p>{errorMessage}</p>}
        <Link to="/orders" className="btn-primary">Retour aux commandes</Link>
      </section>
    )
  }

  const address = getOrderAddress(order)
  const metadataFullName =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
  const fullName = address?.full_name || metadataFullName || user.email?.split('@')[0] || 'Client'
  const { firstName, lastName } = splitFullName(fullName)
  const merchantId = import.meta.env.VITE_XPAYE_MERCHANT_ID
  const xpayeEnvironment =
    import.meta.env.VITE_XPAYE_ENV === 'sandbox' ? 'sandbox' : 'production'

  return (
    <section className="container payment-page">
      <div className="page-heading compact">
        <span className="eyebrow">Paiement</span>
        <h1>Regler la commande</h1>
        <p>Finalisez le paiement pour lancer la preparation de votre commande.</p>
      </div>

      <div className="payment-layout">
        <article className="payment-panel">
          <span className="eyebrow">Commande</span>
          <h2>{order.order_number || 'Commande'}</h2>

          <dl className="payment-details">
            <div>
              <dt>Statut</dt>
              <dd>{statusLabels[order.status] || order.status}</dd>
            </div>
            <div>
              <dt>Paiement</dt>
              <dd>{paymentLabels[order.payment_status] || order.payment_status}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</dd>
            </div>
          </dl>

          <div className="payment-actions">
            {order.payment_method !== 'cash_on_delivery' && (
              <XpayeButton
                amount={Number(order.total_amount || 0)}
                referenceNumber={order.order_number || order.id}
                email={user.email || ''}
                firstName={firstName}
                lastName={lastName}
                phone={address?.phone || ''}
                description={`Paiement commande ${order.order_number || order.id}`}
                merchantId={merchantId}
                environment={xpayeEnvironment}
                orderId={order.id}
                label="Payer maintenant"
              />
            )}
            {order.payment_status !== 'paid' && (
              <button
                type="button"
                className="btn-secondary"
                disabled={confirmingDeliveryPayment}
                onClick={handleDeliveryPayment}
              >
                {confirmingDeliveryPayment ? 'Confirmation...' : 'Payer a la livraison'}
              </button>
            )}
            <Link to="/orders" className="btn-secondary">Retour aux commandes</Link>
          </div>
        </article>

        <aside className="payment-note">
          <span className="eyebrow">XPAYE</span>
          <p>
            Payez en ligne avec XPAYE ou choisissez le paiement a la livraison.
          </p>
        </aside>
      </div>
    </section>
  )
}
