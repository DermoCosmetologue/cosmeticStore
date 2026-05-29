import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../useAuth'

type Profile = {
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .single()

      if (!error && data) {
        setProfile(data as Profile)
      }
      setLoading(false)
    }

    fetchProfile()
  }, [user])

  if (loading) return <div className="container loading-card">Chargement...</div>

  if (!user) {
    return (
      <section className="container empty-state">
        <span className="eyebrow">Compte client</span>
        <h1>Connectez-vous pour voir votre profil.</h1>
        <Link to="/auth" className="btn-primary">Connexion</Link>
      </section>
    )
  }

  const metadataFullName =
    typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : ''
  const displayName = profile?.full_name || metadataFullName || user.email?.split('@')[0] || 'Client'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <section className="container account-page">
      <div className="page-heading compact">
        <span className="eyebrow">Espace client</span>
        <h1>Mon compte</h1>
        <p>Retrouvez vos informations, vos commandes et vos raccourcis beauté.</p>
      </div>

      <div className="account-layout">
        <article className="account-hero-card">
          <div className="account-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          <div>
            <span className="eyebrow">Bienvenue</span>
            <h2>{displayName}</h2>
            <p>{user.email}</p>
          </div>
        </article>

        <aside className="account-actions">
          <Link to="/orders" className="account-action">
            <strong>Mes commandes</strong>
            <span>Voir l'historique et les statuts</span>
          </Link>
          <Link to="/catalog" className="account-action">
            <strong>Continuer mes achats</strong>
            <span>Explorer la sélection premium</span>
          </Link>
        </aside>

        <div className="account-info-card">
          <div className="section-heading compact">
            <span className="eyebrow">Coordonnées</span>
            <h2>Informations personnelles</h2>
          </div>

          <dl className="account-info-list">
            <div>
              <dt>Nom complet</dt>
              <dd>{displayName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Téléphone</dt>
              <dd>{profile?.phone || 'Non renseigné'}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
