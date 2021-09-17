import React from 'react'
import {MainView} from '@/views/MainView'
import clsx from 'clsx'
import noop from 'lodash/fp/noop'
import {useStore} from 'effector-react'
import {$isDarkMode, toggleDarkModeFx} from './darkmode'

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
            'bg-blue-500 active:bg-blue-600': isChecked,
            'active:bg-gray-300': !isChecked
          }
        )}
      >
        <div
          className={clsx(
            'rounded-full bg-white w-6 h-6 shadow',
            'transition ease-in-out duration-300 transform'
          )}
          style={{
            transform: isChecked ? `translateX(24px)` : ''
          }}
        />
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

export const PreferencesView: React.FC = () => {
  const isDarkMode = useStore($isDarkMode)

  return (
    <MainView>
      <div className="mt-2 px-4 w-full flex justify-between">
        <span className="font-semibold text-lg ">Dark mode</span>
        <Toggle isChecked={isDarkMode} onChange={toggleDarkModeFx} />
      </div>
    </MainView>
  )
}
