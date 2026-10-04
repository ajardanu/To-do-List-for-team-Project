import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { BoardState, ColumnId, Task, TaskDraft } from '../types'
import type { BoardStats } from '../lib/board'
import { boardReducer, collectLabels, computeStats } from '../lib/board'
import { loadBoard, saveBoard, seedBoard } from '../lib/storage'

export interface TaskBoardApi {
  tasks: Task[]
  labels: string[]
  stats: BoardStats
  addTask: (draft: TaskDraft, column: ColumnId) => void
  updateTask: (id: string, draft: TaskDraft) => void
  removeTask: (id: string) => void
  toggleTask: (id: string) => void
  moveTask: (id: string, toColumn: ColumnId, toIndex: number) => void
  clearDone: () => void
}

function initBoard(): BoardState {
  return loadBoard() ?? seedBoard()
}

export function useTaskBoard(): TaskBoardApi {
  const [state, dispatch] = useReducer(boardReducer, null, initBoard)

  useEffect(() => {
    saveBoard(state)
  }, [state])

  const labels = useMemo(() => collectLabels(state.tasks), [state.tasks])
  const stats = useMemo(() => computeStats(state.tasks), [state.tasks])

  const addTask = useCallback((draft: TaskDraft, column: ColumnId) => {
    dispatch({ type: 'task/add', draft, column })
  }, [])

  const updateTask = useCallback((id: string, draft: TaskDraft) => {
    dispatch({ type: 'task/update', id, draft })
  }, [])

  const removeTask = useCallback((id: string) => {
    dispatch({ type: 'task/remove', id })
  }, [])

  const toggleTask = useCallback((id: string) => {
    dispatch({ type: 'task/toggle', id })
  }, [])

  const moveTask = useCallback((id: string, toColumn: ColumnId, toIndex: number) => {
    dispatch({ type: 'task/move', id, toColumn, toIndex })
  }, [])

  const clearDone = useCallback(() => {
    dispatch({ type: 'board/clearDone' })
  }, [])

  return {
    tasks: state.tasks,
    labels,
    stats,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
    moveTask,
    clearDone,
  }
}