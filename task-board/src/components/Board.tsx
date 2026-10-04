import { useEffect } from 'react'
import type { ColumnId, Filters, Task } from '../types'
import { COLUMNS } from '../types'
import { tasksInColumn, visibleInColumn } from '../lib/board'
import { Column } from './Column'
import styles from './Board.module.css'

interface BoardProps {
  tasks: Task[]
  filters: Filters
  draggingId: string | null
  onDraggingChange: (id: string | null) => void
  onMove: (id: string, toColumn: ColumnId, toIndex: number) => void
  onEdit: (task: Task) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onAdd: (column: ColumnId) => void
}

export function Board({
  tasks,
  filters,
  draggingId,
  onDraggingChange,
  onMove,
  onEdit,
  onRemove,
  onToggle,
  onAdd,
}: BoardProps) {
  // Jaring pengaman: drag yang berakhir di luar kolom (dibatalkan atau Esc
  // ditekan) hanya memberi tahu lewat `dragend`, yang tidak selalu sampai.
  useEffect(() => {
    if (!draggingId) return

    function clear() {
      onDraggingChange(null)
    }

    window.addEventListener('dragend', clear)
    window.addEventListener('drop', clear)
    return () => {
      window.removeEventListener('dragend', clear)
      window.removeEventListener('drop', clear)
    }
  }, [draggingId, onDraggingChange])

  return (
    <div className={styles.board}>
      {COLUMNS.map((meta) => (
        <Column
          key={meta.id}
          meta={meta}
          columnTasks={tasksInColumn(tasks, meta.id)}
          tasks={visibleInColumn(tasks, meta.id, filters)}
          draggingId={draggingId}
          onDraggingChange={onDraggingChange}
          onMove={onMove}
          onEdit={onEdit}
          onRemove={onRemove}
          onToggle={onToggle}
          onAdd={onAdd}
        />
      ))}
    </div>
  )
}