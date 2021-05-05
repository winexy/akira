import {createAction, createSlice, PayloadAction} from '@reduxjs/toolkit'
import get from 'lodash/fp/get'
import map from 'lodash/fp/map'
import keyBy from 'lodash/fp/keyBy'
import indexOf from 'lodash/fp/indexOf'
import filter from 'lodash/fp/filter'
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
    },
    todoAdded(draft, action: PayloadAction<TodoAddedPayloadT>) {
      const {taskId, todo} = action.payload
      const task = draft.byId[taskId]
      const newChecklist = task.checklist || []

      newChecklist.push(todo)

      task.checklist = newChecklist
    },
    todoRemoved(draft, action: PayloadAction<TodoRemovedPayloadT>) {
      const {taskId, todoId} = action.payload
      const task = draft.byId[taskId]

      task.checklist = filter(todo => todo.id !== todoId, task.checklist)
    }
  }
})

export const loadTasks = createAction('loadTasks')
export const loadTask = createAction<TaskIdT>('loadTask')
export const addTask = createAction<string>('addTask')
export const toggleTask = createAction<TaskIdT>('toggleTask')
export const toggleImportant = createAction<TaskIdT>('toggleImportant')
export const addTodo = createAction<AddTodoPayloadT>('addTodo')
export const removeTodo = createAction<RemoveTodoPayloadT>('removeTodo')

export const {
  removeTask,
  prependTask,
  setTaskCompleted,
  changeTaskPosition,
  setTasks,
  setTaskById,
  setTaskImportant,
  todoAdded,
  todoRemoved
} = tasksSlice.actions

export const tasksReducer = tasksSlice.reducer
