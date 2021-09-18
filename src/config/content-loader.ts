import {$isDarkMode} from '@/modules/preferences/darkmode'
import {useStore} from 'effector-react'

export function useContentLoaderColor() {
  const isDarkMode = useStore($isDarkMode)

  return {
    backgroundColor: isDarkMode ? '#474747' : '#ffffff',
    foregroundColor: isDarkMode ? '#383838' : '#e9e9e9'
  }
}
