/* eslint-disable camelcase */
import {object, string, boolean, Infer, array, optional} from 'superstruct'

export const Todo = object({
  id: string(),
  title: string(),
  completed: boolean()
})

export const CheckList = array(Todo)

export const Task = object({
  id: string(),
  author_uid: string(),
  title: string(),
  created_at: string(),
  updated_at: string(),
  is_completed: boolean(),
  is_important: boolean(),
  checklist: optional(array(Todo))
})

export const Tasks = array(Task)

export type TaskT = Infer<typeof Task>
export type TaskIdT = TaskT['id']
export type TodoT = Infer<typeof Todo>
export type TodoIdT = TodoT['id']
export type CheckListT = Infer<typeof CheckList>

export type CreateTaskDto = {
  title: string
  author_uid: string
}
