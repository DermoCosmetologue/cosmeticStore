import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../useAuth'

type Order = {
  id: string
  order_number: string
  status: string
  total_amount: number
  payment_status: string
  payment_method: string | null
  created_at: string
  order_items?: {
    product_id: string
    product_name: string
    product_image: string | null
    unit_price: number
    quantity: number
    products?: {
      slug: string | null
      is_active: boolean | null
    } | {
      slug: string | null
      is_active: boolean | null
    }[] | null
  }[]
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

export default function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          status,
          total_amount,
          payment_status,
          payment_method,
          created_at,
          order_items(
            product_id,
            product_name,
            product_image,
            unit_price,
            quantity,
            products(slug, is_active)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setOrders(data as unknown as Order[])
      } else if (error) {
        setErrorMessage(error.message)
      }
      setLoading(false)
    }

    fetchOrders()
  }, [user])

  const totalSpent = orders.reduce((total, order) => total + Number(order.total_amount || 0), 0)

  if (loading) return <div className="container loading-card">Chargement...</div>

  if (!user) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Commandes</span>
        <h1>Connectez-vous pour voir vos commandes.</h1>
        <Link to="/auth" className="btn-primary">Connexion</Link>
      </section>
    )
  }

  return (
    <section className="container orders-page">
      <div className="page-heading compact">
        <span className="eyebrow">Historique</span>
        <h1>Mes commandes</h1>
        <p>Suivez vos achats, leur statut de preparation et le paiement.</p>
      </div>

      {errorMessage && <p className="auth-notice error" role="alert">{errorMessage}</p>}

      {orders.length > 0 && (
        <div className="orders-summary">
          <div>
            <span>Commandes</span>
            <strong>{orders.length}</strong>
          </div>
          <div>
            <span>Total depense</span>
            <strong>{totalSpent.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          <div>
            <span>Derniere commande</span>
            <strong>{formatDate(orders[0].created_at)}</strong>
          </div>
        </div>
      )}

      {!errorMessage && orders.length === 0 ? (
        <section className="empty-state inline">
          <span className="eyebrow">Aucune commande</span>
          <h2>Votre historique est encore vide.</h2>
          <p>Explorez le catalogue et retrouvez ici le suivi de vos achats.</p>
          <Link to="/catalog" className="btn-primary">Voir le catalogue</Link>
        </section>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const itemCount = order.order_items?.reduce(
              (total, item) => total + Number(item.quantity || 0),
              0,
            )
            return (
              <article className="order-card" key={order.id}>
                <div className="order-card-main">
                  <div>
                    <span className="eyebrow">{formatDate(order.created_at)}</span>
                    <h2>{order.order_number || 'Commande'}</h2>
                  </div>
                  <span className={`order-status order-status-${order.status}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>

                <div className="order-meta">
                  <div>
                    <span>Articles</span>
                    <strong>{itemCount ?? 0}</strong>
                  </div>
                  <div>
                    <span>Paiement</span>
                    <strong>{paymentLabels[order.payment_status] || order.payment_status}</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</strong>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
