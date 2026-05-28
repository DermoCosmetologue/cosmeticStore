import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <section className="home-hero">
      <h1>Produits cosmétiques premium</h1>
      <p>Découvre des soins, parfums et produits beauté sélectionnés avec soin.</p>
      <Link to="/catalog" className="btn-primary">Voir les produits</Link>
    </section>
  )
}