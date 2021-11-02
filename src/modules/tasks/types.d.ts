/* eslint-disable camelcase */
import {TaskTag} from 'modules/tags/types.d'
import {TaskList} from 'modules/lists/types.d'

export type Todo = {
  id: string
  title: string
  task_id: string
  is_completed: boolean
}

export type CheckList = Todo[]

export type TodoId = Todo['id']
export type TodoPatch = Partial<Omit<Todo, 'id' | 'task_id'>>

type Recurrence = {
  id: number
  author_uid: string
  next_date: string
  rule: string
  source_task_id: string
}

export type ApiTask = {
  id: string
  author_uid: string
  title: string
  description: string
  created_at: string
  updated_at: string
  due_date: string | null
  is_completed: boolean
  list_id: number | null
  list: Omit<TaskList, 'tasksCount'>
  is_important: boolean
  checklist: Array<Todo>
  tags: Array<TaskTag>
  date: string | null
  recurrence: Recurrence | null
}

export type TaskId = ApiTask['id']

type NonPatchableProps = 'id' | 'author_uid' | 'created_at' | 'updated_at'

export type TaskPatch = Partial<Omit<ApiTask, NonPatchableProps>>

export type CreateTaskMeta = {
  date: string
  tags: Array<number>
  list_id?: number
}

export type CreateTaskPayload = {
  task: {
    title: string
    description: string
  }
  meta: CreateTaskMeta
}
