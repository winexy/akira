import {api} from '@lib/api'
import {tasks} from './tasks/tasks'
import {checklist} from './checklist/checklist'
import {tags} from './tags'

export const akira = {
  tasks: tasks(api),
  tags: tags(api),
  checklist: checklist(api)
}

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.akira = akira
}
