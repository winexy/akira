import findIndex from 'lodash/fp/findIndex'
import {storage} from '@/lib/Storage'
import {nanoid} from 'nanoid'
import find from 'lodash/fp/find'
import size from 'lodash/fp/size'
import filter from 'lodash/fp/filter'
import {is, object, string, number, boolean, Infer, array} from 'superstruct'
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {put, select, takeEvery} from 'redux-saga/effects'
import {RootState} from '..'

type ChangePositionParams = {
  fromIndex: number
  toIndex: number
}

const Task = object({
  id: string(),
  title: string(),
  timestamp: number(),
  completed: boolean(),
  important: boolean()
})

const Tasks = array(Task)

export type TaskT = Infer<typeof Task>
export type TaskIdT = TaskT['id']

const createTask = (title: string): TaskT => ({
  id: nanoid(),
  title,
  timestamp: Date.now(),
  completed: false,
  important: false
})

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
    addTask(draft, action: PayloadAction<string>) {
      draft.list.unshift(createTask(action.payload))
    },
    toggleTask(state, {payload: id}: PayloadAction<TaskIdT>) {
      const idx = findIndex({id}, state.list)
      const task = state.list[idx]

      task.completed = !task.completed
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
    toggleImportant(state, action: PayloadAction<TaskIdT>) {
      const idx = findIndex({id: action.payload}, state.list)
      const task = state.list[idx]

      task.important = !task.important
    }
  }
})

export const loadTasks = createAction('loadTasks')
export const {
  addTask,
  toggleTask,
  removeTask,
  changeTaskPosition,
  setTasks,
  toggleImportant
} = tasksSlice.actions

export const selectTasks = (state: RootState) => state.tasks.list

export const selectTask = (id: TaskIdT) => (state: RootState) =>
  find({id}, state.tasks.list)

export const selectCompletedTasksCount = (state: RootState) =>
  size(filter({completed: true}, state.tasks.list))

export const tasksReducer = tasksSlice.reducer

function* syncStorageSaga() {
  const tasks: ReturnType<typeof selectTasks> = yield select(selectTasks)
  storage.set('akira:tasks', tasks)
}

function* loadTasksSaga() {
  const data = storage.get('akira:tasks', [])
  const tasks = is(data, Tasks) ? data : []

  yield put(setTasks(tasks))
}

export function* tasksSaga() {
  yield takeEvery(loadTasks.toString(), loadTasksSaga)
  yield takeEvery('*', syncStorageSaga)
}
