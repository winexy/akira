import {AxiosError, AxiosInstance} from 'axios'
import {either} from '@/utils/either'
import {TaskT, CreateTaskDto} from '@store/tasks'

export function tasks(api: AxiosInstance) {
  return {
    all() {
      return either<AxiosError, TaskT[]>(api.get('/tasks'))
    },
    createTask(data: CreateTaskDto) {
      return either<AxiosError, TaskT>(api.post('/tasks', data))
    }
  }
}
