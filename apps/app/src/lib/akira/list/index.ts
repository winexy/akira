import {AxiosInstance} from 'axios'
import get from 'lodash/fp/get'

export function list(api: AxiosInstance) {
  const unwrap = get('data')

  return {
    create(title: string) {
      return api.post('lists', {title}).then(unwrap)
    }
  }
}
