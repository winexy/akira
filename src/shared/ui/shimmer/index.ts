import {useStore} from 'effector-react'
import {$isDarkMode} from '@/features/darkmode/model'

export function useShimmerColors() {
  const isDarkMode = useStore($isDarkMode)

  return {
    backgroundColor: isDarkMode ? '#474747' : '#ffffff',
    foregroundColor: isDarkMode ? '#383838' : '#e9e9e9'
  }
}
