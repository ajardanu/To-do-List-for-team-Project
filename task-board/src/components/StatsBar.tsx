import type { BoardStats } from '../lib/board'
import styles from './StatsBar.module.css'

interface StatsBarProps {
  stats: BoardStats
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Total', value: stats.total, tone: 'neutral' },
    { label: 'To Do', value: stats.todo, tone: 'neutral' },
    { label: 'Doing', value: stats.doing, tone: 'accent' },
    { label: 'Done', value: stats.done, tone: 'success' },
    { label: 'Telat', value: stats.overdue, tone: stats.overdue > 0 ? 'danger' : 'neutral' },
    { label: 'Selesai hari ini', value: stats.doneToday, tone: 'success' },
  ]

  return (
    <section className={styles.bar} aria-label="Ringkasan papan">
      <ul className={styles.items}>
        {items.map((item) => (
          <li key={item.label} className={styles.item}>
            <span className={[styles.value, styles[item.tone]].filter(Boolean).join(' ')}>
              {item.value}
            </span>
            <span className={styles.label}>{item.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.progress}>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${stats.progress}%` }} />
        </div>
        <span className={styles.progressText}>{stats.progress}% selesai</span>
      </div>
    </section>
  )
}