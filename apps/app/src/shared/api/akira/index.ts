import {api} from 'shared/api'
import {checklist} from './endpoints/checklist'
import {lists} from './endpoints/lists'
import {tasks} from './endpoints/tasks'
import {myday} from './endpoints/myday'
import {tags} from './endpoints/tags'

export const akira = {
  checklist: checklist(api),
  tasks: tasks(api),
  tags: tags(api),
  myday: myday(api),
  lists: lists(api)
}

if (import.meta.env.DEV) {
  globalThis.console.info(
    '[info] akira client is available through window.akira'
  )
  // @ts-expect-error
  window.akira = akira
}
