import React, {FC} from 'react'
import {CSSTransition} from 'react-transition-group'
import {CSSTransitionProps} from 'react-transition-group/CSSTransition'
import './ui-fade.css'

type Props = Omit<CSSTransitionProps, 'timeout'> & {
  timeout?: number
}

export const FadeTransition: FC<Props> = ({
  appear = false,
  in: inProp = true,
  timeout = 300,
  children,
  ...props
}) => {
  const style = {
    '--ui-fade-enter-duration': `${timeout}ms`,
    '--ui-fade-exit-duration': `${timeout}ms`
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
      classNames="ui-fade"
      {...props}
    >
      {element}
    </CSSTransition>
  )
}
