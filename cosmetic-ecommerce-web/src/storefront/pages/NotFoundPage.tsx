import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <section className="container empty-state">
      <span className="eyebrow">404</span>
      <h1>Page introuvable</h1>
      <p>Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary">Retour à l'accueil</Link>
    </section>
  )
}
