import React, {FC} from 'react'
import {CSSTransition} from 'react-transition-group'
import {CSSTransitionProps} from 'react-transition-group/CSSTransition'
import './ui-shift.css'

type Props = Omit<CSSTransitionProps, 'timeout'> & {
  timeout?: number
  from?: 'left' | 'right' | 'top' | 'bottom'
}

const TranslateY = {
  left: 0,
  right: 0,
  top: '-100%',
  bottom: '100%',
}

const TranslateX = {
  top: 0,
  bottom: 0,
  left: '-100%',
  right: '100%',
}

export const ShiftTransition: FC<Props> = ({
  appear,
  in: inProp = true,
  timeout = 300,
  from = 'bottom',
  children,
  ...props
}) => {
  const style: React.CSSProperties = {
    '--ui-shift-enter-duration': `${timeout}ms`,
    '--ui-shift-exit-duration': `${timeout}ms`,
    '--ui-shift-translate-y': TranslateY[from],
    '--ui-shift-translate-x': TranslateX[from],
  }

  const child = React.Children.only(children)
  const element = React.isValidElement(child)
    ? // @ts-expect-error style prop is valid
      React.cloneElement(child, {style})
    : null

  return (
    <CSSTransition
      appear={appear}
      in={inProp}
      timeout={timeout}
      classNames="ui-shift"
      {...props}
    >
      {element}
    </CSSTransition>
  )
}
