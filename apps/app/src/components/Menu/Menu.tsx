import React from 'react'
import {useStore} from 'effector-react'
import {useAuth0} from '@auth0/auth0-react'
import clsx from 'clsx'
import {LogoutIcon, XIcon} from '@heroicons/react/solid'
import {$isMenuOpened, closeMenu} from '@store/menu'

export const Menu: React.FC = ({children}) => {
  const isOpened = useStore($isMenuOpened)
  const {logout, user} = useAuth0()

  return (
    <>
      <nav
        className={clsx(
          'z-50 fixed inset-0',
          'flex flex-col',
          'bg-white transform',
          'transition ease-out duration-300',
          {
            '-translate-x-full': !isOpened
          }
        )}
      >
        <div className="p-4 flex">
          <div className="flex items-center">
            <img src={user.picture} className="mr-4 w-10 h-10" />
            <strong className="text-lg truncate">{user.name}</strong>
          </div>
          <button
            className="
              ml-auto w-10 h-10 
              flex justify-center items-center 
              text-dark
              rounded
              transition ease-in duration-150
              active:bg-gray-200
              focus:outline-none
            "
            onClick={() => closeMenu()}
          >
            <XIcon className="w-8 h-8" />
          </button>
        </div>
        <ul>
          <li></li>
        </ul>
        <div className="mt-auto p-4">
          <button
            className="
              w-full p-3 
              flex items-center 
              font-bold text-white
              bg-red-500
              border border-red-700
              shadow-md rounded
              transition ease-in duration-100
              active:bg-red-600
              focus:outline-none
            "
            onClick={() => {
              logout()
              closeMenu()
            }}
          >
            <LogoutIcon className="w-6 h-6 mr-2" />
            Logout
          </button>
        </div>
      </nav>
      <div
        className={clsx(
          'flex-1 flex relative transform transition ease-in duration-150',
          {
            'translate-x-10 filter blur-sm': isOpened
          }
        )}
      >
        {isOpened && (
          <div className="z-20 fixed inset-0 bg-black opacity-20"></div>
        )}
        <div
          className={clsx('flex-1 transform transition ease-in duration-150', {
            'scale-90': isOpened
          })}
        >
          {children}
        </div>
      </div>
    </>
  )
}
