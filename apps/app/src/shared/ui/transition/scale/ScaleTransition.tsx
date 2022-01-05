import React, {FC} from 'react'
import {CSSTransition} from 'react-transition-group'
import {CSSTransitionProps} from 'react-transition-group/CSSTransition'
import './ui-scale.css'

type Props = Omit<CSSTransitionProps, 'timeout'> & {
  timeout?: number
  scaleFrom?: number
  scaleTo?: number
}

export const ScaleTransition: FC<Props> = ({
  appear = false,
  in: inProp = true,
  timeout = 150,
  children,
  scaleFrom = 0.5,
  scaleTo = 1,
  ...props
}) => {
  const style = {
    '--ui-scale-enter-duration': `${timeout}ms`,
    '--ui-scale-exit-duration': `${timeout}ms`,
    '--ui-scale-from': scaleFrom,
    '--ui-scale-to': scaleTo
  }

  const child = React.Children.only(children)
  const element = React.isValidElement(child)
    ? React.cloneElement(child, {style})
    : null

  return (
    <CSSTransition
      appear={appear}
      in={inProp}
      timeout={timeout}
      classNames="ui-scale"
      {...props}
    >
      {element}
    </CSSTransition>
  )
}
