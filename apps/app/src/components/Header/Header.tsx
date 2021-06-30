import React, {useEffect, useRef, useState} from 'react'
import clsx from 'clsx'
import {MenuIcon} from '@heroicons/react/solid'
import isUndefined from 'lodash/fp/isUndefined'
import {toggleMenu} from '@store/menu'
import {Link} from 'react-router-dom'
import {Akira} from './Akira'

export const Header: React.FC = ({children}) => {
  const headerRef = useRef<HTMLElement | null>(null)
  const [isFloating, setIsFloating] = useState(false)

  useEffect(() => {
    const headerRect = headerRef.current?.getBoundingClientRect()

    const listener = () => {
      if (headerRect) {
        setIsFloating(window.scrollY > headerRect.height)
      }
    }

    window.addEventListener('scroll', listener, false)

    return () => {
      window.removeEventListener('scroll', listener)
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
          <Akira className="w-5 h-5 -mt-px" />
          <h1
            className="
              ml-2 font-bold text-xl font-mono 
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
