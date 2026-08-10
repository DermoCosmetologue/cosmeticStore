import { useEffect, useMemo, useState } from 'react'
import OrderDetails from './OrderDetails'
import {
  getOrders,
  updateOrderStatus,
  updatePaymentStatus,
  type AdminOrder,
  type AdminOrderStatus,
  type AdminPaymentStatus,
} from './OrderService'

const statusLabels: Record<AdminOrderStatus, string> = {
  pending_payment: 'Paiement attendu',
  pending: 'En attente',
  paid: 'Payee',
  processing: 'Preparation',
  shipped: 'Expediee',
  delivered: 'Livree',
  cancelled: 'Annulee',
  refunded: 'Remboursee',
}

const paymentLabels: Record<AdminPaymentStatus, string> = {
  unpaid: 'Impaye',
  pending: 'A encaisser',
  paid: 'Paye',
  failed: 'Echoue',
  refunded: 'Rembourse',
}

const orderStatuses = Object.keys(statusLabels) as AdminOrderStatus[]
const paymentStatuses = Object.keys(paymentLabels) as AdminPaymentStatus[]

function getRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminOrderStatus>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | AdminPaymentStatus>('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [filterReferenceTime] = useState(() => Date.now())

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((order) => order.payment_status === 'paid')
        .reduce((total, order) => total + Number(order.total_amount || 0), 0),
    [orders],
  )

  const pendingOrders = useMemo(
    () => orders.filter((order) => ['pending_payment', 'pending'].includes(order.status)).length,
    [orders],
  )

  const paymentMethods = useMemo(
    () =>
      Array.from(
        new Set(orders.map((order) => order.payment_method).filter((method): method is string => Boolean(method))),
      ),
    [orders],
  )

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return orders.filter((order) => {
      const address = getRelation(order.addresses)
      const profile = getRelation(order.profiles)
      const haystack = [
        order.order_number,
        address?.full_name,
        address?.phone,
        profile?.full_name,
        profile?.phone,
        order.payment_method,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const createdAt = new Date(order.created_at).getTime()
      const isInDateRange =
        dateFilter === 'all' ||
        (dateFilter === 'today' && filterReferenceTime - createdAt <= 24 * 60 * 60 * 1000) ||
        (dateFilter === 'week' && filterReferenceTime - createdAt <= 7 * 24 * 60 * 60 * 1000) ||
        (dateFilter === 'month' && filterReferenceTime - createdAt <= 30 * 24 * 60 * 60 * 1000)

      return (
        (!query || haystack.includes(query)) &&
        (statusFilter === 'all' || order.status === statusFilter) &&
        (paymentFilter === 'all' || order.payment_status === paymentFilter) &&
        (methodFilter === 'all' || order.payment_method === methodFilter) &&
        isInDateRange
      )
    })
  }, [dateFilter, filterReferenceTime, methodFilter, orders, paymentFilter, searchTerm, statusFilter])

  const resetFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPaymentFilter('all')
    setMethodFilter('all')
    setDateFilter('all')
  }

  const loadOrders = async () => {
    try {
      setLoading(true)
      setErrorMessage('')
      const data = await getOrders()
      setOrders(data ?? [])
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de charger les commandes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const handleStatusChange = async (id: string, status: AdminOrderStatus) => {
    try {
      setSavingOrderId(id)
      await updateOrderStatus(id, status)
      await loadOrders()
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de mettre a jour le statut.')
    } finally {
      setSavingOrderId(null)
    }
  }

  const handlePaymentStatusChange = async (id: string, status: AdminPaymentStatus) => {
    try {
      setSavingOrderId(id)
      await updatePaymentStatus(id, status)
      await loadOrders()
    } catch (error) {
      console.error(error)
      setErrorMessage('Impossible de mettre a jour le paiement.')
    } finally {
      setSavingOrderId(null)
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-kicker">Commandes</span>
          <h1>Gestion des commandes</h1>
          <p>Suivez les statuts, le paiement et les informations de livraison.</p>
        </div>
      </div>

      {errorMessage && <p className="admin-alert">{errorMessage}</p>}

      <div className="admin-stats-grid">
        <div>
          <span>Total commandes</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>En attente</span>
          <strong>{pendingOrders}</strong>
        </div>
        <div>
          <span>CA paye</span>
          <strong>{totalRevenue.toLocaleString('fr-FR')} FCFA</strong>
        </div>
      </div>

      <div className="admin-filter-panel">
        <label>
          Recherche
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Commande, client, telephone..."
          />
        </label>

        <label>
          Statut commande
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | AdminOrderStatus)}
          >
            <option value="all">Tous</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Statut paiement
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value as 'all' | AdminPaymentStatus)}
          >
            <option value="all">Tous</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {paymentLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label>
          Methode
          <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
            <option value="all">Toutes</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>

        <label>
          Periode
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
            <option value="all">Toutes</option>
            <option value="today">24 dernieres heures</option>
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
          </select>
        </label>

        <button type="button" className="admin-secondary-button" onClick={resetFilters}>
          Reinitialiser
        </button>
      </div>

      <div className="admin-table-card">
        <div className="admin-table-heading">
          <div>
            <span>Historique</span>
            <h2>{filteredOrders.length} commande(s)</h2>
          </div>
          <button type="button" className="admin-secondary-button" onClick={() => void loadOrders()}>
            Actualiser
          </button>
        </div>

        {loading ? (
          <p className="admin-empty-state">Chargement des commandes...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="admin-empty-state">Aucune commande ne correspond aux filtres.</p>
        ) : (
          <div className="admin-table">
            {filteredOrders.map((order) => {
              const address = getRelation(order.addresses)
              const itemCount = (order.order_items ?? []).reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              )

              return (
                <article className="admin-order-card" key={order.id}>
                  <div className="admin-order-row">
                    <div>
                      <strong>{order.order_number || 'Commande'}</strong>
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                    <div>
                      <strong>{address?.full_name || 'Client'}</strong>
                      <span>{address?.phone || 'Telephone non renseigne'}</span>
                    </div>
                    <div>
                      <strong>{Number(order.total_amount || 0).toLocaleString('fr-FR')} FCFA</strong>
                      <span>{itemCount} article(s)</span>
                    </div>
                    <select
                      value={order.status}
                      disabled={savingOrderId === order.id}
                      onChange={(e) =>
                        void handleStatusChange(order.id, e.target.value as AdminOrderStatus)
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={order.payment_status}
                      disabled={savingOrderId === order.id}
                      onChange={(e) =>
                        void handlePaymentStatusChange(order.id, e.target.value as AdminPaymentStatus)
                      }
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {paymentLabels[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={() =>
                        setExpandedOrderId(expandedOrderId === order.id ? null : order.id)
                      }
                    >
                      {expandedOrderId === order.id ? 'Masquer' : 'Details'}
                    </button>
                  </div>

                  {expandedOrderId === order.id && <OrderDetails order={order} />}
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
