import produce from 'immer'
import {useReducer} from 'react'
import {ApiTask} from 'modules/tasks/types.d'
import {exhaustiveCheck} from 'shared/lib/utils'
import isNull from 'lodash/fp/isNull'
import isAfter from 'date-fns/isAfter'
import parseISO from 'date-fns/parseISO'

export type FiltersState = {
  completed: boolean
  important: boolean
  notCompleted: boolean
  dateFrom: Date | null
  tags: Set<number>
}

function createFiltersState(): FiltersState {
  return {
    completed: false,
    important: false,
    notCompleted: false,
    dateFrom: null,
    tags: new Set<number>()
  }
}

type FilterPredicate = (task: ApiTask, state: FiltersState) => boolean

const byCompletness: FilterPredicate = (task, state) => {
  if (!state.completed) {
    return true
  }

  return task.is_completed
}

const byImportance: FilterPredicate = (task, state) => {
  if (!state.important) {
    return true
  }

  return task.is_important
}

const byNotCompleted: FilterPredicate = (task, state) => {
  if (!state.notCompleted) {
    return true
  }

  return !task.is_completed
}

const bySomeTags: FilterPredicate = (task, state) => {
  if (state.tags.size === 0) {
    return true
  }

  return task.tags.some(tag => state.tags.has(tag.id))
}

const byDateFrom: FilterPredicate = (task, state) => {
  if (isNull(state.dateFrom)) {
    return true
  }

  return isAfter(parseISO(task.created_at), state.dateFrom)
}

export function filterTasks(tasks: ApiTask[], state: FiltersState) {
  const filters = [
    byCompletness,
    byImportance,
    byNotCompleted,
    bySomeTags,
    byDateFrom
  ]

  return tasks.filter(task => {
    return filters.every(func => {
      return func(task, state)
    })
  })
}

export type FilterAction =
  | {
      type: 'completed' | 'important' | 'notCompleted'
    }
  | {
      type: 'tags'
      tagId: number
    }
  | {
      type: 'date-from'
      date: Date | null
    }
  | {
      type: 'reset'
    }

export function useTaskFilters(): [FiltersState, React.Dispatch<FilterAction>] {
  const [state, dispatch] = useReducer(
    produce((draft: FiltersState, action: FilterAction) => {
      switch (action.type) {
        case 'completed': {
          draft.completed = !draft.completed
          return draft
        }
        case 'important': {
          draft.important = !draft.important
          return draft
        }
        case 'notCompleted': {
          draft.notCompleted = !draft.notCompleted
          return draft
        }
        case 'date-from': {
          draft.dateFrom = action.date
          return draft
        }
        case 'tags': {
          if (draft.tags.has(action.tagId)) {
            draft.tags.delete(action.tagId)
          } else {
            draft.tags.add(action.tagId)
          }

          return draft
        }
        case 'reset': {
          return createFiltersState()
        }
        default:
          return exhaustiveCheck(action)
      }
    }),
    null,
    createFiltersState
  )

  return [state, dispatch]
}
