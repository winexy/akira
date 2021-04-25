import { createEvent, createStore } from 'effector'

export const openMenu = createEvent()
export const closeMenu = createEvent()

export const $isMenuOpened = createStore(false)
  .on(openMenu, () => true)
  .on(closeMenu, () => false)

