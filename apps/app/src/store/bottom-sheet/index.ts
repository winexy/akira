import {createEvent, createStore} from 'effector'

export const $activeBottomSheet = createStore<string | null>(null)
export const showBottomSheet = createEvent<string>()
export const hideBottomSheet = createEvent()

$activeBottomSheet
  .on(showBottomSheet, (_, name) => name)
  .on(hideBottomSheet, () => null)
