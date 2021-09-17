import {app} from '@store/app'
import {attach} from 'effector'

export const $isDarkMode = app.createStore(false)

const toggleDarkModeClassFx = app.createEffect((isDarkMode: boolean) => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  return isDarkMode
})

export const toggleDarkModeFx = attach({
  effect: toggleDarkModeClassFx,
  source: $isDarkMode,
  mapParams: (_: void, isDarkMode) => !isDarkMode
})

$isDarkMode.on(toggleDarkModeFx.doneData, (_, isDarkMode) => isDarkMode)
