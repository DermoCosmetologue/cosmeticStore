type Props = {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

export default function QuantitySelector({ quantity, onIncrease, onDecrease }: Props) {
  return (
    <div className="qty-selector" aria-label="Quantité">
      <button type="button" onClick={onDecrease} aria-label="Diminuer la quantité">-</button>
      <span>{quantity}</span>
      <button type="button" onClick={onIncrease} aria-label="Augmenter la quantité">+</button>
    </div>
  )
}
