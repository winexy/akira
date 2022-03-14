import React, {FC} from 'react'
import clsx from 'clsx'
import {MenuIcon} from '@heroicons/react/solid'
import {toggleMenu} from 'shared/ui/menu'

export const Header: FC = () => {
  return (
    <header className="flex items-center px-4 py-2">
      <span role="img" aria-label="tomato emoji" className="text-xl">
        🍅
      </span>{' '}
      <span className={clsx('font-semibold ml-3 text-xl flex items-center')}>
        Pomodoro
      </span>
      <button
        className={clsx(
          'ml-auto w-8 h-8 -mr-1',
          'flex items-center justify-center ',
          'rounded ',
          'transition ease-in duration-150',
          'focus:outline-none',
          'dark:active:bg-dark-700',
        )}
        onClick={() => toggleMenu()}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
