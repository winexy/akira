import clsx, {ClassValue} from 'clsx'
import React, {useEffect, useRef, useState} from 'react'
import {CSSTransition} from 'react-transition-group'
import './ActionToast.css'

type ActionToastButtonProps = NativeButtonProps & {
  className?: ClassValue
  Icon: SVGIconElement
}

export const ActionToast: React.FC & {
  Button: React.FC<ActionToastButtonProps>
} = ({children}) => {
  const [isVisible, setIsVisible] = useState(true)
  const prevScrollYRef = useRef(0)

  useEffect(() => {
    const listener = () => {
      const isOverScroll =
        window.scrollY < 0 || window.scrollY * 2 > window.innerHeight

      if (isOverScroll) {
        return
      }

      setIsVisible(prevScrollYRef.current > window.scrollY)
      prevScrollYRef.current = window.scrollY
    }

    window.addEventListener('scroll', listener, {passive: true})

    return () => {
      window.removeEventListener('scroll', listener)
    }
  }, [])

  return (
    <CSSTransition
      in={isVisible}
      timeout={300}
      unmountOnExit
      classNames="action-toast"
    >
      <div className="fixed bottom-0 w-full flex justify-center items-center pb-10 transition ease-in duration-300">
        <div className="flex items-center space-x-4 px-4 py-1 rounded-full bg-white shadow-2xl border border-gray-50">
          {children}
        </div>
      </div>
    </CSSTransition>
  )
}

ActionToast.Button = ({className, Icon, ...props}) => {
  return (
    <button
      className={clsx(
        'flex justify-center items-center',
        'h-12 w-12 focus:outline-none',
        className
      )}
      type="button"
      {...props}
    >
      <Icon className="w-8 h-8 transition ease-in duration-75 transform active:scale-110" />
    </button>
  )
}
