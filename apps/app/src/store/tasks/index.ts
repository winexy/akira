import {declareAtom, declareAction} from '@reatom/core'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import findIndex from 'lodash/fp/findIndex'
import remove from 'lodash/fp/remove'
import {uid} from 'uid'
import {storage} from '@/models/Storage'

export type TaskT = {
  id: string
  title: string
  timestamp: number
  checked: boolean
}

type ChangePositionParams = {
  fromIndex: number
  toIndex: number
}

export const addTask = declareAction<string>()
export const toggleTask = declareAction<TaskT['id']>()
export const removeTask = declareAction<TaskT['id']>()
export const changeTaskPosition = declareAction<ChangePositionParams>()
export const loadTasks = declareAction()

const createTask = (title: string): TaskT => ({
  id: uid(),
  title,
  timestamp: Date.now(),
  checked: false
})

export const tasksAtom = declareAtom<TaskT[]>([], on => [
  on(loadTasks, () => storage.get<TaskT[]>('akira:tasks', [])),
  on(addTask, (tasks, title) => {
    return produce(tasks, draft => {
      draft.unshift(createTask(title))
    })
  }),

  on(toggleTask, (tasks, id) => {
    return produce(tasks, draft => {
      const idx = findIndex({id}, tasks)
      const item = draft[idx]

      draft[idx] = assign(item, {checked: !item.checked})
    })
  }),
  on(removeTask, (tasks, id) => remove({id}, tasks)),
  on(changeTaskPosition, (tasks, {fromIndex, toIndex}) => {
    console.log(tasks.map(t => t.title))

    const newState = produce(tasks, draft => {
      const task = draft[fromIndex]

      draft.splice(fromIndex, 1)
      draft.splice(toIndex, 0, task)
    })

    console.log(newState.map(t => t.title))

    return newState
  })
])
