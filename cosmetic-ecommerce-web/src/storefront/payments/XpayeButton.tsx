type XpayeEnvironment = 'production' | 'sandbox'

type XpayeButtonProps = {
  amount: number
  referenceNumber: string
  email: string
  firstName: string
  lastName: string
  phone: string
  description: string
  merchantId?: string
  label?: string
  environment?: XpayeEnvironment
  orderId?: string
}

type XpayePaymentPayload = {
  merchantId: string
  amount: number
  description: string
  channel: string
  countryCurrencyCode: string
  referenceNumber: string
  customerEmail: string
  customerFirstName: string
  customerLastname: string
  customerPhoneNumber: string
  returnURL: string
  returnContext: string
}

type XpayeInitResponse = {
  success?: boolean
  url?: string
  message?: string
  error?: string
}

const XPAYE_INIT_ENDPOINTS: Record<XpayeEnvironment, string> = {
  production: 'https://paiementpro.net/webservice/onlinepayment/js/initialize/initialize.php',
  sandbox: 'https://sandbox.paiementpro.net/webservice/onlinepayment/init/curl-init.php',
}

function createXpayeReference(referenceNumber: string) {
  const normalizedReference = referenceNumber.replace(/[^a-zA-Z0-9-]/g, '-')
  const timestamp = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase()

  return `${normalizedReference}-${timestamp}-${randomPart}`
}

async function initializeXpayePayment(
  payload: XpayePaymentPayload,
  environment: XpayeEnvironment,
) {
  const response = await fetch(XPAYE_INIT_ENDPOINTS[environment], {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return (await response.json()) as XpayeInitResponse
}

export default function XpayeButton({
  amount,
  referenceNumber,
  email,
  firstName,
  lastName,
  phone,
  description,
  merchantId,
  label = 'Payer avec XPAYE',
  environment = 'production',
  orderId,
}: XpayeButtonProps) {
  const startPayment = async () => {
    if (!merchantId) {
      alert("L'identifiant marchand XPAYE est manquant.")
      return
    }

    if (!email || !firstName || !phone) {
      alert('Votre email, nom et telephone sont requis pour lancer le paiement XPAYE.')
      return
    }

    const xpayeReference = createXpayeReference(referenceNumber)

    const paiementPro = await initializeXpayePayment(
      {
        merchantId,
        amount: Math.round(amount),
        channel: 'CARD',
        referenceNumber: xpayeReference,
        customerEmail: email,
        customerFirstName: firstName,
        customerLastname: lastName,
        customerPhoneNumber: phone,
        description,
        countryCurrencyCode: '952',
        returnURL: `${window.location.origin}/orders`,
        returnContext: JSON.stringify({
          orderId,
          orderReference: referenceNumber,
          xpayeReference,
        }),
      },
      environment,
    )

    if (paiementPro.success && paiementPro.url) {
      window.location.href = paiementPro.url
      return
    }

    alert(paiementPro.error || paiementPro.message || "XPAYE n'a pas pu initialiser le paiement.")
  }

  return (
    <button type="button" className="btn-primary" onClick={startPayment}>
      {label}
    </button>
  )
}
