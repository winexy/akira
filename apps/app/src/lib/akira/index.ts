import {api} from '@lib/api'
import {tasks} from './tasks/tasks'

export const akira = {
  tasks: tasks(api)
}
