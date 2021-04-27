import React from 'react'
import {useAuth0} from '@auth0/auth0-react'
import {LoginIcon} from '@heroicons/react/solid'

export const AuthView: React.FC = () => {
  const {loginWithRedirect} = useAuth0()

  return (
    <div className="flex-1 flex-col flex justify-end items-center p-6">
      <h1 className="flex items-center text-gray-700 font-bold text-4xl mb-4 self-start">
        Welcome
      </h1>
      <button
        type="button"
        className="
          z-10
          w-full flex justify-center items-center
          px-8 py-3
          font-bold text-white
          rounded
          border border-gray-700
          transition ease-in duration-150
          active:bg-gray-700
          active:text-white
          active:shadow-xl
          focus:outline-none
        "
        onClick={loginWithRedirect}
      >
        <LoginIcon className="w-6 h-6 mr-2" />
        Sign in
      </button>
    </div>
  )
}
