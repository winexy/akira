import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {TaskIdT, TaskT} from '@store/tasks/types'

export function myday(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    tasks(): Promise<TaskT[]> {
      return api.get('myday').then(unwrap)
    },
    add(taskId: TaskIdT) {
      return api.post(`myday/${taskId}`)
    },
    remove(taskId: TaskIdT) {
      return api.delete(`myday/${taskId}`)
    }
  }
}
