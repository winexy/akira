import {createEvent, createStore} from 'effector'

export const $activeBottomSheet = createStore<string | null>(null)
export const showBottomSheet = createEvent<string>()
export const hideBottomSheet = createEvent<string | undefined>()

$activeBottomSheet
  .on(showBottomSheet, (_, name) => name)
  .on(hideBottomSheet, (state, name) => {
    if (!name || state === name) {
      return null
    }
    return state
  })
