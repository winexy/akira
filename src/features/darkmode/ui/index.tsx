import {useStore} from 'effector-react'
import React from 'react'
import DarkThemePreview from '@images/dark-theme.jpg'
import LightThemePreview from '@images/light-theme.jpg'
import {Toggle} from '@shared/ui/toggle'
import {$isDarkMode, toggleDarkMode} from '@features/darkmode/model'

const DarkModePreview: React.FC = () => (
  <div className="grid grid-cols-2 gap-4 p-4">
    <img
      className="w-full rounded-lg shadow-md border-2 border-gray-200 dark:border-dark-400"
      src={DarkThemePreview}
      alt="dark theme preview"
    />
    <img
      className="w-full rounded-lg shadow-md border-2 border-gray-200 dark:border-dark-400"
      src={LightThemePreview}
      alt="light theme preview"
    />
  </div>
)

export const DarkMode: React.FC = () => {
  const isDarkMode = useStore($isDarkMode)

  return (
    <>
      <div className="mt-2 px-4 w-full flex justify-between">
        <span className="font-semibold text-lg ">Dark mode</span>
        <Toggle isChecked={isDarkMode} onChange={toggleDarkMode} />
      </div>
      <DarkModePreview />
    </>
  )
}
