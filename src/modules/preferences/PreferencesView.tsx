import React from 'react'
import {MainView} from '@/views/MainView'
import clsx from 'clsx'
import noop from 'lodash/fp/noop'
import {useStore} from 'effector-react'
import DarkThemePreview from '@/assets/images/dark-theme.jpg'
import LightThemePreview from '@/assets/images/light-theme.jpg'
import {$isDarkMode, toggleDarkMode} from './darkmode'

type TogglePropsT = {
  className?: string
  isChecked?: boolean
  onChange?(): void
}

const Toggle: React.FC<TogglePropsT> = ({
  className,
  isChecked = false,
  onChange = noop,
  children
}) => {
  return (
    <label className={clsx('flex items-center', className)}>
      {children}
      <div
        className={clsx(
          'w-14 h-8 p-1',
          'rounded-full bg-gray-200 shadow-inner',
          'transition',
          {
            'bg-blue-500 active:bg-blue-600 dark:bg-blue-500 dark:active:bg-blue-600': isChecked,
            'active:bg-gray-300': !isChecked
          }
        )}
      >
        <div
          className={clsx(
            'flex items-center justify-center',
            'rounded-full bg-white w-6 h-6 shadow',
            'transition ease-in-out duration-300 transform'
          )}
          style={{
            transform: isChecked ? `translateX(24px)` : ''
          }}
        >
          <div className="w-4 h-4 rounded-full bg-gray-100 shadow-inner" />
        </div>
        <input
          checked={isChecked}
          onChange={onChange}
          type="checkbox"
          className="sr-only"
        />
      </div>
    </label>
  )
}

const PreferencesView: React.FC = () => {
  const isDarkMode = useStore($isDarkMode)

  return (
    <MainView>
      <div className="mt-2 px-4 w-full flex justify-between">
        <span className="font-semibold text-lg ">Dark mode</span>
        <Toggle isChecked={isDarkMode} onChange={toggleDarkMode} />
      </div>
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
    </MainView>
  )
}

export default PreferencesView
