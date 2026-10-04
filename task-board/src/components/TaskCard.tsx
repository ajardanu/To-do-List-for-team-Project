import type { Task } from '../types'
import { describeDue } from '../lib/date'
import { LabelChips } from './LabelChips'
import { PriorityBadge } from './PriorityBadge'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onEdit: (task: Task) => void
  onRemove: (id: string) => void
  onToggle: (id: string) => void
}

export function TaskCard({
  task,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onRemove,
  onToggle,
}: TaskCardProps) {
  const finished = task.column === 'done'
  const due = describeDue(task.dueDate, finished)

  return (
    <article
      className={styles.card}
      data-task-card=""
      data-task-id={task.id}
      data-dragging={isDragging ? 'true' : undefined}
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        event.dataTransfer.setData('text/plain', task.id)
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
    >
      <div className={styles.head}>
        <h3 className={styles.title} title={task.title}>
          {task.title}
        </h3>
        <button
          type="button"
          className={styles.check}
          aria-pressed={finished}
          aria-label={finished ? 'Tandai belum selesai' : 'Tandai selesai'}
          title={finished ? 'Tandai belum selesai' : 'Tandai selesai'}
          onClick={() => onToggle(task.id)}
        >
          {finished ? '✓' : '○'}
        </button>
      </div>

      {task.description && <p className={styles.description}>{task.description}</p>}

      <div className={styles.meta}>
        <PriorityBadge priority={task.priority} />
        {due.tone !== 'none' && (
          <span className={[styles.due, styles[due.tone]].filter(Boolean).join(' ')}>
            {due.text}
          </span>
        )}
      </div>

      <LabelChips labels={task.labels} />

      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={() => onEdit(task)}>
          Ubah
        </button>
        <button
          type="button"
          className={`${styles.action} ${styles.danger}`}
          onClick={() => onRemove(task.id)}
        >
          Hapus
        </button>
      </div>
    </article>
  )
}