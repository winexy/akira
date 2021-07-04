import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'

type TaskList = {
  id: number
  title: string
  // eslint-disable-next-line
  author_uid: string
}

export function lists(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAll(): Promise<TaskList[]> {
      return api.get('lists').then(unwrap)
    },
    create(title: string) {
      return api.post('lists', {title}).then(unwrap)
    },
    remove(listId: TaskList['id']) {
      return api.delete(`lists/${listId}`).then(unwrap)
    }
  }
}
