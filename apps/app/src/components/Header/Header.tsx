import React from 'react'
import {MenuIcon} from '@heroicons/react/solid'
import isUndefined from 'lodash/fp/isUndefined'
import {toggleMenu} from '@store/menu'
import {useDispatch} from '@store/index'

export const Header: React.FC = ({children}) => {
  const dispatch = useDispatch()

  return (
    <header className="sticky top-0 z-20 px-4 py-2 flex items-center text-gray-700 bg-white shadow-2xl rounded-b-lg">
      {isUndefined(children) ? (
        <h1 className="font-bold text-xl font-mono">Akira</h1>
      ) : (
        children
      )}
      <button
        className="
          ml-auto w-8 h-8 -mr-1
          flex items-center justify-center 
          rounded 
          transition ease-in duration-150
          active:bg-gray-100 active:bg-opacity-20
          focus:outline-none focus:ring
        "
        onClick={() => dispatch(toggleMenu())}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
