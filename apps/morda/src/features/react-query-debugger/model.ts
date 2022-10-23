import {app} from 'shared/lib/app-domain'
import {invert} from 'shared/lib/utils'

const toggleReactQueryDebugger = app.event()

const $showReactQueryDebugger = app
  .store(false)
  .on(toggleReactQueryDebugger, invert)

export const reactQueryDebuggerModel = {
  toggleReactQueryDebugger,
  $showReactQueryDebugger,
}
