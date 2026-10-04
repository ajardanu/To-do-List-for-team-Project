import { Fragment, useRef, useState } from 'react'
import type { DragEvent } from 'react'
import type { ColumnId, ColumnMeta, Task } from '../types'
import type { DropTarget } from '../lib/dragDrop'
import { computeDropTarget, indicatorIndex, resolveColumnIndex } from '../lib/dragDrop'
import { TaskCard } from './TaskCard'
import styles from './Column.module.css'

interface ColumnProps {
  meta: ColumnMeta
  columnTasks: Task[]
  tasks: Task[]
  draggingId: string | null
  onDraggingChange: (id: string | null) => void
  onMove: (id: string, toColumn: ColumnId, toIndex: number) => void
  onEdit: (task: Task) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
  onAdd: (column: ColumnId) => void
}

export function Column({
  meta,
  columnTasks,
  tasks,
  draggingId,
  onDraggingChange,
  onMove,
  onEdit,
  onRemove,
  onToggle,
  onAdd,
}: ColumnProps) {
  const listRef = useRef<HTMLUListElement>(null)
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null)

  const lineIndex = dropTarget ? indicatorIndex(tasks.map((task) => task.id), dropTarget) : -1
  const isTarget = draggingId !== null

  function handleDragOver(event: DragEvent<HTMLUListElement>) {
    if (!draggingId) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    setDropTarget(computeDropTarget(listRef.current, event.clientY, draggingId))
  }

  function handleDrop(event: DragEvent<HTMLUListElement>) {
    event.preventDefault()
    const draggedId = draggingId ?? event.dataTransfer.getData('text/plain')
    setDropTarget(null)
    // Kartu sumber dilepas dari DOM begitu tugas dipindah, jadi `dragend`-nya
    // tidak lagi sampai ke React. State drag harus dibersihkan di sini.
    onDraggingChange(null)
    if (!draggedId) return

    const target = computeDropTarget(listRef.current, event.clientY, draggedId)
    onMove(draggedId, meta.id, resolveColumnIndex(columnTasks, draggedId, target))
  }

  function handleDragLeave(event: DragEvent<HTMLUListElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setDropTarget(null)
  }

  function handleDragEnd() {
    setDropTarget(null)
    onDraggingChange(null)
  }

  return (
    <section
      className={[styles.column, isTarget ? styles.active : ''].filter(Boolean).join(' ')}
      aria-label={meta.title}
    >
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{meta.title}</h2>
          <p className={styles.hint}>{meta.hint}</p>
        </div>
        <span className={styles.count}>{columnTasks.length}</span>
      </header>

      <ul
        ref={listRef}
        className={styles.list}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {tasks.map((task, index) => (
          <Fragment key={task.id}>
            {lineIndex === index && (
              <li className={styles.dropLine} aria-hidden="true" />
            )}
            <li className={styles.item}>
              <TaskCard
                task={task}
                isDragging={draggingId === task.id}
                onDragStart={onDraggingChange}
                onDragEnd={handleDragEnd}
                onEdit={onEdit}
                onRemove={onRemove}
                onToggle={onToggle}
              />
            </li>
          </Fragment>
        ))}

        {lineIndex === tasks.length && (
          <li className={styles.dropLine} aria-hidden="true" />
        )}

        {tasks.length === 0 && (
          <li className={styles.empty}>
            {columnTasks.length === 0 ? 'Belum ada tugas' : 'Tidak ada yang cocok filter'}
          </li>
        )}
      </ul>

      <button
        type="button"
        className={styles.add}
        onClick={() => onAdd(meta.id)}
      >
        + Tambah tugas
      </button>
    </section>
  )
}