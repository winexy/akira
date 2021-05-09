/* eslint-disable camelcase */
import {call, put, select, takeEvery} from 'redux-saga/effects'
import {v4 as uuid} from 'uuid'
import {auth} from '@/firebase/firebase'
import isUndefined from 'lodash/fp/isUndefined'
import {fromMaybe} from '@/utils/either'
import {TaskService} from './service'
import {
  addTask,
  loadTasks,
  loadTask,
  prependTask,
  removeTask,
  setTaskCompleted,
  setTasks,
  toggleTask,
  toggleImportant,
  setTaskImportant,
  setTaskById,
  addTodo,
  todoAdded,
  todoRemoved,
  removeTodo
} from './slice'
import {CreateTaskDto, TodoT} from './types'
import {selectTask, selectTaskTodo} from './selectors'
import {akira} from '../../lib/akira/index'

function* loadTasksSaga() {
  const tasks: LazyThen<typeof akira.tasks.all> = yield call(akira.tasks.all)

  if (tasks.isRight()) {
    yield put(setTasks(tasks.value))
  }
}

function* loadTaskSaga({payload: id}: ReturnType<typeof loadTask>) {
  const result: LazyThen<typeof akira.tasks.one> = yield call(
    akira.tasks.one,
    id
  )

  if (result.isRight()) {
    yield put(setTaskById(result.value))
  } else {
    window.console.error(result.value)
  }
}

function createTaskDto(title: string, uid: string): CreateTaskDto {
  return {
    title,
    author_uid: uid
  }
}

function* addTaskSaga(action: ReturnType<typeof addTask>) {
  const title = action.payload
  const {uid} = auth.currentUser!

  const result: LazyThen<typeof akira.tasks.createTask> = yield call(
    akira.tasks.createTask,
    createTaskDto(title, uid)
  )

  if (result.isRight()) {
    yield put(prependTask(result.value))
  }
}

function* removeTaskSaga(action: ReturnType<typeof removeTask>) {
  const id = action.payload

  yield call(TaskService.removeTask, id)
}

function* toggleTaskSaga({payload: id}: ReturnType<typeof toggleTask>) {
  const task: RT2<typeof selectTask> = yield select(selectTask(id))

  if (isUndefined(task)) {
    return
  }

  const result: LazyThen<typeof akira.tasks.completeToggle> = yield call(
    akira.tasks.completeToggle,
    id
  )

  if (result.isRight()) {
    yield put(setTaskCompleted({id, completed: result.value.is_completed}))
  }
}

function* toggleImportantSaga({
  payload: id
}: ReturnType<typeof toggleImportant>) {
  const task: RT2<typeof selectTask> = yield select(selectTask(id))

  if (isUndefined(task)) {
    return
  }

  const prevState = task.is_important
  const nextState = !prevState

  yield put(setTaskImportant({id, important: nextState}))

  const result: LazyThen<
    typeof TaskService.updateTask
  > = yield call(TaskService.updateTask, id, {is_important: nextState})

  if (result.isLeft()) {
    yield put(setTaskImportant({id, important: prevState}))
  }
}

function createTodo(title: string): TodoT {
  return {
    id: uuid(),
    title,
    completed: false
  }
}

function* addTodoSaga(action: ReturnType<typeof addTodo>) {
  const {taskId, todoTitle} = action.payload
  const todo = createTodo(todoTitle)

  yield put(todoAdded({taskId, todo}))

  const result: LazyThen<typeof TaskService.addTodo> = yield call(
    TaskService.addTodo,
    taskId,
    todo
  )

  if (result.isLeft()) {
    yield put(todoRemoved({taskId, todoId: todo.id}))
  }
}

function* removeTodoSaga(action: ReturnType<typeof removeTodo>) {
  const {taskId, todoId} = action.payload
  const todo: RT2<typeof selectTaskTodo> = yield select(
    selectTaskTodo(taskId, todoId)
  )

  if (isUndefined(todo)) {
    return
  }

  yield put(todoRemoved({taskId, todoId}))

  const result: LazyThen<typeof TaskService.removeTodo> = yield call(
    TaskService.removeTodo,
    taskId,
    todo
  )

  if (result.isLeft()) {
    yield put(todoAdded({taskId, todo}))
  }
}

export default function* saga() {
  yield takeEvery(loadTasks.toString(), loadTasksSaga)
  yield takeEvery(loadTask.toString(), loadTaskSaga)
  yield takeEvery(addTask.toString(), addTaskSaga)
  yield takeEvery(removeTask.toString(), removeTaskSaga)
  yield takeEvery(toggleTask.toString(), toggleTaskSaga)
  yield takeEvery(toggleImportant.toString(), toggleImportantSaga)
  yield takeEvery(addTodo.toString(), addTodoSaga)
  yield takeEvery(removeTodo.toString(), removeTodoSaga)
}
