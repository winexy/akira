import {
  object,
  string,
  number,
  boolean,
  Infer,
  array,
  optional
} from 'superstruct'

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
  timestamp: number(),
  completed: boolean(),
  important: boolean(),
  checklist: optional(array(Todo))
})

export const Tasks = array(Task)

export type TaskT = Infer<typeof Task>
export type TaskIdT = TaskT['id']
export type TodoT = Infer<typeof Todo>
export type TodoIdT = TodoT['id']
export type CheckListT = Infer<typeof CheckList>
