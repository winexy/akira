/* eslint-disable camelcase */
import {
  object,
  string,
  boolean,
  Infer,
  array,
  number,
  nullable
} from 'superstruct'

export const Todo = object({
  id: string(),
  title: string(),
  task_id: string(),
  is_completed: boolean()
})

export const CheckList = array(Todo)

const Tag = object({
  hex_bg: string(),
  hex_color: string(),
  id: number(),
  name: string(),
  uid: string()
})

const TaskList = object({
  id: number(),
  author_uid: string(),
  title: string()
})

export const Task = object({
  id: string(),
  author_uid: string(),
  title: string(),
  description: string(),
  created_at: string(),
  updated_at: string(),
  is_completed: boolean(),
  list_id: nullable(number()),
  list: TaskList,
  is_important: boolean(),
  checklist: array(Todo),
  tags: array(Tag)
})

export type TagT = Infer<typeof Tag>

export const Tasks = array(Task)

export type TaskT = Infer<typeof Task>
export type TaskIdT = TaskT['id']

type NonPatchableProps = 'id' | 'author_uid' | 'created_at' | 'updated_at'
export type TaskPatchT = Partial<Omit<TaskT, NonPatchableProps>>

export type TodoT = Infer<typeof Todo>
export type TodoIdT = TodoT['id']
export type CheckListT = Infer<typeof CheckList>

export type TodoPatchT = Partial<Omit<TodoT, 'id' | 'task_id'>>

export type CreateTaskDto = {
  title: string
  author_uid: string
}
