import {AxiosError, AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {either} from '@/utils/either'
import {TaskT, CreateTaskDto} from '@store/tasks'

export function tasks(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    all() {
      return either<AxiosError, TaskT[]>(api.get('tasks').then(unwrap))
    },
    createTask(data: CreateTaskDto) {
      return either<AxiosError, TaskT>(api.post('tasks', data).then(unwrap))
    },
    one(id: TaskT['id']) {
      return either<AxiosError, TaskT>(api.get(`tasks/${id}`).then(unwrap))
    },
    toggleCompleted(id: TaskT['id']) {
      return either<AxiosError, TaskT>(
        api.patch(`tasks/${id}/complete/toggle`).then(unwrap)
      )
    },
    toggleImportant(id: TaskT['id']) {
      return either<AxiosError, TaskT>(
        api.patch(`tasks/${id}/important/toggle`).then(unwrap)
      )
    },
    delete(id: TaskT['id']) {
      return either<AxiosError, true>(api.delete(`tasks/${id}`).then(unwrap))
    }
  }
}
