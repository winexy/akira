import {TagT} from '@/store/tasks'
import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'

export function tags(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    all() {
      return api.get('tags').then(unwrap)
    },
    create(name: string): Promise<TagT> {
      return api
        .post('tags', {
          name,
          hex_color: '#fff',
          hex_bg: '#000'
        })
        .then(unwrap)
    },
    removeTag(tagId: number): Promise<number> {
      return api.delete(`tags/${tagId}`).then(unwrap)
    }
  }
}
