import {AxiosError, AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {either} from '@/utils/either'
import {TaskT, CreateTaskDto} from '@store/tasks'

export function tasks(api: AxiosInstance) {
  return {
    all() {
      return either<AxiosError, TaskT[]>(api.get('/tasks').then(get('data')))
    },
    createTask(data: CreateTaskDto) {
      return either<AxiosError, TaskT>(
        api.post('/tasks', data).then(get('data'))
      )
    },
    one(id: TaskT['id']) {
      return either<AxiosError, TaskT>(
        api.get(`/tasks/${id}`).then(get('data'))
      )
    }
  }
}
