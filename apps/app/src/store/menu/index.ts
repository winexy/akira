import {createEvent, createStore} from 'effector'
import {always} from '@/utils'

export const $isMenuOpen = createStore(false)
export const openMenu = createEvent()
export const closeMenu = createEvent()
export const toggleMenu = createEvent()

$isMenuOpen
  .on(openMenu, always(true))
  .on(closeMenu, always(false))
  .on(toggleMenu, isOpen => !isOpen)
