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
            <img src={user.picture} className="mr-4 w-10 h-10 rounded-full" />
            <strong className="text-lg text-white truncate">{user.name}</strong>
          </div>
          <button
            className="
              ml-auto w-10 h-10 
              flex justify-center items-center 
              text-white
              rounded
              transition ease-in duration-150
              active:bg-gray-50 active:bg-opacity-30
              focus:outline-none
            "
            onClick={() => closeMenu()}
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        </div>
        <ul className="px-4 space-y-2 text-white font-bold text-lg flex-1 overflow-auto">
          {[
            'Important',
            'Completed',
            'Preferences',
            'Categories',
            'WIP',
            'Analytics',
            'Changelog',
            'More',
            'Dummy',
            'Menu',
            'Items'
          ].map((item, index) => (
            <li
              key={index}
              className={clsx(
                'px-4 py-1 rounded',
                'transition ease-in duration-150',
                'active:bg-gray-50 active:bg-opacity-20'
              )}
            >
              {item}
            </li>
          ))}
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
          'transform flex flex-col',
          'transition ease-in duration-150',
          'bg-gray-100',
          'transition-transform ease-in duration-300',
          isOpened ? 'max-vh-full' : 'vh-full',
          {
            'scale-90 rounded-3xl shadow-2xl h-screen overflow-hidden pointer-events-none': isOpened
          }
        )}
        style={{
          // @ts-expect-error
          '--tw-translate-x': isOpened ? '85%' : 'none'
        }}
      >
        {children}
      </div>
    </>
  )
}
