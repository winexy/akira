import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {TaskId, ApiTask} from 'modules/tasks/types.d'

export function myday(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    tasks(): Promise<ApiTask[]> {
      return api.get('task-scheduler/today').then(unwrap)
    },
    add(taskId: TaskId) {
      return api.post(`task-scheduler/schedule/today/${taskId}`)
    },
    remove(taskId: TaskId) {
      return api.delete(`task-scheduler/schedule/${taskId}`)
    }
  }
}
