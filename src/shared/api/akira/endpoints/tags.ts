import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'
import {taskTagModel} from 'entities/task-tag'

export function tags(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAll() {
      return api.get('tags').then(unwrap)
    },
    create(name: string): Promise<taskTagModel.TaskTag> {
      return api
        .post('tags', {
          name,
          hex_color: '#fff',
          hex_bg: '#000',
        })
        .then(unwrap)
    },
    remove(tagId: number): Promise<number> {
      return api.delete(`tags/${tagId}`).then(unwrap)
    },
  }
}
