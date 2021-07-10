import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {TaskId, ApiTask} from '@modules/tasks/types.d'

export function myday(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    tasks(): Promise<ApiTask[]> {
      return api.get('myday').then(unwrap)
    },
    add(taskId: TaskId) {
      return api.post(`myday/${taskId}`)
    },
    remove(taskId: TaskId) {
      return api.delete(`myday/${taskId}`)
    }
  }
}
