import {db} from '@/firebase'
import {either} from '@/utils/either'
import {Either, left, right} from '@sweet-monads/either'
import M, {Maybe} from '@sweet-monads/maybe'
import {assert, partial} from 'superstruct'
import {TaskT, Task, TaskIdT} from './types'

const collection = db.collection('tasks').withConverter({
  fromFirestore(snapshot) {
    const data = snapshot.data()
    assert(data, Task)
    return data
  },
  toFirestore(data: unknown) {
    assert(data, partial(Task))
    return data
  }
}) as CollectionReference<TaskT>

function saveTask(task: TaskT) {
  return collection.doc(task.id).set(task)
}

async function getTask(
  id: TaskIdT
): Promise<Either<FirestoreError, Maybe<TaskT>>> {
  try {
    const snapshot = await collection.doc(id).get()
    return right(M.fromNullable(snapshot.data()))
  } catch (error) {
    return left(error)
  }
}

async function getTasks(): Promise<Either<FirestoreError, TaskT[]>> {
  try {
    const snapshot = await collection.get()
    return right(snapshot.docs.map(t => t.data()))
  } catch (error) {
    return left(error)
  }
}

function updateTask(id: TaskIdT, payload: Partial<TaskT>) {
  return either(
    collection.doc(id).set(payload, {
      merge: true
    })
  )
}

function removeTask(id: TaskIdT) {
  return collection.doc(id).delete()
}

export const TaskService = {
  getTask,
  getTasks,
  saveTask,
  updateTask,
  removeTask
}
