import React from 'react'
import clsx from 'clsx'
import {MenuIcon} from '@heroicons/react/solid'
import isUndefined from 'lodash/fp/isUndefined'
import {toggleMenu} from '@store/menu'
import {useDispatch} from '@store/index'
import {Link} from 'react-router-dom'

export const Header: React.FC = ({children}) => {
  const dispatch = useDispatch()

  return (
    <header
      className={clsx(
        'sticky top-0 z-20 px-4 py-2',
        'flex items-center',
        'bg-gradient-to-b from-white to-gray-100',
        'text-gray-700'
      )}
    >
      {isUndefined(children) ? (
        <Link to="/">
          <h1 className="font-bold text-xl font-mono">Akira</h1>
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
        "
        onClick={() => dispatch(toggleMenu())}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
