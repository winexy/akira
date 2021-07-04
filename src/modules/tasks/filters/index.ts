import produce from 'immer'
import {useReducer} from 'react'
import {TaskT} from '@store/tasks'
import {exhaustiveCheck} from '@/utils'

function createFiltersState() {
  return {
    completed: false,
    important: false,
    notCompleted: false,
    tags: new Set<number>()
  }
}

export type FiltersState = ReturnType<typeof createFiltersState>

type FilterPredicate = (task: TaskT, state: FiltersState) => boolean

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

export function filterTasks(tasks: TaskT[], state: FiltersState) {
  const filters = [byCompletness, byImportance, byNotCompleted, bySomeTags]

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
