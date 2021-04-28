import {merge, createEvent, createStore, Event, createEffect} from 'effector'
import produce from 'immer'
import assign from 'lodash/fp/assign'
import findIndex from 'lodash/fp/findIndex'
import remove from 'lodash/fp/remove'
import {storage} from '@/lib/Storage'
import {nanoid} from 'nanoid'
import {is, object, string, number, boolean, Infer, array} from 'superstruct'

type ChangePositionParams = {
  fromIndex: number
  toIndex: number
}

const Task = object({
  id: string(),
  title: string(),
  timestamp: number(),
  checked: boolean()
})

const Tasks = array(Task)

type TaskT = Infer<typeof Task>

const createTask = (title: string): TaskT => ({
  id: nanoid(),
  title,
  timestamp: Date.now(),
  checked: false
})

type UnpackEvent<Evt> = Evt extends Event<infer T> ? T : never

type ResolveReducers<Store, EventMap> = {
  [K in keyof EventMap]: (
    store: Store,
    payload: UnpackEvent<EventMap[K]>
  ) => Store
}

type ReducerMap = ResolveReducers<
  TaskT[],
  {
    addTask: typeof addTask
    removeTask: typeof removeTask
    toggleTask: typeof toggleTask
    changeTaskPosition: typeof changeTaskPosition
  }
>

const addTaskReducer: ReducerMap['addTask'] = (tasks, title) => {
  return produce(tasks, draft => {
    draft.unshift(createTask(title))
  })
}

const toggleTaskReducer: ReducerMap['toggleTask'] = (tasks, id) => {
  return produce(tasks, draft => {
    const idx = findIndex({id}, tasks)
    const item = draft[idx]

    draft[idx] = assign(item, {checked: !item.checked})
  })
}

const removeTaskReducer: ReducerMap['removeTask'] = (tasks, id) => {
  return remove({id}, tasks)
}

const changeTaskPositionReducer: ReducerMap['changeTaskPosition'] = (
  tasks,
  {fromIndex, toIndex}
) => {
  return produce(tasks, draft => {
    const task = draft[fromIndex]
    draft.splice(fromIndex, 1)
    draft.splice(toIndex, 0, task)
  })
}

export const addTask = createEvent<string>()
export const toggleTask = createEvent<TaskT['id']>()
export const removeTask = createEvent<TaskT['id']>()
export const changeTaskPosition = createEvent<ChangePositionParams>()

export const loadTasksFx = createEffect(() => {
  const tasks = storage.get('akira:tasks')
  return is(tasks, Tasks) ? tasks : []
})

const takeSecondArg = <T>(_: unknown, arg: T) => arg

export const $tasks = createStore<TaskT[]>([])
  .on(loadTasksFx.doneData, takeSecondArg)
  .on(addTask, addTaskReducer)
  .on(toggleTask, toggleTaskReducer)
  .on(removeTask, removeTaskReducer)
  .on(changeTaskPosition, changeTaskPositionReducer)

merge([addTask, toggleTask, removeTask, changeTaskPosition]).watch(() => {
  storage.set('akira:tasks', $tasks.getState())
})
