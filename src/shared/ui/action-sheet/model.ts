import {app} from 'shared/lib/app-domain'

export const openActionSheet = app.createEvent<string>()
export const closeActionSheet = app.createEvent()

export const $activeActionSheet = app
  .createStore<string | null>(null)
  .on(openActionSheet, (_, name) => name)
  .on(closeActionSheet, () => null)
