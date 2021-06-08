import {api} from '@lib/api'
import {tasks} from './tasks/tasks'
import {checklist} from './checklist/checklist'

export const akira = {
  tasks: tasks(api),
  checklist: checklist(api)
}

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.akira = akira
}
