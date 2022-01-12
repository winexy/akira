import React, {FC} from 'react'
import {CSSTransition} from 'react-transition-group'
import './index.css'

type Props = {
  visible: boolean
  onClose(): void
}

const Drawer: FC<Props> = ({visible, children, onClose}) => {
  return (
    <CSSTransition
      in={visible}
      timeout={500}
      classNames="ui-drawer"
      unmountOnExit
    >
      <div className="z-50 relative">
        <div
          className="fixed inset-0 bg-black opacity-50 blackout"
          role="button"
          tabIndex={0}
          onClick={onClose}
        />
        <div className="panel fixed right-0 top-0 h-screen bg-white p-6">
          {children}
        </div>
      </div>
    </CSSTransition>
  )
}

export {Drawer}
