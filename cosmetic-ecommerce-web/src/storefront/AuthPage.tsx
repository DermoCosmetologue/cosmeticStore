import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

type AuthMode = 'login' | 'signup'
type Notice = { type: 'success' | 'error'; message: string } | null

function getAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : ''

  if (message.includes('Invalid login credentials')) {
    return 'Email ou mot de passe incorrect.'
  }

  if (message.includes('User already registered')) {
    return 'Un compte existe déjà avec cet email.'
  }

  if (message.includes('Password should be at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères.'
  }

  if (message.includes('provider is not enabled')) {
    return "La connexion Google n'est pas activée dans Supabase."
  }

  return "Une erreur est survenue. Vérifiez vos informations puis réessayez."
}

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mode, setMode] = useState<AuthMode>('login')
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const isSignup = mode === 'signup'
  const redirectTo =
    typeof location.state?.from === 'string' &&
    location.state.from.startsWith('/') &&
    !location.state.from.startsWith('//')
      ? location.state.from
      : '/checkout'

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setNotice(null)
    setPassword('')
    setConfirmPassword('')
  }

  const handleGoogleLogin = async () => {
    setNotice(null)
    setGoogleSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', message: getAuthErrorMessage(error) })
      setGoogleSubmitting(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setNotice(null)

    if (isSignup && password !== confirmPassword) {
      setNotice({ type: 'error', message: 'Les mots de passe ne correspondent pas.' })
      return
    }

    if (password.length < 6) {
      setNotice({ type: 'error', message: 'Le mot de passe doit contenir au moins 6 caractères.' })
      return
    }

    setSubmitting(true)

    try {
      if (isSignup) {
        const result = await signUp(email, password, fullName)

        if (result.needsEmailConfirmation) {
          setMode('login')
          setPassword('')
          setConfirmPassword('')
          setNotice({
            type: 'success',
            message: 'Compte créé. Vérifiez votre email pour confirmer votre inscription.',
          })
          return
        }
      } else {
        await signIn(email, password)
      }

      navigate(redirectTo)
    } catch (error) {
      console.error(error)
      setNotice({ type: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="container auth-page">
      <div className="auth-shell">
        <div className="page-heading compact">
          <span className="eyebrow">Compte client</span>
          <h1>{isSignup ? 'Créer un compte' : 'Connexion'}</h1>
          <p>
            {isSignup
              ? 'Créez votre espace client pour commander plus vite et retrouver vos achats.'
              : 'Connectez-vous pour finaliser votre commande et suivre vos achats.'}
          </p>
        </div>

        <div className="auth-panel">
          <div className="auth-tabs" aria-label="Choix du mode de connexion">
            <button
              type="button"
              className={!isSignup ? 'active' : ''}
              onClick={() => switchMode('login')}
            >
              Connexion
            </button>
            <button
              type="button"
              className={isSignup ? 'active' : ''}
              onClick={() => switchMode('signup')}
            >
              Inscription
            </button>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={handleGoogleLogin}
            disabled={googleSubmitting}
          >
            <span aria-hidden="true">G</span>
            {googleSubmitting ? 'Redirection...' : 'Continuer avec Google'}
          </button>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          {notice && (
            <p className={`auth-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>
              {notice.message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignup && (
              <label>
                Nom complet
                <input
                  type="text"
                  placeholder="Aminata Diallo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </label>
            )}

            <label>
              Email
              <input
                type="email"
                placeholder="vous@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </label>

            <label>
              Mot de passe
              <input
                type="password"
                placeholder="6 caractères minimum"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                minLength={6}
                required
              />
            </label>

            {isSignup && (
              <label>
                Confirmer le mot de passe
                <input
                  type="password"
                  placeholder="Répétez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            )}

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Traitement...' : isSignup ? "S'inscrire" : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
