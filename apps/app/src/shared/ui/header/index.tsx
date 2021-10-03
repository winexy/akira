import React, {useEffect, useState} from 'react'
import clsx from 'clsx'
import {MenuIcon} from '@heroicons/react/solid'
import isUndefined from 'lodash/fp/isUndefined'
import {toggleMenu} from '@store/menu'
import {Link} from 'react-router-dom'
import {Akira} from '@shared/ui/akira'

export const Header: React.FC = ({children}) => {
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const listener = () => {
      setIsFloating(window.scrollY > 0)
    }

    window.addEventListener('scroll', listener, false)

    return () => {
      window.removeEventListener('scroll', listener)
    }
  }, [])

  return (
    <header
      className={clsx(
        'sticky w-full top-0 z-20 px-4 py-2',
        'flex items-center',
        'transition-shadow ease-in duration-100',
        'bg-white dark:bg-dark-600 text-gray-700 dark:text-white',
        {
          'shadow-2xl border-b bg-gray-100 dark:border-gray-600': isFloating
        }
      )}
    >
      {isUndefined(children) ? (
        <Link to="/" className="flex items-center">
          <Akira className="w-5 h-5 -mt-px" />
          <h1
            className="
              ml-2 font-bold text-xl font-mono 
              transition
              active:text-gray-900 
              dark:active:text-purple-300
            "
          >
            Akira
          </h1>
        </Link>
      ) : (
        children
      )}
      <button
        className="
          ml-auto w-8 h-8 -mr-1
          flex items-center justify-center 
          rounded 
          transition ease-in duration-150
          active:bg-gray-300
          focus:outline-none
          focus:bg-gray-200
        "
        onClick={() => toggleMenu()}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
