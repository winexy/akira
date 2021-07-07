/* eslint-disable camelcase */
import {AxiosInstance} from 'axios'
import qs from 'qs'
import get from 'lodash/fp/get'
import {TaskT} from '@store/tasks'
import {TaskIdT, TaskPatchT} from '@store/tasks/types'

type IntBool = 1 | 0

type QueryParams = Partial<{
  is_completed: IntBool
  is_important: IntBool
  is_today: IntBool
}>

export function tasks(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAll(params: QueryParams = {}): Promise<TaskT[]> {
      return api.get(`tasks?${qs.stringify(params)}`).then(unwrap)
    },
    create(title: string): Promise<TaskT> {
      return api.post('tasks', {title}).then(unwrap)
    },
    createForMyDay(title: string): Promise<TaskT> {
      return api.post('tasks/myday', {title}).then(unwrap)
    },
    findOne(id: TaskIdT): Promise<TaskT> {
      return api.get(`tasks/${id}`).then(unwrap)
    },
    toggleCompletness(id: TaskIdT): Promise<TaskT> {
      return api.patch(`tasks/${id}/complete/toggle`).then(unwrap)
    },
    toggleImportance(id: TaskIdT): Promise<TaskT> {
      return api.patch(`tasks/${id}/important/toggle`).then(unwrap)
    },
    delete(id: TaskIdT): Promise<true> {
      return api.delete(`tasks/${id}`).then(unwrap)
    },
    patch(id: TaskIdT, patch: TaskPatchT): Promise<TaskT> {
      return api.patch(`tasks/${id}`, patch).then(unwrap)
    },
    addTag(id: TaskIdT, tagId: number): Promise<void> {
      return api.post(`tasks/${id}/tags/${tagId}`)
    },
    removeTag(id: TaskIdT, tagId: number): Promise<void> {
      return api.delete(`tasks/${id}/tags/${tagId}`)
    }
  }
}
