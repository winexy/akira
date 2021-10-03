import {AxiosInstance} from 'axios'
import {TaskList, NewList} from 'modules/lists/types.d'
import get from 'lodash/fp/get'

export function lists(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    findAll(): Promise<TaskList[]> {
      return api.get('lists').then(unwrap)
    },
    create(title: string): Promise<NewList> {
      return api.post('lists', {title}).then(unwrap)
    },
    remove(listId: TaskList['id']) {
      return api.delete(`lists/${listId}`).then(unwrap)
    }
  }
}
