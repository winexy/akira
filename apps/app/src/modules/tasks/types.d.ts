/* eslint-disable camelcase */
import {TaskTag} from '@modules/tags/types.d'
import {TaskList} from '@modules/lists/types.d'

export type Todo = {
  id: string
  title: string
  task_id: string
  is_completed: boolean
}

export type CheckList = Todo[]

export type TodoId = Todo['id']
export type TodoPatch = Partial<Omit<Todo, 'id' | 'task_id'>>

export type ApiTask = {
  id: string
  author_uid: string
  title: string
  description: string
  created_at: string
  updated_at: string
  is_completed: boolean
  list_id: number | null
  list: Omit<TaskList, 'tasksCount'>
  is_important: boolean
  checklist: Array<Todo>
  tags: Array<TaskTag>
}

export type TaskId = ApiTask['id']

type NonPatchableProps = 'id' | 'author_uid' | 'created_at' | 'updated_at'

export type TaskPatch = Partial<Omit<ApiTask, NonPatchableProps>>