type Props = {
  quantity: number
  onIncrease: () => void
  onDecrease: () => void
}

export default function QuantitySelector({ quantity, onIncrease, onDecrease }: Props) {
  return (
    <div className="qty-selector">
      <button onClick={onDecrease}>-</button>
      <span>{quantity}</span>
      <button onClick={onIncrease}>+</button>
    </div>
  )
}