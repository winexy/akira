/* eslint-disable camelcase */
import {AxiosInstance} from 'axios'
import qs from 'qs'
import get from 'lodash/fp/get'
import {
  ApiTask,
  TaskId,
  TaskPatch,
  CreateTaskPayload,
} from 'modules/tasks/types.d'

type IntBool = 1 | 0

type QueryParams = Partial<{
  is_completed: IntBool
  is_important: IntBool
  is_today: IntBool
}>

export function tasks(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAll(params: QueryParams = {}): Promise<ApiTask[]> {
      return api.get(`tasks?${qs.stringify(params)}`).then(unwrap)
    },
    create(payload: CreateTaskPayload): Promise<ApiTask> {
      return api.post('tasks', payload).then(unwrap)
    },
    findOne(id: TaskId): Promise<ApiTask> {
      return api.get(`tasks/${id}`).then(unwrap)
    },
    toggleCompletness(id: TaskId): Promise<ApiTask> {
      return api.patch(`tasks/${id}/complete/toggle`).then(unwrap)
    },
    toggleImportance(id: TaskId): Promise<ApiTask> {
      return api.patch(`tasks/${id}/important/toggle`).then(unwrap)
    },
    delete(id: TaskId): Promise<true> {
      return api.delete(`tasks/${id}`).then(unwrap)
    },
    patch(id: TaskId, patch: TaskPatch): Promise<ApiTask> {
      return api.patch(`tasks/${id}`, patch).then(unwrap)
    },
    addTag(id: TaskId, tagId: number): Promise<void> {
      return api.post(`tasks/${id}/tags/${tagId}`)
    },
    removeTag(id: TaskId, tagId: number): Promise<void> {
      return api.delete(`tasks/${id}/tags/${tagId}`)
    },
    week(): Promise<Array<ApiTask>> {
      return api.get('task-scheduler/week').then(unwrap)
    },
    clone(taskId: TaskId): Promise<string> {
      return api.post<ApiTask>(`tasks/clone/${taskId}`).then(res => {
        return res.data.id
      })
    },
  }
}
