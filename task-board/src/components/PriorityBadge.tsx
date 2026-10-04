import type { Priority } from '../types'
import { PRIORITY_LABEL } from '../lib/board'
import styles from './PriorityBadge.module.css'

interface PriorityBadgeProps {
  priority: Priority
  interactive?: boolean
  active?: boolean
  onToggle?: (priority: Priority) => void
}

export function PriorityBadge({
  priority,
  interactive = false,
  active = false,
  onToggle,
}: PriorityBadgeProps) {
  const className = [styles.badge, styles[priority], active ? styles.active : '']
    .filter(Boolean)
    .join(' ')

  if (!interactive || !onToggle) {
    return <span className={className}>{PRIORITY_LABEL[priority]}</span>
  }

  return (
    <button
      type="button"
      className={className}
      aria-pressed={active}
      onClick={() => onToggle(priority)}
    >
      {PRIORITY_LABEL[priority]}
    </button>
  )
}