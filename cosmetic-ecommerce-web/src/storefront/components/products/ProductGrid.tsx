import ProductCard from './ProductCard'

type Product = {
  id: string
  name: string
  slug: string
  short_description: string | null
  price: number
  thumbnail: string | null
}

export default function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}