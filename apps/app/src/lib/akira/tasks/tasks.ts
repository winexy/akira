import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {TaskT, CreateTaskDto} from '@store/tasks'
import {TaskIdT, TaskPatchT} from '@store/tasks/types'

export function tasks(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    all(): Promise<TaskT[]> {
      return api.get('tasks').then(unwrap)
    },
    createTask(data: CreateTaskDto): Promise<TaskT> {
      return api.post('tasks', data).then(unwrap)
    },
    one(id: TaskIdT): Promise<TaskT> {
      return api.get(`tasks/${id}`).then(unwrap)
    },
    toggleCompleted(id: TaskIdT): Promise<TaskT> {
      return api.patch(`tasks/${id}/complete/toggle`).then(unwrap)
    },
    toggleImportant(id: TaskIdT): Promise<TaskT> {
      return api.patch(`tasks/${id}/important/toggle`).then(unwrap)
    },
    delete(id: TaskIdT): Promise<true> {
      return api.delete(`tasks/${id}`).then(unwrap)
    },
    patch(id: TaskIdT, patch: TaskPatchT): Promise<TaskT> {
      return api.patch(`tasks/${id}`, patch).then(unwrap)
    }
  }
}
