import {app} from '@store/app'
import {forward} from 'effector'

export const $isDarkMode = app.createStore(false, {
  name: 'isDarkMode'
})

export const toggleDarkMode = app.createEvent()

const toggleDarkModeClassFx = app.createEffect((isDarkMode: boolean) => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

const key = 'app:darkmode'

export const initAppThemeFx = app.createEffect(() => {
  return localStorage.getItem(key) === '1'
})

export const persistDarkModeFx = app.createEffect((isDarkMode: boolean) => {
  if (isDarkMode) {
    localStorage.setItem(key, '1')
  } else {
    localStorage.removeItem(key)
  }
})

forward({
  from: $isDarkMode,
  to: toggleDarkModeClassFx
})

forward({
  from: $isDarkMode,
  to: persistDarkModeFx
})

$isDarkMode
  .on(toggleDarkMode, isDarkMode => !isDarkMode)
  .on(initAppThemeFx.doneData, (_, isDarkMode) => isDarkMode)
