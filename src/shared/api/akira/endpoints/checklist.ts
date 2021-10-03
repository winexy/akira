import {AxiosInstance} from 'axios'
import {TaskId, TodoId, TodoPatch, Todo} from 'modules/tasks/types.d'
import {get} from 'lodash/fp'

export type CreateTodoDto = {
  taskId: TaskId
  title: string
}

export function checklist(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAllByTaskId(taskId: TaskId): Promise<Todo[]> {
      return api.get(`/checklist/${taskId}`).then(unwrap)
    },
    addTodo(dto: CreateTodoDto): Promise<Todo> {
      return api.post('/checklist', dto).then(unwrap)
    },
    removeTodo(taskId: TaskId, todoId: TodoId) {
      return api.delete(`/checklist/${taskId}/${todoId}`)
    },
    patchTodo(taskId: TaskId, todoId: TodoId, patch: TodoPatch): Promise<Todo> {
      return api.patch(`/checklist/${taskId}/${todoId}`, patch).then(unwrap)
    }
  }
}
