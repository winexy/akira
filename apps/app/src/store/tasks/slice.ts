import filter from 'lodash/fp/filter'
import {akira} from '@/lib/akira'
import produce from 'immer'
import {rejectNotImplemented} from '@/utils'
import {findIndex} from 'lodash'
import {TaskIdT, TodoT, TodoIdT, TodoPatchT} from './types'
import {app} from '../app'

type ChangePositionParams = {
  fromIndex: number
  toIndex: number
}
export type AddTodoPayloadT = {
  taskId: TaskIdT
  todoTitle: string
}

export type RemoveTodoPayloadT = {
  taskId: TaskIdT
  todoId: TodoIdT
}

export type PatchTodoPayloadT = {
  taskId: TaskIdT
  todoId: TodoIdT
  patch: TodoPatchT
}

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

export const patchTodoFx = app.effect(
  ({taskId, todoId, patch}: PatchTodoPayloadT) => {
    return akira.checklist.patchTodo(taskId, todoId, patch)
  }
)

export const $checklistByTaskId = app
  .store<Record<TaskIdT, TodoT[]>>({})
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
