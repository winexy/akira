import React, {FC, useRef} from 'react'
import {useStore} from 'effector-react'
import {
  AdjustmentsIcon,
  FastForwardIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/solid'
import {universalDrawerModel} from 'widgets/universal-drawer'
import {ControlButton} from 'features/pomodoro-timer'
import {pomodoroLib, pomodoroModel} from 'entities/pomodoro'
import {Transition} from 'shared/ui/transition'

export const ControlPanel: FC = () => {
  const isRunning = useStore(pomodoroModel.$isRunning)
  const isPaused = useStore(pomodoroModel.$isPaused)
  const mode = useStore(pomodoroModel.$mode)
  const ref = useRef(null)

  return (
    <Transition.Shift appear nodeRef={ref}>
      <div
        ref={ref}
        className="fixed bottom-0 pb-10 flex items-center space-x-4 sm:space-x-8"
      >
        <ControlButton
          withBorder
          size="sm"
          Icon={AdjustmentsIcon}
          onClick={() => universalDrawerModel.showDrawer('pomodoro-settings')}
        />
        <ControlButton
          size="md"
          Icon={isRunning ? PauseIcon : PlayIcon}
          onClick={() => {
            if (isRunning) {
              pomodoroModel.pauseTimer()
            } else if (isPaused) {
              pomodoroModel.continueTimer()
            } else {
              pomodoroLib.startTimer(mode)
            }
          }}
        />
        <ControlButton
          size="sm"
          withBorder
          Icon={FastForwardIcon}
          onClick={pomodoroModel.skipPomodoro}
        />
      </div>
    </Transition.Shift>
  )
}
