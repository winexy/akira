import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import keyBy from 'lodash/fp/keyBy'
import indexOf from 'lodash/fp/indexOf'
import filter from 'lodash/fp/filter'
import {combine} from 'effector'
import {akira} from '@/lib/akira'
import produce from 'immer'
import {auth} from '@/firebase'
import isNull from 'lodash/isNull'
import size from 'lodash/fp/size'
import {v4 as uuid} from 'uuid'
import {rejectNotImplemented} from '@/utils'
import {app} from '../app'
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

export const loadTasksFx = app.effect(akira.tasks.all)
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
export const addTodoFx = app.effect(({taskId, todoTitle}: AddTodoPayloadT) => {
  const todo: TodoT = {
    id: uuid(),
    title: todoTitle,
    completed: false
  }

  return rejectNotImplemented()
})

export const removeTodoFx = app.effect(
  ({taskId, todoId}: RemoveTodoPayloadT) => {
    return rejectNotImplemented()
  }
)

export const changeTaskPositionFx = app.effect(
  (params: ChangePositionParams) => {
    return rejectNotImplemented()
  }
)

export const $tasksIds = app
  .store<TaskIdT[]>([])
  .on(loadTasksFx.doneData, (_, tasks) => {
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
  .on(loadTasksFx.doneData, (_, tasks) => {
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
  .on([toggleTaskFx.doneData, toggleImportantFx.doneData], (state, task) => {
    return produce(state, draft => {
      draft[task.id] = task
    })
  })

export const $completedTasksCount = combine(
  $tasksIds,
  $tasksById,
  (ids, byId) => size(filter(id => byId[id].is_completed, ids))
)
