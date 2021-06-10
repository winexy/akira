import {AxiosInstance} from 'axios'
import {TaskIdT, TodoIdT, TodoPatchT, TodoT} from '@store/tasks/types'
import {get} from 'lodash/fp'

export type CreateTodoDto = {
  taskId: TaskIdT
  title: string
}

export function checklist(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAllByTaskId(taskId: TaskIdT): Promise<TodoT[]> {
      return api.get(`/checklist/${taskId}`).then(unwrap)
    },
    addTodo(dto: CreateTodoDto): Promise<TodoT> {
      return api.post('/checklist', dto).then(unwrap)
    },
    removeTodo(taskId: TaskIdT, todoId: TodoIdT) {
      return api.delete(`/checklist/${taskId}/${todoId}`)
    },
    patchTodo(
      taskId: TaskIdT,
      todoId: TodoIdT,
      patch: TodoPatchT
    ): Promise<TodoT> {
      return api.patch(`/checklist/${taskId}/${todoId}`, patch).then(unwrap)
    }
  }
}
