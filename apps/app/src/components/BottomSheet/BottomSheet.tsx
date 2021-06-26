import React, {useState, useRef, TouchEventHandler, useEffect} from 'react'
import {useStore} from 'effector-react'
import get from 'lodash/fp/get'
import clsx from 'clsx'
import {CSSTransition} from 'react-transition-group'
import {$activeBottomSheet, hideBottomSheet} from '@store/bottom-sheet'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import './BottomSheet.css'

const extractTouch = get('changedTouches.0.clientY')

type Props = {
  name: string
  className?: string
}

export const BottomSheet: React.FC<Props> = ({name, children, className}) => {
  const activeBottomSheet = useStore($activeBottomSheet)
  const [isBlackoutTouchStarted, setIsBlackoutTouchStarted] = useState(false)
  const [isSheetTouchStarted, setIsSheetTouchStarted] = useState(false)
  const [sheetTouchStart, setSheetTouchStart] = useState(0)
  const [sheetShift, setSheetShift] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const isActive = activeBottomSheet === name

  const onBlackoutTouchStart = () => setIsBlackoutTouchStarted(true)

  const onBlackoutTouchEnd = () => {
    if (isBlackoutTouchStarted) {
      setIsBlackoutTouchStarted(false)
      hideBottomSheet()
    }
  }

  const onSheetTouchStart: TouchEventHandler = e => {
    window.console.assert(contentRef.current !== null, 'Content Ref is NULL')

    if (contentRef.current) {
      setIsSheetTouchStarted(contentRef.current.scrollTop === 0)
      setSheetTouchStart(extractTouch(e))
    }
  }

  const onSheetTouchMove: TouchEventHandler = e => {
    if (isSheetTouchStarted) {
      const shift = extractTouch(e) - sheetTouchStart
      setSheetShift(Math.max(0, shift))
    }
  }

  const onSheetTouchEnd: TouchEventHandler = () => {
    if (isSheetTouchStarted && sheetShift >= 100) {
      hideBottomSheet()
      return
    }

    setIsSheetTouchStarted(false)
    setSheetShift(0)
  }

  useEffect(() => {
    return () => {
      hideBottomSheet(name)
    }
  }, [name])

  useEffect(() => {
    if (isActive && contentRef.current) {
      disableBodyScroll(contentRef.current)
      setIsSheetTouchStarted(false)
      setSheetShift(0)
    } else if (contentRef.current) {
      enableBodyScroll(contentRef.current)
    }
  }, [isActive])

  return (
    <CSSTransition
      nodeRef={rootRef}
      in={isActive}
      timeout={500}
      unmountOnExit
      classNames="bottom-sheet-slide-up"
    >
      <div ref={rootRef} className="z-50 fixed inset-0 flex">
        <div
          className="blackout fixed inset-0 z-10 bg-black opacity-50"
          role="button"
          tabIndex={0}
          onTouchStart={onBlackoutTouchStart}
          onTouchEnd={onBlackoutTouchEnd}
          onClick={() => hideBottomSheet()}
        />
        <div
          className="sheet z-10 absolute bottom-0 flex w-full justify-center"
          style={{maxHeight: '90%'}}
        >
          <button
            style={{transform: `translateY(${sheetShift}px)`}}
            className="
              absolute top-0 -mt-7
              flex items-center justify-center flex-shrink-0
              transition duration-300 ease-out
              focus:outline-none
            "
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
            onClick={() => hideBottomSheet()}
          >
            <div className="my-3 h-1.5 w-12 bg-gray-300 rounded" />
          </button>
          <div
            style={{transform: `translateY(${sheetShift}px)`}}
            className="
              w-full flex flex-col
              bg-white overflow-hidden rounded-t-xl
              transition duration-300 ease-out
            "
            role="dialog"
            aria-modal="true"
            onTouchStart={onSheetTouchStart}
            onTouchMove={onSheetTouchMove}
            onTouchEnd={onSheetTouchEnd}
          >
            <div
              ref={contentRef}
              className={clsx(
                'max-h-screen overscroll-none overflow-scroll',
                className
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
