import clsx, {ClassValue} from 'clsx'
import React, {useEffect, useRef, useState} from 'react'
import {CSSTransition} from 'react-transition-group'
import {Spin} from '@shared/ui/spin'
import './index.css'

type ActionToastButtonProps = NativeButtonProps & {
  className?: ClassValue
  Icon: SVGIconElement
  isLoading?: boolean
}

export const ActionToast: React.FC & {
  Button: React.FC<ActionToastButtonProps>
} = ({children}) => {
  const [isVisible, setIsVisible] = useState(true)
  const ref = useRef<HTMLDivElement | null>(null)
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
      nodeRef={ref}
      in={isVisible}
      timeout={300}
      unmountOnExit
      classNames="action-toast"
    >
      <div
        ref={ref}
        className="fixed bottom-0 pointer-events-none w-full flex justify-center items-center pb-10 transition ease-in duration-300"
      >
        <div className="flex items-center space-x-4 pointer-events-auto px-4 py-1 rounded-full bg-white dark:bg-dark-500 shadow-2xl border border-gray-50 dark:border-dark-500">
          {children}
        </div>
      </div>
    </CSSTransition>
  )
}

ActionToast.Button = ({className, Icon, isLoading = false, ...props}) => {
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
      {isLoading ? (
        <Spin className="w-8 h-8 text-gray-300" />
      ) : (
        <Icon className="w-8 h-8 transition ease-in duration-75 transform active:scale-110" />
      )}
    </button>
  )
}
