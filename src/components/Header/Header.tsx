import React from 'react'
import {MenuIcon} from '@heroicons/react/solid'
import { useAuth0 } from '@auth0/auth0-react'

export const Header: React.FC = () => {
  const auth0 = useAuth0()
  
  return (
    <header className="sticky top-0 z-20 px-4 py-2 flex items-center bg-black bg-opacity-60 shadow-lg">
      <h1 className="font-bold text-xl text-white font-mono">Akira</h1>
      <button
        className="
          ml-auto w-8 h-8 -mr-1
          flex items-center justify-center 
          text-white rounded 
          transition ease-in duration-150
          active:bg-gray-100 active:bg-opacity-20
          focus:outline-none focus:ring
        "
        onClick={() => auth0.logout()}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
