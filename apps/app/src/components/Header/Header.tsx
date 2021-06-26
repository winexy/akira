import React, {useEffect, useRef, useState} from 'react'
import clsx from 'clsx'
import {MenuIcon} from '@heroicons/react/solid'
import {LightningBoltIcon} from '@heroicons/react/outline'
import isUndefined from 'lodash/fp/isUndefined'
import {toggleMenu} from '@store/menu'
import {Link} from 'react-router-dom'

export const Header: React.FC = ({children}) => {
  const headerRef = useRef<HTMLElement | null>(null)
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const root = document.getElementById('root')
    const headerRect = headerRef.current?.getBoundingClientRect()

    const listener = () => {
      if (root && headerRect) {
        setIsFloating(root.scrollTop > headerRect.height)
      }
    }

    if (root) {
      root.addEventListener('scroll', listener, false)
    }

    return () => {
      if (root) {
        root.removeEventListener('scroll', listener)
      }
    }
  }, [])

  return (
    <header
      ref={headerRef}
      className={clsx(
        'sticky w-full top-0 z-20 px-4 py-2',
        'flex items-center',
        'transition ease-in duration-100',
        'bg-gradient-to-b from-white to-gray-100',
        'text-gray-700',
        {
          'shadow-2xl border-b': isFloating
        }
      )}
    >
      {isUndefined(children) ? (
        <Link
          to="/"
          className="flex items-center focus:outline-none focus:text-purple-500"
        >
          <LightningBoltIcon className="w-5 h-5" />
          <h1
            className="
              ml-1 font-bold text-xl font-mono 
              active:text-gray-900 
            "
          >
            Akira
          </h1>
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
          focus:bg-gray-200
        "
        onClick={() => toggleMenu()}
      >
        <MenuIcon className="w-6 h-6" />
      </button>
    </header>
  )
}
