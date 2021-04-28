import React from 'react'
import {MenuIcon} from '@heroicons/react/solid'
import {toggleMenu} from '@store/menu'

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-20 px-4 py-2 flex items-center text-gray-700 bg-white shadow-2xl rounded-b-lg">
      <h1 className="font-bold text-xl font-mono">Akira</h1>
      <button
        className="
          ml-auto w-8 h-8 -mr-1
          flex items-center justify-center 
          rounded 
          transition ease-in duration-150
          active:bg-gray-100 active:bg-opacity-20
          focus:outline-none focus:ring
        "
        onClick={() => toggleMenu()}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
