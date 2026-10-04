import styles from './LabelChips.module.css'

interface LabelChipsProps {
  labels: string[]
  interactive?: boolean
  active?: string[]
  onToggle?: (label: string) => void
  onRemove?: (label: string) => void
}

export function LabelChips({
  labels,
  interactive = false,
  active = [],
  onToggle,
  onRemove,
}: LabelChipsProps) {
  if (labels.length === 0) return null

  return (
    <ul className={styles.list}>
      {labels.map((label) => {
        const isActive = active.includes(label)
        const className = [styles.chip, isActive ? styles.active : ''].filter(Boolean).join(' ')

        if (interactive && onToggle) {
          return (
            <li key={label}>
              <button
                type="button"
                className={className}
                aria-pressed={isActive}
                onClick={() => onToggle(label)}
              >
                {label}
              </button>
            </li>
          )
        }

        return (
          <li key={label} className={className}>
            {label}
            {onRemove && (
              <button
                type="button"
                className={styles.remove}
                aria-label={`Hapus label ${label}`}
                onClick={() => onRemove(label)}
              >
                ×
              </button>
            )}
          </li>
        )
      })}
    </ul>
  )
}