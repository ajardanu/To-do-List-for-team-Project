import { toISODate, todayISO } from './date'
import { createTask } from './board'
import type { BoardState, ColumnId, Priority, Task, TaskDraft } from '../types'
import { COLUMN_IDS, PRIORITIES } from '../types'

const STORAGE_KEY = 'task-board.state.v1'

function isColumnId(value: unknown): value is ColumnId {
  return typeof value === 'string' && (COLUMN_IDS as readonly string[]).includes(value)
}

function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value)
}

function parseTask(value: unknown): Task | null {
  if (typeof value !== 'object' || value === null) return null
  const raw = value as Record<string, unknown>
  if (typeof raw.id !== 'string' || typeof raw.title !== 'string') return null
  if (!isColumnId(raw.column) || !isPriority(raw.priority)) return null

  const labels = Array.isArray(raw.labels)
    ? raw.labels.filter((label): label is string => typeof label === 'string')
    : []

  return {
    id: raw.id,
    title: raw.title,
    description: typeof raw.description === 'string' ? raw.description : '',
    column: raw.column,
    priority: raw.priority,
    labels,
    dueDate: typeof raw.dueDate === 'string' ? raw.dueDate : null,
    order: typeof raw.order === 'number' ? raw.order : 0,
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    completedAt: typeof raw.completedAt === 'number' ? raw.completedAt : null,
  }
}

export function loadBoard(): BoardState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null
    const tasks = (parsed as Record<string, unknown>).tasks
    if (!Array.isArray(tasks)) return null
    return { tasks: tasks.map(parseTask).filter((task): task is Task => task !== null) }
  } catch {
    return null
  }
}

export function saveBoard(state: BoardState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Penyimpanan penuh atau ditolak browser: biarkan state tetap di memori.
  }
}

function inDays(offset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + offset)
  return toISODate(date)
}

const SEED: Array<{ column: ColumnId; draft: TaskDraft }> = [
  {
    column: 'todo',
    draft: {
      title: 'Bersihkan backlog bug lama',
      description: 'Triage bug yang sudah lewat 2 rilis.',
      priority: 'low',
      labels: ['chore'],
      dueDate: inDays(-1),
    },
  },
  {
    column: 'todo',
    draft: {
      title: 'Review pull request tim',
      description: 'Fokus pada review yang lewat 1 hari.',
      priority: 'medium',
      labels: ['code', 'review'],
      dueDate: inDays(1),
    },
  },
  {
    column: 'todo',
    draft: {
      title: 'Siapkan checklist rilis',
      description: 'Rilis mingguan sudah 3 hari lagi.',
      priority: 'high',
      labels: ['release'],
      dueDate: todayISO(),
    },
  },
  {
    column: 'todo',
    draft: {
      title: 'Tulis laporan mingguan',
      description: 'Ringkasan progres, risiko, dan rencana minggu depan.',
      priority: 'low',
      labels: ['docs'],
      dueDate: inDays(4),
    },
  },
  {
    column: 'doing',
    draft: {
      title: 'Susun rencana mingguan',
      description: 'Bagikan di rapat tim Senin pagi.',
      priority: 'high',
      labels: ['planning', 'team'],
      dueDate: todayISO(),
    },
  },
  {
    column: 'doing',
    draft: {
      title: 'Refactor modul autentikasi',
      description: 'Pecah file 900 baris jadi tiga modul.',
      priority: 'medium',
      labels: ['code', 'refactor'],
      dueDate: inDays(2),
    },
  },
  {
    column: 'done',
    draft: {
      title: 'Update dokumentasi API',
      description: 'Endpoint baru sudah terdokumentasi.',
      priority: 'medium',
      labels: ['docs', 'code'],
      dueDate: inDays(-1),
    },
  },
]

export function seedBoard(): BoardState {
  const counters: Record<ColumnId, number> = { todo: 0, doing: 0, done: 0 }
  const tasks = SEED.map(({ column, draft }) =>
    createTask(draft, column, counters[column]++),
  )
  return { tasks }
}