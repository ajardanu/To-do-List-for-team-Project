import type { Filters, Priority } from '../types'
import { PRIORITIES } from '../types'
import { LabelChips } from './LabelChips'
import { PriorityBadge } from './PriorityBadge'
import styles from './FilterBar.module.css'

interface FilterBarProps {
  filters: Filters
  labels: string[]
  resultCount: number
  onChange: (patch: Partial<Filters>) => void
  onReset: () => void
}

export function FilterBar({
  filters,
  labels,
  resultCount,
  onChange,
  onReset,
}: FilterBarProps) {
  function togglePriority(priority: Priority) {
    const next = filters.priorities.includes(priority)
      ? filters.priorities.filter((item) => item !== priority)
      : [...filters.priorities, priority]
    onChange({ priorities: next })
  }

  function toggleLabel(label: string) {
    const next = filters.labels.includes(label)
      ? filters.labels.filter((item) => item !== label)
      : [...filters.labels, label]
    onChange({ labels: next })
  }

  const dirty =
    filters.query !== '' ||
    filters.priorities.length > 0 ||
    filters.labels.length > 0 ||
    filters.hideDone

  return (
    <section className={styles.bar} aria-label="Filter tugas">
      <input
        className={styles.search}
        type="search"
        value={filters.query}
        placeholder="Cari judul, catatan, atau label..."
        aria-label="Cari tugas"
        onChange={(event) => onChange({ query: event.target.value })}
      />

      <div className={styles.group}>
        <span className={styles.groupLabel}>Prioritas</span>
        {PRIORITIES.map((priority) => (
          <PriorityBadge
            key={priority}
            priority={priority}
            interactive
            active={filters.priorities.includes(priority)}
            onToggle={togglePriority}
          />
        ))}
      </div>

      {labels.length > 0 && (
        <div className={styles.group}>
          <span className={styles.groupLabel}>Label</span>
          <LabelChips
            labels={labels}
            interactive
            active={filters.labels}
            onToggle={toggleLabel}
          />
        </div>
      )}

      <div className={styles.foot}>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={filters.hideDone}
            onChange={(event) => onChange({ hideDone: event.target.checked })}
          />
          Sembunyikan yang selesai
        </label>
        <div className={styles.footActions}>
          <span className={styles.count}>{resultCount} tugas tampil</span>
          <button type="button" onClick={onReset} disabled={!dirty}>
            Reset filter
          </button>
        </div>
      </div>
    </section>
  )
}