import React from 'react'
import {useStore} from 'effector-react'
import {useAuth0} from '@auth0/auth0-react'
import clsx from 'clsx'
import {ChevronLeftIcon, LogoutIcon, XIcon} from '@heroicons/react/solid'
import {$isMenuOpened, closeMenu} from '@store/menu'

export const Menu: React.FC = ({children}) => {
  const isOpened = useStore($isMenuOpened)
  const {logout, user} = useAuth0()

  return (
    <>
      <nav
        className={clsx(
          'z-10 fixed ',
          'left-0 top-0 bottom-0',
          'flex flex-col',
          'transform',
          'transition ease-out duration-300',
          {
            '-translate-x-full': !isOpened
          }
        )}
        style={{
          maxWidth: '90vw'
        }}
      >
        <div className="p-4 flex">
          <div className="flex items-center mr-3">
            <img src={user.picture} className="mr-4 w-10 h-10" />
            <strong className="text-lg text-gray-700 truncate">
              {user.name}
            </strong>
          </div>
          <button
            className="
              ml-auto w-10 h-10 
              flex justify-center items-center 
              text-gray-700
              rounded
              transition ease-in duration-150
              active:bg-gray-200
              focus:outline-none
            "
            onClick={() => closeMenu()}
          >
            <ChevronLeftIcon className="w-8 h-8" />
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
              font-bold text-red-500
              transition ease-in duration-100
              rounded-md
              active:text-red-600
              active:bg-red-500 active:bg-opacity-10
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
          'z-50',
          'flex-1 flex relative transform transition ease-out duration-300'
        )}
        style={{
          transform: isOpened ? 'translateX(85%)' : 'none'
        }}
      >
        <div
          className={clsx(
            'flex-1 transform transition ease-in duration-150 bg-gray-700',
            'transition-transform ease-in duration-300',
            {
              'scale-90 rounded-3xl shadow-2xl': isOpened
            }
          )}
        >
          {children}
        </div>
      </div>
    </>
  )
}
