import React, {useEffect, useRef} from 'react'
import {$activeActionSheet, closeActionSheet} from '@store/action-sheet'
import {useStore} from 'effector-react'
import {CSSTransition} from 'react-transition-group'
import clsx from 'clsx'
import {Portal} from '../Portal'
import './ActionSheet.css'

type Props = {
  name: string
}

type ActionProps = {
  destructive?: boolean
  onClick?(): void
}

const TRANSITION_DURATION = 500

const Action: React.FC<ActionProps> = ({
  children,
  onClick,
  destructive = false
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    closeActionSheet()
    setTimeout(() => {
      onClick?.()
    }, TRANSITION_DURATION)
  }

  return (
    <li>
      <button
        className={clsx(
          'w-full text-center text-lg py-3',
          'transition ease-in duration-75',
          'focus:outline-none active:bg-gray-200',
          destructive ? 'text-red-500' : 'text-blue-500'
        )}
        type="button"
        onClick={handleClick}
      >
        {children}
      </button>
    </li>
  )
}

const ActionSheet: React.FC<Props> & {Action: typeof Action} = ({
  children,
  name
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const activeActionSheet = useStore($activeActionSheet)
  const isVisible = activeActionSheet === name

  useEffect(() => {
    return () => {
      if (isVisible) {
        closeActionSheet()
      }
    }
  }, [isVisible])

  const onCancel = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    closeActionSheet()
  }

  return (
    <CSSTransition
      nodeRef={ref}
      in={isVisible}
      timeout={TRANSITION_DURATION}
      unmountOnExit
      classNames="action-sheet-slide-up"
    >
      <Portal to="action-sheet-root">
        <div ref={ref} className="z-50 fixed inset-0">
          <div
            className="blackout fixed inset-0 z-10 bg-black opacity-50"
            role="button"
            tabIndex={0}
            onClick={onCancel}
          />
          <div className="sheet z-10 fixed bottom-0 p-4 flex flex-col left-0 right-0">
            <ul className="overflow-hidden rounded-lg bg-white w-full divide-y divide-gray-200">
              {children}
            </ul>
            <button
              type="button"
              className={clsx(
                'mt-2 py-3 w-full',
                'bg-white rounded-lg',
                'text-lg text-blue-500 font-semibold',
                'transition ease-in duration-75',
                'focus:outline-none',
                'active:bg-gray-200'
              )}
              onClick={onCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </Portal>
    </CSSTransition>
  )
}

ActionSheet.Action = Action

export {ActionSheet}
