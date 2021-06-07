import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {TaskT, CreateTaskDto} from '@store/tasks'

export function tasks(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    all(): Promise<TaskT[]> {
      return api.get('tasks').then(unwrap)
    },
    createTask(data: CreateTaskDto): Promise<TaskT> {
      return api.post('tasks', data).then(unwrap)
    },
    one(id: TaskT['id']): Promise<TaskT> {
      return api.get(`tasks/${id}`).then(unwrap)
    },
    toggleCompleted(id: TaskT['id']): Promise<TaskT> {
      return api.patch(`tasks/${id}/complete/toggle`).then(unwrap)
    },
    toggleImportant(id: TaskT['id']): Promise<TaskT> {
      return api.patch(`tasks/${id}/important/toggle`).then(unwrap)
    },
    delete(id: TaskT['id']): Promise<true> {
      return api.delete(`tasks/${id}`).then(unwrap)
    }
  }
}
