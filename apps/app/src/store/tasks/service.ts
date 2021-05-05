import {arrayRemove, arrayUnion, db} from '@/firebase'
import {either} from '@/utils/either'
import {Either, left, right} from '@sweet-monads/either'
import M, {Maybe} from '@sweet-monads/maybe'
import {assert} from 'superstruct'
import {TaskT, Task, TaskIdT, TodoT, TodoIdT} from './types'

const collection = db.collection('tasks').withConverter({
  fromFirestore(snapshot) {
    const data = snapshot.data()
    assert(data, Task)
    return data
  },
  toFirestore(data: unknown) {
    return data as TaskT
  }
}) as CollectionReference<DocumentData>

function saveTask(task: TaskT) {
  return collection.doc(task.id).set(task)
}

async function getTask(
  id: TaskIdT
): Promise<Either<FirestoreError, Maybe<TaskT>>> {
  try {
    const snapshot = await collection.doc(id).get()
    return right(M.fromNullable(snapshot.data() as TaskT))
  } catch (error) {
    return left(error)
  }
}

async function getTasks(): Promise<Either<FirestoreError, TaskT[]>> {
  try {
    const snapshot = await collection.get()
    return right(snapshot.docs.map(t => t.data() as TaskT))
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

function addTodo(id: TaskIdT, todo: TodoT) {
  return either(
    collection.doc(id).set(
      {
        checklist: arrayUnion(todo)
      },
      {
        merge: true
      }
    )
  )
}

function removeTodo(id: TaskIdT, todo: TodoT) {
  return either(
    collection.doc(id).set(
      {
        checklist: arrayRemove(todo)
      },
      {
        merge: true
      }
    )
  )
}

export const TaskService = {
  getTask,
  getTasks,
  saveTask,
  updateTask,
  removeTask,
  addTodo,
  removeTodo
}
