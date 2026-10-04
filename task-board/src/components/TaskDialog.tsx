import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import type { ColumnId, Priority, Task, TaskDraft } from '../types'
import { COLUMNS, PRIORITIES } from '../types'
import { LabelChips } from './LabelChips'
import { PriorityBadge } from './PriorityBadge'
import styles from './TaskDialog.module.css'

interface TaskDialogProps {
  open: boolean
  task: Task | null
  defaultColumn: ColumnId
  knownLabels: string[]
  onClose: () => void
  onSubmit: (draft: TaskDraft, column: ColumnId) => void
}

interface FormState {
  title: string
  description: string
  priority: Priority
  column: ColumnId
  labels: string[]
  dueDate: string
}

/**
 * Dialog di-remount (lewat `key`) setiap kali dibuka, jadi form bisa diinisialisasi
 * sekali di awal render tanpa perlu menyetel ulang state dari dalam effect.
 */
function initialState(task: Task | null, defaultColumn: ColumnId): FormState {
  if (task) {
    return {
      title: task.title,
      description: task.description,
      priority: task.priority,
      column: task.column,
      labels: task.labels,
      dueDate: task.dueDate ?? '',
    }
  }

  return {
    title: '',
    description: '',
    priority: 'medium',
    column: defaultColumn,
    labels: [],
    dueDate: '',
  }
}

export function TaskDialog({
  open,
  task,
  defaultColumn,
  knownLabels,
  onClose,
  onSubmit,
}: TaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<FormState>(() => initialState(task, defaultColumn))
  const [labelInput, setLabelInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !open || dialog.open) return
    dialog.showModal()
    titleRef.current?.focus()
    titleRef.current?.select()
  }, [open])

  useEffect(() => {
    const dialog = dialogRef.current
    if (open || !dialog?.open) return
    dialog.close()
  }, [open])

  function patch(next: Partial<FormState>) {
    setForm((current) => ({ ...current, ...next }))
  }

  function addLabel() {
    const value = labelInput.trim().toLowerCase().replace(/\s+/g, '-')
    setLabelInput('')
    if (!value || form.labels.includes(value)) return
    patch({ labels: [...form.labels, value] })
  }

  function handleLabelKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addLabel()
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Judul tidak boleh kosong.')
      titleRef.current?.focus()
      return
    }

    onSubmit(
      {
        title: form.title,
        description: form.description,
        priority: form.priority,
        labels: form.labels,
        dueDate: form.dueDate || null,
      },
      form.column,
    )
  }

  return (
    <dialog ref={dialogRef} className={styles.dialog} onClose={onClose} onCancel={onClose}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className={styles.heading}>{task ? 'Ubah tugas' : 'Tugas baru'}</h2>

        <label className={styles.field}>
          <span>Judul</span>
          <input
            ref={titleRef}
            className={styles.input}
            value={form.title}
            placeholder="Contoh: Susun rencana mingguan"
            onChange={(event) => {
              patch({ title: event.target.value })
              if (error) setError('')
            }}
          />
        </label>

        <label className={styles.field}>
          <span>Catatan</span>
          <textarea
            className={styles.textarea}
            value={form.description}
            rows={3}
            placeholder="Detail tambahan, opsional"
            onChange={(event) => patch({ description: event.target.value })}
          />
        </label>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Prioritas</span>
            <div className={styles.priorityRow}>
              {PRIORITIES.map((item) => (
                <PriorityBadge
                  key={item}
                  priority={item}
                  interactive
                  active={form.priority === item}
                  onToggle={(item) => patch({ priority: item })}
                />
              ))}
            </div>
          </label>

          <label className={styles.field}>
            <span>Status</span>
            <select
              className={styles.select}
              value={form.column}
              onChange={(event) => patch({ column: event.target.value as ColumnId })}
            >
              {COLUMNS.map((meta) => (
                <option key={meta.id} value={meta.id}>
                  {meta.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.row}>
          <label className={styles.field}>
            <span>Label</span>
            <input
              className={styles.input}
              list="task-labels"
              value={labelInput}
              placeholder="Tekan Enter untuk menambah"
              onChange={(event) => setLabelInput(event.target.value)}
              onKeyDown={handleLabelKeyDown}
              onBlur={addLabel}
            />
            <datalist id="task-labels">
              {knownLabels.map((label) => (
                <option key={label} value={label} />
              ))}
            </datalist>
          </label>

          <label className={styles.field}>
            <span>Jatuh tempo</span>
            <input
              className={styles.input}
              type="date"
              value={form.dueDate}
              onChange={(event) => patch({ dueDate: event.target.value })}
            />
          </label>
        </div>

        <LabelChips
          labels={form.labels}
          onRemove={(label) =>
            patch({ labels: form.labels.filter((item) => item !== label) })
          }
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className={styles.primary}>
            {task ? 'Simpan perubahan' : 'Tambah tugas'}
          </button>
        </div>
      </form>
    </dialog>
  )
}