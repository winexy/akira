import React, {useState, useRef, TouchEventHandler, useEffect} from 'react'
import {useStore, useStoreMap} from 'effector-react'
import get from 'lodash/fp/get'
import clsx from 'clsx'
import {CSSTransition} from 'react-transition-group'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import {
  hideBottomSheet,
  $activeBottomSheet,
  $bottomSheets
} from 'shared/ui/bottom-sheet/model'
import {Button} from 'shared/ui/button'
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks
} from 'body-scroll-lock'
import './index.css'
import {ExclamationCircleIcon} from '@heroicons/react/solid'
import find from 'lodash/fp/find'
import isNull from 'lodash/fp/isNull'

const extractTouch = get('changedTouches.0.clientY')

type Props = {
  name: string
  className?: string
}

function Fallback({error}: FallbackProps) {
  return (
    <div className="py-8 px-8 flex justify-center items-center flex-col">
      <ExclamationCircleIcon className="w-16 h-16 text-red-500" />
      <p className="mt-4 text-xl font-semibold">Something went wrong...</p>
      {import.meta.env.DEV && <p className="mt-4  ">{error.message}</p>}
      <Button
        variant="red"
        size="md"
        className="mt-4 w-full"
        onClick={() => hideBottomSheet()}
      >
        Close
      </Button>
    </div>
  )
}

export const BottomSheet: React.FC<Props> = ({name, children, className}) => {
  const sheet = useStoreMap(
    $bottomSheets,
    sheets => find({name}, sheets) ?? null
  )
  const activeBottomSheet = useStore($activeBottomSheet)
  const [isBlackoutTouchStarted, setIsBlackoutTouchStarted] = useState(false)
  const [isSheetTouchStarted, setIsSheetTouchStarted] = useState(false)
  const [sheetTouchStart, setSheetTouchStart] = useState(0)
  const [sheetShift, setSheetShift] = useState(0)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<HTMLDivElement | null>(null)

  const isVisible = !isNull(sheet)
  const isActive = activeBottomSheet?.name === name

  const onBlackoutTouchStart = () => {
    if (isActive) {
      setIsBlackoutTouchStarted(true)
    }
  }

  const onBlackoutTouchEnd = () => {
    if (isBlackoutTouchStarted) {
      setIsBlackoutTouchStarted(false)
      hideBottomSheet()
    }
  }

  const onSheetTouchStart: TouchEventHandler = e => {
    if (!isActive) {
      return
    }

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
      if (isVisible) {
        hideBottomSheet(name)
        clearAllBodyScrollLocks()
      }
    }
  }, [name, isVisible])

  useEffect(() => {
    if (isVisible && contentRef.current) {
      disableBodyScroll(contentRef.current)
      setIsSheetTouchStarted(false)
      setSheetShift(0)
    } else if (contentRef.current) {
      enableBodyScroll(contentRef.current)
    }
  }, [isVisible])

  return (
    <CSSTransition
      nodeRef={rootRef}
      in={isVisible}
      timeout={500}
      unmountOnExit
      classNames="bottom-sheet-slide-up"
    >
      <div
        ref={rootRef}
        className="fixed inset-0 flex"
        style={{zIndex: 50 * (sheet?.index ?? 1)}}
      >
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
          style={{maxHeight: '95%'}}
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
              bg-white dark:bg-dark-600 overflow-hidden rounded-t-xl
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
              <ErrorBoundary FallbackComponent={Fallback}>
                {children}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}
