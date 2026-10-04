export const COLUMN_IDS = ['todo', 'doing', 'done'] as const
export type ColumnId = (typeof COLUMN_IDS)[number]

export const PRIORITIES = ['low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export interface ColumnMeta {
  id: ColumnId
  title: string
  hint: string
}

export const COLUMNS: ColumnMeta[] = [
  { id: 'todo', title: 'To Do', hint: 'Belum dikerjakan' },
  { id: 'doing', title: 'Doing', hint: 'Sedang dikerjakan' },
  { id: 'done', title: 'Done', hint: 'Sudah selesai' },
]

export interface Task {
  id: string
  title: string
  description: string
  column: ColumnId
  priority: Priority
  labels: string[]
  dueDate: string | null
  order: number
  createdAt: number
  updatedAt: number
  completedAt: number | null
}

export interface TaskDraft {
  title: string
  description: string
  priority: Priority
  labels: string[]
  dueDate: string | null
}

export interface Filters {
  query: string
  priorities: Priority[]
  labels: string[]
  hideDone: boolean
}

export interface BoardState {
  tasks: Task[]
}

export const EMPTY_FILTERS: Filters = {
  query: '',
  priorities: [],
  labels: [],
  hideDone: false,
}