import assign from 'lodash/fp/assign'
import findIndex from 'lodash/fp/findIndex'
import {storage} from '@/models/Storage'
import {nanoid} from 'nanoid'
import {is, object, string, number, boolean, Infer, array} from 'superstruct'
import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {RootState} from '..'
import {put, select, takeEvery} from 'redux-saga/effects'

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
type TaskID = TaskT['id']

const createTask = (title: string): TaskT => ({
  id: nanoid(),
  title,
  timestamp: Date.now(),
  checked: false
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
    setTasks(state, action: PayloadAction<TaskT[]>) {
      state.list = action.payload
    },
    addTask(state, action: PayloadAction<string>) {
      state.list.unshift(createTask(action.payload))
    },
    toggleTask(state, {payload: id}: PayloadAction<TaskID>) {
      const idx = findIndex({id}, state.list)
      const item = state.list[idx]

      state.list[idx] = assign(item, {checked: !item.checked})
    },
    removeTask(state, {payload: id}: PayloadAction<TaskID>) {
      const idx = findIndex({id}, state.list)
      delete state.list[idx]
    },
    changeTaskPosition(state, action: PayloadAction<ChangePositionParams>) {
      const {fromIndex, toIndex} = action.payload
      const task = state.list[fromIndex]

      state.list.splice(fromIndex, 1)
      state.list.splice(toIndex, 0, task)
    }
  }
})

export const loadTasks = createAction('loadTasks')
export const {
  addTask,
  toggleTask,
  removeTask,
  changeTaskPosition,
  setTasks
} = tasksSlice.actions

export const selectTasks = (state: RootState) => state.tasks.list

export const tasksReducer = tasksSlice.reducer

function* syncStorageSaga() {
  const tasks: ReturnType<typeof selectTasks> = yield select(selectTasks)
  storage.set('akira:tasks', tasks)
}

function* loadTasksSaga() {
  const data = storage.get('akira:tasks', [])

  if (is(data, Tasks)) {
    yield put(setTasks(data))
  } else {
    yield put(setTasks([]))
  }
}

export function* tasksSaga() {
  yield takeEvery(loadTasks.toString(), loadTasksSaga)
  yield takeEvery('*', syncStorageSaga)
}
