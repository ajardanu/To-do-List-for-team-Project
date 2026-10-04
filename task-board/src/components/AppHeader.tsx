import { formatDate, todayISO } from '../lib/date'
import type { Theme } from '../lib/theme'
import styles from './AppHeader.module.css'

interface AppHeaderProps {
  onAdd: () => void
  onClearDone: () => void
  doneCount: number
  theme: Theme
  onToggleTheme: () => void
}

export function AppHeader({
  onAdd,
  onClearDone,
  doneCount,
  theme,
  onToggleTheme,
}: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Task Board</h1>
        <p className={styles.subtitle}>
          {formatDate(todayISO())} · Scrum + Drag &amp; Drop, tersimpan di browser
        </p>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onAdd}>
          + Tugas baru <kbd>N</kbd>
        </button>
        <button type="button" onClick={onClearDone} disabled={doneCount === 0}>
          Bersihkan Done
        </button>
        <button
          type="button"
          className={styles.theme}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
          title={theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        >
          {theme === 'dark' ? 'Terang' : 'Gelap'}
        </button>
      </div>
    </header>
  )
}