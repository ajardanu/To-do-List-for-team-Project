import type { Task } from '../types'

export interface DropTarget {
  anchorId: string | null
  after: boolean
}

/** Kartu yang sedang didrag tidak ikut dihitung, supaya indeks tidak geser sendiri. */
export function computeDropTarget(
  container: HTMLElement | null,
  clientY: number,
  draggingId: string,
): DropTarget {
  if (!container) return { anchorId: null, after: true }

  const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-task-card]'))
  let anchorId: string | null = null
  let after = false

  for (const card of cards) {
    const id = card.dataset.taskId
    if (!id || id === draggingId) continue
    const rect = card.getBoundingClientRect()
    if (clientY < rect.top + rect.height / 2) {
      anchorId = id
      after = false
      break
    }
    anchorId = id
    after = true
  }

  return anchorId === null ? { anchorId: null, after: true } : { anchorId, after }
}

export function indicatorIndex(visibleIds: string[], target: DropTarget): number {
  if (!target.anchorId) return visibleIds.length
  const position = visibleIds.indexOf(target.anchorId)
  if (position === -1) return visibleIds.length
  return target.after ? position + 1 : position
}

/**
 * Ubah posisi visual (berdasarkan kartu yang terlihat) menjadi indeks pada
 * daftar tugas kolom yang sebenarnya, supaya filter tidak merusak hasil drop.
 */
export function resolveColumnIndex(
  columnTasks: Task[],
  draggingId: string,
  target: DropTarget,
): number {
  const siblings = columnTasks.filter((task) => task.id !== draggingId)
  if (!target.anchorId) return siblings.length

  const position = siblings.findIndex((task) => task.id === target.anchorId)
  if (position === -1) return siblings.length

  return target.after ? position + 1 : position
}