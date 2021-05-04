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
  setTaskById
} from './slice'
import {TaskT} from './types'
import {selectTask} from './selectors'

function* loadTasksSaga() {
  const tasks: LazyThen<typeof TaskService.getTasks> = yield call(
    TaskService.getTasks
  )

  if (tasks.isRight()) {
    yield put(setTasks(tasks.value))
  }
}

function* loadTaskSaga({payload: id}: ReturnType<typeof loadTask>) {
  const result: LazyThen<typeof TaskService.getTask> = yield call(
    TaskService.getTask,
    id
  )

  const task = result.chain(fromMaybe)

  if (task.isRight()) {
    yield put(setTaskById(task.value))
  }
}

function createTask(title: string, uid: string): TaskT {
  return {
    id: uuid(),
    title,
    author_uid: uid,
    timestamp: Date.now(),
    completed: false,
    important: false
  }
}

function* addTaskSaga(action: ReturnType<typeof addTask>) {
  const title = action.payload
  const {uid} = auth.currentUser!
  const task = createTask(title, uid)

  yield put(prependTask(task))
  yield call(TaskService.saveTask, task)
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

  const prevState = task.completed
  const nextState = !prevState

  yield put(setTaskCompleted({id, completed: nextState}))

  const result: LazyThen<
    typeof TaskService.updateTask
  > = yield call(TaskService.updateTask, id, {completed: nextState})

  if (result.isLeft()) {
    yield put(setTaskCompleted({id, completed: prevState}))
  }
}

function* toggleImportantSaga({
  payload: id
}: ReturnType<typeof toggleImportant>) {
  const task: RT2<typeof selectTask> = yield select(selectTask(id))

  if (isUndefined(task)) {
    return
  }

  const prevState = task.important
  const nextState = !prevState

  yield put(setTaskImportant({id, important: nextState}))

  const result: LazyThen<
    typeof TaskService.updateTask
  > = yield call(TaskService.updateTask, id, {important: nextState})

  if (result.isLeft()) {
    yield put(setTaskImportant({id, important: prevState}))
  }
}

export default function* saga() {
  yield takeEvery(loadTasks.toString(), loadTasksSaga)
  yield takeEvery(loadTask.toString(), loadTaskSaga)
  yield takeEvery(addTask.toString(), addTaskSaga)
  yield takeEvery(removeTask.toString(), removeTaskSaga)
  yield takeEvery(toggleTask.toString(), toggleTaskSaga)
  yield takeEvery(toggleImportant.toString(), toggleImportantSaga)
}
