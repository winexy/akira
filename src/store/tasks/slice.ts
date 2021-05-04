import findIndex from 'lodash/fp/findIndex'
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
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
  list: TaskT[]
}

const initialState: TasksState = {
  list: []
}

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(draft, action: PayloadAction<TaskT[]>) {
      draft.list = action.payload
    },
    prependTask(draft, action: PayloadAction<TaskT>) {
      draft.list.unshift(action.payload)
    },
    setTaskCompleted(state, {payload}: PayloadAction<CompleteTaskPayloadT>) {
      const idx = findIndex({id: payload.id}, state.list)
      const task = state.list[idx]

      task.completed = payload.completed
    },
    removeTask(state, {payload: id}: PayloadAction<TaskIdT>) {
      const idx = findIndex({id}, state.list)
      state.list.splice(idx, 1)
    },
    changeTaskPosition(state, action: PayloadAction<ChangePositionParams>) {
      const {fromIndex, toIndex} = action.payload
      const task = state.list[fromIndex]

      state.list.splice(fromIndex, 1)
      state.list.splice(toIndex, 0, task)
    },
    setTaskImportant(state, {payload}: PayloadAction<ImportantTaskPayloadT>) {
      const idx = findIndex({id: payload.id}, state.list)
      const task = state.list[idx]

      task.important = payload.important
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
  setTaskImportant
} = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
