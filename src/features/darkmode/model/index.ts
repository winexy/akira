import {forward} from 'effector'
import {app} from 'shared/lib/app-domain'
import {withPersist} from 'shared/lib/with-persist'

const $isDarkModeStore = app.createStore(false, {
  name: 'isDarkMode',
})

export const toggleDarkMode = app.createEvent()

const toggleDarkModeClassFx = app.createEffect((isDarkMode: boolean) => {
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
})

forward({
  from: $isDarkModeStore,
  to: toggleDarkModeClassFx,
})

export const $isDarkMode = withPersist($isDarkModeStore)

$isDarkMode.on(toggleDarkMode, isDarkMode => !isDarkMode)
