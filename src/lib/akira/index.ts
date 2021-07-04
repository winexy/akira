import {api} from '@lib/api'
import {tasks} from './tasks/tasks'
import {checklist} from './checklist/checklist'
import {tags} from './tags'
import {myday} from './myday'
import {lists} from './lists'

export const akira = {
  tasks: tasks(api),
  tags: tags(api),
  myday: myday(api),
  lists: lists(api),
  checklist: checklist(api)
}

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.akira = akira
}
