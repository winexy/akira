import React from 'react'
import clsx from 'clsx'
import {
  AdjustmentsIcon,
  ChevronLeftIcon,
  FireIcon,
  LogoutIcon,
  CheckIcon,
  HomeIcon
} from '@heroicons/react/solid'
import {closeMenu, $isMenuOpen} from '@store/menu'
import {useFirebaseAuth} from '@/firebase/Provider'
import {config} from '@config/app'
import {Tag, WIP} from '@components/Tag/Tag'
import {useStore} from 'effector-react'
import {Link} from 'react-router-dom'

type SVGIcon = (props: React.SVGProps<SVGSVGElement>) => JSX.Element

type MenuItemProps = {
  Icon: SVGIcon
  to: string
}

const MenuItem: React.FC<MenuItemProps> = ({Icon, children, to}) => {
  const onClick = () => closeMenu()

  return (
    <li>
      <Link
        to={to}
        className={clsx(
          'flex items-center',
          'px-4 py-2 rounded select-none',
          'transition ease-in duration-150',
          'active:bg-gray-50 active:bg-opacity-10'
        )}
        onClick={onClick}
      >
        <Icon className="mr-4 w-6 h-6 text-gray-400" />
        {children}
      </Link>
    </li>
  )
}

export const Menu: React.FC = ({children}) => {
  const isOpen = useStore($isMenuOpen)
  const auth = useFirebaseAuth()

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
            '-translate-x-full': !isOpen
          },
          isOpen ? 'delay-100' : 'delay-75'
        )}
        style={{
          maxWidth: '90vw'
        }}
      >
        <div className="p-4 flex">
          {auth.isAuthenticated && (
            <div className="flex items-center mr-3">
              {auth.user.photoURL && (
                <img
                  src={auth.user.photoURL}
                  alt="User avatar"
                  className="mr-4 w-10 h-10 rounded-full"
                />
              )}
              <strong className="text-lg text-white truncate">
                {auth.user.displayName}
              </strong>
            </div>
          )}
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
        <ul className="px-4 space-y-1 text-white font-bold text-lg flex-1 overflow-auto">
          <MenuItem to="/" Icon={HomeIcon}>
            Today
          </MenuItem>
          <MenuItem to="/important" Icon={FireIcon}>
            Important
          </MenuItem>
          <MenuItem to="/wip" Icon={CheckIcon}>
            Completed
            <WIP className="ml-auto" />
          </MenuItem>
          <MenuItem to="/wip" Icon={AdjustmentsIcon}>
            Preferences
            <WIP className="ml-auto" />
          </MenuItem>
        </ul>
        <div className="mt-auto px-6 text-white font-semibold">
          Version:{' '}
          <Tag variant="purple" className="ml-2">
            {config.app.version}
          </Tag>
        </div>
        <div className="p-4">
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
              auth.logout()
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
          'bg-gray-100',
          'transition-transform ease-in duration-300',
          isOpen ? 'max-vh-full' : 'vh-full',
          {
            'scale-90 rounded-3xl shadow-2xl h-screen overflow-hidden pointer-events-none': isOpen
          }
        )}
        style={{
          '--tw-translate-x': isOpen ? '85%' : 'none'
        }}
      >
        {children}
      </div>
    </>
  )
}
