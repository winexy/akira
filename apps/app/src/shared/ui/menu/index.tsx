import React, {
  forwardRef,
  PropsWithChildren,
  useEffect,
  useRef,
  useState
} from 'react'
import clsx from 'clsx'
import {
  AdjustmentsIcon,
  ChevronLeftIcon,
  LogoutIcon,
  HomeIcon,
  CollectionIcon,
  PlusIcon,
  SearchIcon,
  DocumentTextIcon
} from '@heroicons/react/solid'
import {config} from 'shared/config'
import {Tag} from 'modules/tags/components/Tag'
import {useStore} from 'effector-react'
import {Link, useHistory} from 'react-router-dom'
import isNull from 'lodash/fp/isNull'
import {useQueryClient} from 'react-query'
import size from 'lodash/fp/size'
import throttle from 'lodash/throttle'
import {TaskLists} from 'modules/lists/components/TaskLists'
import {
  clearAllBodyScrollLocks,
  disableBodyScroll,
  enableBodyScroll
} from 'body-scroll-lock'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {HotKey} from 'modules/hotkeys/HotKey'
import {TaskQuery} from 'modules/tasks/config'
import {useFirebaseAuth} from 'shared/lib/firebase'
import {closeMenu, openMenu, $isMenuOpen} from './model'
import './index.css'

type MenuItemProps = {
  Icon: SVGIconElement
  to: string
}

type ButtonProps = {
  onClick(): void
  Icon: SVGIconElement
}

export * from './model'

export const MenuItem: React.FC<MenuItemProps> & {
  Button: React.FC<ButtonProps>
} = ({Icon, children, to}) => {
  const onClick = () => closeMenu()

  return (
    <li>
      <Link className="menu-item --interactive" to={to} onClick={onClick}>
        <Icon className="mr-4 w-6 h-6 text-gray-400" />
        {children}
      </Link>
    </li>
  )
}

const getContentTranslateX = (
  menuElement: HTMLElement | null,
  contentElement: HTMLDivElement | null
) => {
  if (isNull(menuElement) || isNull(contentElement)) {
    return '85%'
  }

  const menuRect = menuElement.getBoundingClientRect()
  const contentRect = contentElement.getBoundingClientRect()

  const getPercent = (value: number, percent: number) => {
    return (value * percent) / 100
  }

  const scaled = getPercent(contentRect.width, 90)
  const halfDiff = (contentRect.width - scaled) / 2

  return `${menuRect.width - halfDiff}px`
}

MenuItem.Button = ({onClick, Icon}) => (
  <button
    className="
      ml-auto w-10 h-10
      flex justify-center items-center
      bg-gray-50 bg-opacity-10 rounded
      transition ease-in duration-150
      active:bg-opacity-30
      focus:outline-none
      focus:bg-gray-500
      focus:text-white
      focus:ring-2
      focus:ring-gray-600
    "
    onClickCapture={event => {
      event.stopPropagation()
      event.preventDefault()
      onClick()
    }}
  >
    <Icon className="w-6 h-6" />
  </button>
)

function useOpenMenuLock(
  rootId: string,
  isOpen: boolean,
  menu: HTMLElement | null
) {
  useEffect(() => {
    const root = document.getElementById(rootId)

    if (root) {
      if (isOpen) {
        root.classList.add('overflow-x-hidden')
        disableBodyScroll(root, {
          allowTouchMove(el) {
            return menu?.contains(el)
          }
        })
      } else {
        enableBodyScroll(root)
        root.classList.remove('overflow-x-hidden')
      }
    }

    return () => {
      clearAllBodyScrollLocks()
    }
  }, [rootId, isOpen, menu])
}

const ScrollShadow = forwardRef<
  HTMLDivElement,
  PropsWithChildren<{recalcKey: string | number | boolean}>
>(({children, recalcKey}, forwardedRef) => {
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState(0)

  const onScroll = throttle(() => {
    const node = ref.current

    if (isNull(node)) {
      return
    }

    const top = node.scrollTop > 0 ? 0b1 : 0
    const bot =
      node.scrollHeight - node.offsetHeight > node.scrollTop ? 0b10 : 0

    setState(top | bot)
  }, 250)

  useEffect(() => {
    onScroll()
    // eslint-disable-next-line
  }, [recalcKey])

  return (
    <div ref={forwardedRef} className="relative overflow-hidden">
      <div
        className={clsx(
          'absolute top-0 h-24 w-full',
          'from-gray-700 dark:from-dark-700 bg-gradient-to-b',
          'transition ease-in duration-75',
          'pointer-events-none',
          {'opacity-0': (state & 0b1) !== 0b1}
        )}
      />
      <div ref={ref} className="h-full overflow-auto" onScroll={onScroll}>
        {children}
      </div>
      <div
        className={clsx(
          'z-10 absolute bottom-0 h-24 w-full',
          'from-gray-700 dark:from-dark-700 bg-gradient-to-t',
          'transition ease-in duration-75',
          'pointer-events-none',
          {'opacity-0': (state & 0b10) !== 0b10}
        )}
      />
    </div>
  )
})

export const Menu: React.FC = ({children}) => {
  const history = useHistory()
  const queryClient = useQueryClient()
  const isOpen = useStore($isMenuOpen)
  const auth = useFirebaseAuth()
  const menuRef = useRef<HTMLElement>(null)
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const todayTasksCount = size(queryClient.getQueryData(TaskQuery.MyDay()))

  useOpenMenuLock('root', isOpen, scrollContentRef.current)

  useHotkey(HotKey.of('m', HotKey.Meta), {
    description: 'open menu',
    handler() {
      if (!isOpen) {
        openMenu()
      }
    }
  })

  useHotkey(HotKey.of('Escape'), {
    description: 'close menu with Escape',
    handler() {
      if (isOpen) {
        closeMenu()
      }
    }
  })

  return (
    <>
      <nav
        ref={menuRef}
        className={clsx(
          'z-10 fixed ',
          'left-0 top-0 bottom-0',
          'flex flex-col',
          'transform',
          'transition ease-out duration-300',
          !isOpen && '-translate-x-full',
          isOpen && 'delay-200'
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
              focus:outline-none focus:bg-gray-50 focus:bg-opacity-30
            "
            onClick={() => closeMenu()}
          >
            <ChevronLeftIcon className="w-8 h-8" />
          </button>
        </div>
        <ScrollShadow recalcKey={isOpen} ref={scrollContentRef}>
          <ul
            className="
              pt-0.5 px-4
              space-y-1
              text-white font-bold text-lg flex-1;
            "
          >
            <MenuItem to="/search" Icon={SearchIcon}>
              Search
            </MenuItem>
            <MenuItem to="/" Icon={HomeIcon}>
              Dashboard
              {todayTasksCount ? (
                <span className="ml-auto mr-4">{todayTasksCount}</span>
              ) : null}
            </MenuItem>
            <MenuItem to="/reports" Icon={DocumentTextIcon}>
              Daily Report
            </MenuItem>
            <MenuItem to="/tasks" Icon={CollectionIcon}>
              Tasks
            </MenuItem>
            <MenuItem to="/preferences" Icon={AdjustmentsIcon}>
              Preferences
            </MenuItem>
            <li>
              <div className="flex items-center text-gray-400 pl-4">
                Task Lists
                <MenuItem.Button
                  Icon={PlusIcon}
                  onClick={() => {
                    history.push('/lists/new')
                    closeMenu()
                  }}
                />
              </div>
              <TaskLists className="mt-2" />
            </li>
          </ul>
        </ScrollShadow>
        <div className="mt-auto px-6 text-white font-semibold">
          Version:{' '}
          <Tag variant="purple" className="ml-2">
            {config.app.version}
          </Tag>
        </div>
        <div className="px-4 py-2">
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
        ref={contentRef}
        className={clsx(
          'transform flex flex-col',
          'bg-white dark:bg-dark-600',
          'transition-transform ease-in duration-300',
          isOpen ? 'max-vh-full ' : 'vh-full',
          {
            'scale-90 rounded-3xl shadow-2xl h-screen overflow-hidden pointer-events-none filter opacity-75': isOpen
          }
        )}
        style={{
          '--tw-translate-x': isOpen
            ? getContentTranslateX(menuRef.current, contentRef.current)
            : 'none',
          WebkitMaskImage: isOpen
            ? '-webkit-radial-gradient(white, black)'
            : 'none'
        }}
      >
        {children}
      </div>
    </>
  )
}
