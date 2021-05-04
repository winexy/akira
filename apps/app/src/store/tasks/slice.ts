import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import keyBy from 'lodash/fp/keyBy'
import indexOf from 'lodash/fp/indexOf'
import {TaskT, TaskIdT} from './types'

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

interface TasksState {
  byId: Record<TaskIdT, TaskT>
  list: TaskIdT[]
}

const initialState: TasksState = {
  byId: {},
  list: []
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(draft, action: PayloadAction<TaskT[]>) {
      draft.byId = keyBy('id', action.payload)
      draft.list = map(get('id'), action.payload)
    },
    setTaskById(draft, {payload: task}: PayloadAction<TaskT>) {
      draft.byId[task.id] = task
    },
    prependTask(draft, {payload: task}: PayloadAction<TaskT>) {
      draft.byId[task.id] = task
      draft.list.unshift(task.id)
    },
    setTaskCompleted(draft, {payload}: PayloadAction<CompleteTaskPayloadT>) {
      draft.byId[payload.id].completed = payload.completed
    },
    removeTask(draft, {payload: id}: PayloadAction<TaskIdT>) {
      delete draft.byId[id]
      draft.list.splice(indexOf(id, draft.list), 1)
    },
    changeTaskPosition(state, action: PayloadAction<ChangePositionParams>) {
      const {fromIndex, toIndex} = action.payload
      const id = state.list[fromIndex]

      state.list.splice(fromIndex, 1)
      state.list.splice(toIndex, 0, id)
    },
    setTaskImportant(draft, {payload}: PayloadAction<ImportantTaskPayloadT>) {
      draft.byId[payload.id].important = payload.important
    }
  }
})

export const loadTasks = createAction('loadTasks')
export const loadTask = createAction<TaskIdT>('loadTask')
export const addTask = createAction<string>('addTask')
export const toggleTask = createAction<TaskIdT>('toggleTask')
export const toggleImportant = createAction<TaskIdT>('toggleImportant')

export const {
  removeTask,
  prependTask,
  setTaskCompleted,
  changeTaskPosition,
  setTasks,
  setTaskById,
  setTaskImportant
} = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
