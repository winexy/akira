import React, {MutableRefObject, useEffect, useRef} from 'react'
import {
  $activeActionSheet,
  closeActionSheet,
} from 'shared/ui/action-sheet/model'
import {useStore} from 'effector-react'
import {CSSTransition} from 'react-transition-group'
import clsx from 'clsx'
import {useFocusTrap} from 'shared/lib/focus-trap'
import {Portal} from 'shared/ui/portal'
import './index.css'

type Props = {
  name: string
  description?: React.ReactNode
  children: React.ReactNode
}

type ActionProps = {
  destructive?: boolean
  onClick?(): void
  children: React.ReactNode
}

const TRANSITION_DURATION = 500

const Action: React.FC<ActionProps> = ({
  children,
  onClick,
  destructive = false,
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
          'rounded-lg',
          'focus:outline-none active:bg-gray-200 dark:active:bg-dark-400',
          'focus-visible:ring-4 focus-visible:ring-blue-500',
          destructive ? 'text-red-500' : 'text-blue-500',
        )}
        type="button"
        onClick={handleClick}
      >
        {children}
      </button>
    </li>
  )
}

function useInitialFocus(
  isVisible: boolean,
  ref: MutableRefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (isVisible && ref.current) {
      ref.current.focus()
    }
  }, [isVisible, ref])
}

function useCleanup(isVisible: boolean) {
  useEffect(() => {
    return () => {
      if (isVisible) {
        closeActionSheet()
      }
    }
  }, [isVisible])
}

const ActionSheet: React.FC<Props> & {Action: typeof Action} = ({
  children,
  description,
  name,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const activeActionSheet = useStore($activeActionSheet)
  const isVisible = activeActionSheet === name

  useInitialFocus(isVisible, cancelRef)
  useFocusTrap(isVisible, actionsRef)
  useCleanup(isVisible)

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
          <div
            ref={actionsRef}
            className="sheet z-10 fixed bottom-0 p-2 pb-6-safe flex flex-col left-0 right-0"
          >
            <ul className="rounded-lg bg-white dark:bg-dark-500 w-full divide-y divide-gray-200">
              {description && (
                <li className="px-6 text-center text-sm text-gray-400 py-4">
                  {description}
                </li>
              )}
              {children}
            </ul>
            <button
              ref={cancelRef}
              type="button"
              className={clsx(
                'mt-2 py-3 w-full',
                'bg-white dark:bg-dark-500 rounded-lg',
                'text-lg text-blue-500 dark:text-blue-400 font-semibold',
                'transition ease-in duration-75',
                'focus:outline-none',
                'focus-visible:ring-4 focus-visible:ring-blue-500',
                'active:bg-gray-200 dark:active:bg-dark-400',
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
