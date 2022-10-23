import React, {FC, useRef} from 'react'
import {CSSTransition} from 'react-transition-group'
import {ErrorBoundary, FallbackProps} from 'react-error-boundary'
import clsx from 'clsx'
import {ExclamationCircleIcon} from '@heroicons/react/solid'
import {Button} from 'shared/ui/button'
import {config} from 'shared/config'
import * as bottomSheetModel from '../model'
import './bottom-sheet.css'

type BottomSheetProps = {
  className?: string
} & bottomSheetModel.BottomSheetState &
  bottomSheetModel.BottomSheetEvents

function Fallback({error}: FallbackProps) {
  return (
    <div className="py-8 px-8 flex justify-center items-center flex-col">
      <ExclamationCircleIcon className="w-16 h-16 text-red-500" />
      <p className="mt-4 text-xl font-semibold">Something went wrong...</p>
      {config.env.dev && <p className="mt-4  ">{error.message}</p>}
      <Button
        variant="red"
        size="md"
        className="mt-4 w-full"
        onClick={() => bottomSheetModel.hideBottomSheet()}
      >
        Close
      </Button>
    </div>
  )
}

export const BottomSheet: FC<BottomSheetProps> = props => {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const {
    className,
    children,
    sheet,
    sheetShift,
    isVisible,
    contentRef,
    onBlackoutTouchStart,
    onBlackoutTouchEnd,
    onSheetTouchStart,
    onSheetTouchMove,
    onSheetTouchEnd,
  } = props

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
          onClick={() => bottomSheetModel.hideBottomSheet()}
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
            onClick={() => bottomSheetModel.hideBottomSheet()}
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
                className,
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
