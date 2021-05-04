import {object, string, number, boolean, Infer, array} from 'superstruct'

export const Task = object({
  id: string(),
  author_uid: string(),
  title: string(),
  timestamp: number(),
  completed: boolean(),
  important: boolean()
})

export const Tasks = array(Task)

export type TaskT = Infer<typeof Task>
export type TaskIdT = TaskT['id']
