import { useEffect, useMemo, useState } from 'react'
import type { ColumnId, Filters, Task, TaskDraft } from './types'
import { EMPTY_FILTERS } from './types'
import { matchesFilters } from './lib/board'
import { useTaskBoard } from './hooks/useTaskBoard'
import { useTheme } from './hooks/useTheme'
import { AppHeader } from './components/AppHeader'
import { StatsBar } from './components/StatsBar'
import { FilterBar } from './components/FilterBar'
import { Board } from './components/Board'
import { TaskDialog } from './components/TaskDialog'
import styles from './App.module.css'

type DialogState =
  | { mode: 'create'; column: ColumnId }
  | { mode: 'edit'; task: Task }
  | null

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

function App() {
  const board = useTaskBoard()
  const { theme, toggleTheme } = useTheme()
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<DialogState>(null)
  const [dialogSeq, setDialogSeq] = useState(0)

  function openCreate(column: ColumnId) {
    setDialogSeq((value) => value + 1)
    setDialog({ mode: 'create', column })
  }

  function openEdit(task: Task) {
    setDialogSeq((value) => value + 1)
    setDialog({ mode: 'edit', task })
  }

  const visibleCount = useMemo(
    () => board.tasks.filter((task) => matchesFilters(task, filters)).length,
    [board.tasks, filters],
  )

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'n' && event.key !== 'N') return
      if (isTypingTarget(event.target)) return
      event.preventDefault()
      setDialogSeq((value) => value + 1)
      setDialog({ mode: 'create', column: 'todo' })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSubmit(draft: TaskDraft, column: ColumnId) {
    if (dialog?.mode === 'edit') {
      const existing = board.tasks.find((task) => task.id === dialog.task.id)
      if (existing) {
        board.updateTask(existing.id, draft)
        if (existing.column !== column) {
          const targetLength = board.tasks.filter(
            (task) => task.column === column && task.id !== existing.id,
          ).length
          board.moveTask(existing.id, column, targetLength)
        }
      }
    } else {
      board.addTask(draft, column)
    }
    setDialog(null)
  }

  function handleRemove(id: string) {
    const task = board.tasks.find((item) => item.id === id)
    if (!task) return
    if (!window.confirm(`Hapus tugas "${task.title}"?`)) return
    board.removeTask(id)
  }

  function handleClearDone() {
    if (board.stats.done === 0) return
    if (!window.confirm(`Hapus ${board.stats.done} tugas yang sudah selesai?`)) return
    board.clearDone()
  }

  return (
    <div className={styles.app}>
      <AppHeader
        onAdd={() => openCreate('todo')}
        onClearDone={handleClearDone}
        doneCount={board.stats.done}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <StatsBar stats={board.stats} />

      <FilterBar
        filters={filters}
        labels={board.labels}
        resultCount={visibleCount}
        onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <Board
        tasks={board.tasks}
        filters={filters}
        draggingId={draggingId}
        onDraggingChange={setDraggingId}
        onMove={board.moveTask}
        onEdit={openEdit}
        onRemove={handleRemove}
        onToggle={board.toggleTask}
        onAdd={openCreate}
      />

      <p className={styles.footnote}>
        Data disimpan di localStorage browser ini. Seret kartu untuk memindahkan tugas, atau tekan N
        untuk menambah tugas baru.
      </p>

      <TaskDialog
        key={dialogSeq}
        open={dialog !== null}
        task={dialog?.mode === 'edit' ? dialog.task : null}
        defaultColumn={dialog?.mode === 'create' ? dialog.column : 'todo'}
        knownLabels={board.labels}
        onClose={() => setDialog(null)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default App