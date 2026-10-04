import { createId } from './id'
import { isOverdue, todayISO } from './date'
import type { BoardState, ColumnId, Filters, Priority, Task, TaskDraft } from '../types'

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Rendah',
  medium: 'Sedang',
  high: 'Tinggi',
}

export function createTask(draft: TaskDraft, column: ColumnId, order: number): Task {
  const now = Date.now()
  return {
    id: createId(),
    title: draft.title.trim(),
    description: draft.description.trim(),
    column,
    priority: draft.priority,
    labels: draft.labels,
    dueDate: draft.dueDate,
    order,
    createdAt: now,
    updatedAt: now,
    completedAt: column === 'done' ? now : null,
  }
}

function byOrder(a: Task, b: Task): number {
  return a.order - b.order
}

export function tasksInColumn(tasks: Task[], column: ColumnId): Task[] {
  return tasks.filter((task) => task.column === column).sort(byOrder)
}

function reindex(tasks: Task[]): Task[] {
  const nextOrder = new Map<ColumnId, number>()
  for (const column of ['todo', 'doing', 'done'] as ColumnId[]) {
    nextOrder.set(column, 0)
  }
  return tasks.map((task) => {
    const order = nextOrder.get(task.column) ?? 0
    nextOrder.set(task.column, order + 1)
    return task.order === order ? task : { ...task, order }
  })
}

export function moveTask(
  tasks: Task[],
  id: string,
  toColumn: ColumnId,
  toIndex: number,
): Task[] {
  const moving = tasks.find((task) => task.id === id)
  if (!moving) return tasks

  const siblings = tasksInColumn(tasks, toColumn).filter((task) => task.id !== id)
  const index = Math.max(0, Math.min(toIndex, siblings.length))

  const now = Date.now()
  const moved: Task = {
    ...moving,
    column: toColumn,
    order: index,
    updatedAt: now,
    completedAt: toColumn === 'done' ? (moving.completedAt ?? now) : null,
  }
  siblings.splice(index, 0, moved)

  const positionById = new Map(siblings.map((task, position) => [task.id, position]))
  return tasks.map((task) => {
    if (task.id === id) return moved
    const position = positionById.get(task.id)
    if (position === undefined) return task
    return task.order === position ? task : { ...task, order: position }
  })
}

export function updateTask(tasks: Task[], id: string, draft: TaskDraft): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          title: draft.title.trim(),
          description: draft.description.trim(),
          priority: draft.priority,
          labels: draft.labels,
          dueDate: draft.dueDate,
          updatedAt: Date.now(),
        }
      : task,
  )
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return reindex(tasks.filter((task) => task.id !== id))
}

export function matchesFilters(task: Task, filters: Filters): boolean {
  if (filters.hideDone && task.column === 'done') return false

  if (filters.priorities.length > 0 && !filters.priorities.includes(task.priority)) {
    return false
  }

  if (filters.labels.length > 0) {
    const matched = filters.labels.some((label) => task.labels.includes(label))
    if (!matched) return false
  }

  const query = filters.query.trim().toLowerCase()
  if (query) {
    const haystack = [task.title, task.description, ...task.labels].join(' ').toLowerCase()
    if (!haystack.includes(query)) return false
  }

  return true
}

export function visibleInColumn(
  tasks: Task[],
  column: ColumnId,
  filters: Filters,
): Task[] {
  return tasksInColumn(tasks, column).filter((task) => matchesFilters(task, filters))
}

export function collectLabels(tasks: Task[]): string[] {
  const labels = new Set<string>()
  for (const task of tasks) {
    for (const label of task.labels) labels.add(label)
  }
  return [...labels].sort((a, b) => a.localeCompare(b))
}

export interface BoardStats {
  total: number
  todo: number
  doing: number
  done: number
  overdue: number
  dueToday: number
  doneToday: number
  progress: number
}

export function computeStats(tasks: Task[]): BoardStats {
  const today = todayISO()
  let todo = 0
  let doing = 0
  let done = 0
  let overdue = 0
  let dueToday = 0
  let doneToday = 0

  for (const task of tasks) {
    if (task.column === 'todo') todo += 1
    else if (task.column === 'doing') doing += 1
    else done += 1

    const finished = task.column === 'done'
    if (isOverdue(task.dueDate, finished)) overdue += 1
    if (!finished && task.dueDate === today) dueToday += 1
    if (finished && task.completedAt) {
      const stamp = new Date(task.completedAt)
      if (
        stamp.getFullYear() === new Date().getFullYear() &&
        stamp.getMonth() === new Date().getMonth() &&
        stamp.getDate() === new Date().getDate()
      ) {
        doneToday += 1
      }
    }
  }

  const total = tasks.length
  return {
    total,
    todo,
    doing,
    done,
    overdue,
    dueToday,
    doneToday,
    progress: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export type BoardAction =
  | { type: 'task/add'; draft: TaskDraft; column: ColumnId }
  | { type: 'task/update'; id: string; draft: TaskDraft }
  | { type: 'task/remove'; id: string }
  | { type: 'task/toggle'; id: string }
  | { type: 'task/move'; id: string; toColumn: ColumnId; toIndex: number }
  | { type: 'board/clearDone' }

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  const { tasks } = state

  switch (action.type) {
    case 'task/add': {
      const order = tasks.filter((task) => task.column === action.column).length
      return { tasks: [...tasks, createTask(action.draft, action.column, order)] }
    }
    case 'task/update':
      return { tasks: updateTask(tasks, action.id, action.draft) }
    case 'task/remove':
      return { tasks: removeTask(tasks, action.id) }
    case 'task/toggle': {
      const target = tasks.find((task) => task.id === action.id)
      if (!target) return state
      const toColumn: ColumnId = target.column === 'done' ? 'todo' : 'done'
      return { tasks: moveTask(tasks, action.id, toColumn, 0) }
    }
    case 'task/move':
      return { tasks: moveTask(tasks, action.id, action.toColumn, action.toIndex) }
    case 'board/clearDone':
      return { tasks: reindex(tasks.filter((task) => task.column !== 'done')) }
    default:
      return state
  }
}