import {AxiosInstance} from 'axios'
import {TaskIdT, TodoT} from '@store/tasks/types'
import {get} from 'lodash/fp'

export type CreateTodoDto = {
  taskId: TaskIdT
  title: string
}

export function checklist(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAllByTaskId(taskId: TaskIdT) {
      return api.get(`/checklist/${taskId}`).then(unwrap)
    },
    addTodo(dto: CreateTodoDto): Promise<TodoT> {
      return api.post('/checklist', dto).then(unwrap)
    }
  }
}
