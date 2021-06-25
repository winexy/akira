import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import keyBy from 'lodash/fp/keyBy'
import indexOf from 'lodash/fp/indexOf'
import filter from 'lodash/fp/filter'
import {combine, forward} from 'effector'
import {akira} from '@/lib/akira'
import produce from 'immer'
import {auth} from '@/firebase'
import isNull from 'lodash/isNull'
import size from 'lodash/fp/size'
import {rejectNotImplemented} from '@/utils'
import {findIndex} from 'lodash'
import {TaskT, TaskIdT, TodoT, TodoIdT, TaskPatchT, TodoPatchT} from './types'
import {app} from '../app'

type ChangePositionParams = {
  fromIndex: number
  toIndex: number
}

export type CompleteTaskPayloadT = {
  id: TaskIdT
  completed: boolean
}

export type ImportantTaskPayloadT = {
  id: TaskIdT
  important: boolean
}

export type AddTodoPayloadT = {
  taskId: TaskIdT
  todoTitle: string
}

export type RemoveTodoPayloadT = {
  taskId: TaskIdT
  todoId: TodoIdT
}

export type TodoAddedPayloadT = {
  taskId: TaskIdT
  todo: TodoT
}

export type TodoRemovedPayloadT = {
  taskId: TaskIdT
  todoId: TodoIdT
}

export type TaskPatchPayloadT = {
  taskId: TaskIdT
  patch: TaskPatchT
}

export type PatchTodoPayloadT = {
  taskId: TaskIdT
  todoId: TodoIdT
  patch: TodoPatchT
}

export const queryTasksFx = app.effect(akira.tasks.query)
export const loadTaskFx = app.effect(akira.tasks.one)
export const addTaskFx = app.effect((title: string) => {
  if (isNull(auth.currentUser)) {
    return Promise.reject(new Error('unauthorized'))
  }

  return akira.tasks.createTask({
    author_uid: auth.currentUser.uid,
    title
  })
})
export const removeTaskFx = app.effect(akira.tasks.delete)
export const toggleTaskFx = app.effect(akira.tasks.toggleCompleted)
export const toggleImportantFx = app.effect(akira.tasks.toggleImportant)

export const loadChecklistFx = app.effect(akira.checklist.findAllByTaskId)

export const addTodoFx = app.effect((payload: AddTodoPayloadT) => {
  return akira.checklist.addTodo({
    taskId: payload.taskId,
    title: payload.todoTitle
  })
})

export const removeTodoFx = app.effect(
  ({taskId, todoId}: RemoveTodoPayloadT) => {
    return akira.checklist.removeTodo(taskId, todoId)
  }
)

export const changeTaskPositionFx = app.effect(
  (params: ChangePositionParams) => {
    return rejectNotImplemented()
  }
)

export const patchTaskFx = app.effect(({taskId, patch}: TaskPatchPayloadT) => {
  return akira.tasks.patch(taskId, patch)
})

export const patchTodoFx = app.effect(
  ({taskId, todoId, patch}: PatchTodoPayloadT) => {
    return akira.checklist.patchTodo(taskId, todoId, patch)
  }
)

export const optimisticTaskCompletedToggle = app.event<TaskIdT>()

forward({
  from: optimisticTaskCompletedToggle,
  to: toggleTaskFx
})

export const $tasksIds = app
  .store<TaskIdT[]>([])
  .on(queryTasksFx.doneData, (_, tasks) => {
    return map(get('id'), tasks)
  })
  .on(addTaskFx.doneData, (state, task) => {
    return produce(state, draft => {
      draft.push(task.id)
    })
  })
  .on(removeTaskFx.done, (state, {params: taskId}) => {
    return produce(state, draft => {
      draft.splice(indexOf(taskId, draft), 1)
    })
  })
  .on(changeTaskPositionFx.doneData, (state, payload) => {
    // const {fromIndex, toIndex} = action.payload
    // const id = state.list[fromIndex]
    // state.list.splice(fromIndex, 1)
    // state.list.splice(toIndex, 0, id)
  })

export const $tasksById = app
  .store<Record<TaskIdT, TaskT>>({})
  .on(queryTasksFx.doneData, (_, tasks) => {
    return keyBy('id', tasks)
  })
  .on([loadTaskFx.doneData, addTaskFx.doneData], (state, task) => {
    return produce(state, draft => {
      draft[task.id] = task
    })
  })
  .on(removeTaskFx.done, (state, {params: taskId}) => {
    return produce(state, draft => {
      delete draft[taskId]
    })
  })
  .on(
    [toggleTaskFx.doneData, toggleImportantFx.doneData, patchTaskFx.doneData],
    (state, task) => {
      return produce(state, draft => {
        draft[task.id] = task
      })
    }
  )
  .on(optimisticTaskCompletedToggle, (state, taskId) => {
    return produce(state, draft => {
      draft[taskId].is_completed = !draft[taskId].is_completed
    })
  })
  .on(toggleTaskFx.fail, (state, {params: taskId}) => {
    return produce(state, draft => {
      draft[taskId].is_completed = !draft[taskId].is_completed
    })
  })

export const $checklistByTaskId = app
  .store<Record<TaskIdT, TodoT[]>>({})
  .on(loadChecklistFx.done, (state, {params, result}) => {
    const taskId = params
    return produce(state, draft => {
      draft[taskId] = result
    })
  })
  .on(addTodoFx.done, (state, {params, result}) => {
    const {taskId} = params
    return produce(state, draft => {
      if (draft[taskId]) {
        draft[taskId].push(result)
      } else {
        draft[taskId] = [result]
      }
    })
  })
  .on(removeTodoFx.done, (state, {params}) => {
    const {taskId, todoId} = params
    return produce(state, draft => {
      if (draft[taskId]) {
        draft[taskId] = filter(todo => todo.id !== todoId, draft[taskId])
      }
    })
  })
  .on(patchTodoFx.doneData, (state, todo) => {
    const listToUpdate = state[todo.task_id] ?? []
    const index = findIndex(listToUpdate, {id: todo.id})

    return produce(state, draft => {
      const indexToUpdate = index === -1 ? 0 : index
      draft[todo.task_id][indexToUpdate] = todo
    })
  })

export const $completedTasksCount = combine(
  $tasksIds,
  $tasksById,
  (ids, byId) => size(filter(id => byId[id].is_completed, ids))
)
