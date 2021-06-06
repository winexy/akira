import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import keyBy from 'lodash/fp/keyBy'
import indexOf from 'lodash/fp/indexOf'
import filter from 'lodash/fp/filter'
import {combine, createEffect, createStore} from 'effector'
import {akira} from '@/lib/akira'
import produce from 'immer'
import {auth} from '@/firebase'
import isNull from 'lodash/isNull'
import size from 'lodash/fp/size'
import {v4 as uuid} from 'uuid'
import {rejectNotImplemented} from '@/utils'
import {TaskT, TaskIdT, TodoT, TodoIdT} from './types'

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

export const loadTasksFx = createEffect(akira.tasks.all)
export const loadTaskFx = createEffect(akira.tasks.one)
export const addTaskFx = createEffect((title: string) => {
  if (isNull(auth.currentUser)) {
    return Promise.reject(new Error('unauthorized'))
  }

  return akira.tasks.createTask({
    author_uid: auth.currentUser.uid,
    title
  })
})
export const removeTaskFx = createEffect(akira.tasks.delete)
export const toggleTaskFx = createEffect(akira.tasks.toggleCompleted)
export const toggleImportantFx = createEffect(akira.tasks.toggleImportant)
export const addTodoFx = createEffect(
  ({taskId, todoTitle}: AddTodoPayloadT) => {
    const todo: TodoT = {
      id: uuid(),
      title: todoTitle,
      completed: false
    }

    return rejectNotImplemented()
  }
)

export const removeTodoFx = createEffect(
  ({taskId, todoId}: RemoveTodoPayloadT) => {
    return rejectNotImplemented()
  }
)

export const changeTaskPositionFx = createEffect(
  (params: ChangePositionParams) => {
    return rejectNotImplemented()
  }
)

export const $tasksIds = createStore<TaskIdT[]>([])
  .on(loadTasksFx.doneData, (state, payload) => {
    return payload.isRight() ? map(get('id'), payload.value) : state
  })
  .on(addTaskFx.doneData, (state, payload) => {
    return produce(state, draft => {
      if (payload.isRight()) {
        draft.push(payload.value.id)
      }
    })
  })
  .on(removeTaskFx.done, (state, {params, result}) => {
    const taskId = params
    return produce(state, draft => {
      if (result.isRight()) {
        draft.splice(indexOf(taskId, draft), 1)
      }
    })
  })
  .on(changeTaskPositionFx.doneData, (state, payload) => {
    // const {fromIndex, toIndex} = action.payload
    // const id = state.list[fromIndex]
    // state.list.splice(fromIndex, 1)
    // state.list.splice(toIndex, 0, id)
  })

export const $tasksById = createStore<Record<TaskIdT, TaskT>>({})
  .on(loadTasksFx.doneData, (state, payload) => {
    return payload.isRight() ? keyBy('id', payload.value) : state
  })
  .on([loadTaskFx.doneData, addTaskFx.doneData], (state, payload) => {
    return produce(state, draft => {
      if (payload.isRight()) {
        const task = payload.value
        draft[task.id] = task
      }
    })
  })
  .on(removeTaskFx.done, (state, {params, result}) => {
    const taskId = params
    return produce(state, draft => {
      if (result.isRight()) {
        delete draft[taskId]
      }
    })
  })
  .on([toggleTaskFx.doneData, toggleImportantFx.doneData], (state, payload) => {
    return produce(state, draft => {
      if (payload.isRight()) {
        const task = payload.value
        draft[task.id] = task
      }
    })
  })

export const $completedTasksCount = combine(
  $tasksIds,
  $tasksById,
  (ids, byId) => size(filter(id => byId[id].is_completed, ids))
)
