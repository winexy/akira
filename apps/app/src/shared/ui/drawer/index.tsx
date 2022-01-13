import React, {FC, useRef} from 'react'
import {CSSTransition} from 'react-transition-group'
import clsx from 'clsx'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {HotKey} from 'modules/hotkeys/HotKey'
import {useFocusTrap} from 'shared/lib/focus-trap'
import './index.css'

type Props = {
  visible: boolean
  className?: string
  onClose(): void
}

const Drawer: FC<Props> = ({visible, className, children, onClose}) => {
  const ref = useRef<HTMLDivElement | null>(null)

  useFocusTrap(visible, ref)

  useHotkey(HotKey.of('Escape'), {
    description: 'close menu with Escape',
    handler() {
      if (visible) {
        onClose()
      }
    }
  })

  return (
    <CSSTransition
      in={visible}
      timeout={500}
      classNames="ui-drawer"
      unmountOnExit
    >
      <div ref={ref} className="z-50 relative">
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className="fixed inset-0 bg-black opacity-50 blackout"
          onClick={onClose}
        />
        <div className={clsx('panel fixed right-0 bottom-0 p-3 h-screen')}>
          <div
            className={clsx(
              'relative h-full bg-white rounded-lg shadow-2xl',
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </CSSTransition>
  )
}

export {Drawer}
