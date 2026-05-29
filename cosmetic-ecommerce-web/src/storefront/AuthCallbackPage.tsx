import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function AuthCallbackPage() {
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const finishOAuthLogin = async () => {
      const params = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      const oauthError = params.get('error_description') || hashParams.get('error_description')
      const code = params.get('code')

      if (oauthError) {
        setErrorMessage(oauthError)
        return
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          const { data } = await supabase.auth.getSession()
          if (!data.session) {
            setErrorMessage(error.message)
            return
          }
        }
      } else {
        const { data } = await supabase.auth.getSession()
        if (!data.session) {
          setErrorMessage('Session Google introuvable. Réessayez la connexion.')
          return
        }
      }

      navigate('/checkout', { replace: true })
    }

    finishOAuthLogin()
  }, [navigate])

  if (errorMessage) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Connexion Google</span>
        <h1>Connexion impossible</h1>
        <p>{errorMessage}</p>
        <Link to="/auth" className="btn-primary">Retour à la connexion</Link>
      </section>
    )
  }

  return <div className="container loading-card">Connexion Google en cours...</div>
}
