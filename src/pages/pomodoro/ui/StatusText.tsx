import clsx from 'clsx'
import React, {FC, useRef} from 'react'
import {Transition} from 'shared/ui/transition'
import {useStore} from 'effector-react'
import {pomodoroModel} from 'entities/pomodoro'

export const StatusText: FC = () => {
  const ref = useRef(null)
  const isRunning = useStore(pomodoroModel.$isRunning)
  const isFocusMode = useStore(pomodoroModel.$isFocusMode)

  return (
    <Transition.Scale nodeRef={ref} appear in={isRunning} unmountOnExit>
      <p
        ref={ref}
        className={clsx('mt-8 font-semibold text-3xl transition', {
          'dark:text-white': isRunning,
        })}
      >
        {isFocusMode ? 'Time to focus! 👩🏼‍💻' : 'Time to Break! 🧘🏼‍♀️'}
      </p>
    </Transition.Scale>
  )
}
