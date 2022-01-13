import clsx from 'clsx'
import React, {FC, useRef} from 'react'
import {useStore} from 'effector-react'
import {Transition} from 'shared/ui/transition'
import {
  PlayIcon,
  PauseIcon,
  AdjustmentsIcon,
  FastForwardIcon
} from '@heroicons/react/solid'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {HotKey} from 'modules/hotkeys/HotKey'
import {pomodorLib, pomodoroModel} from 'entities/pomodoro'
import {PomodoroModeSwitcher, PomodoroTimer} from 'features/pomodoro'
import {Header, StatusText} from './ui'
import './pomodoro.css'

type ControlProps = {
  withBorder?: boolean
  size: 'sm' | 'md'
  Icon: SVGIconElement
  onClick?(): void
}

const Control: FC<ControlProps> = ({withBorder, size, Icon, onClick}) => {
  return (
    <button
      className={clsx(
        'flex justify-center items-center',
        'rounded-full shadow-2xl bg-gray-100 dark:bg-dark-500',
        'transition ease-in transform',
        'focus:outline-none',
        'dark:active:bg-dark-700',
        'active:shadow-lg active:scale-90',
        'text-indigo-500 dark:text-gray-200',
        'focus:scale-110 focus:text-indigo-400 dark:focus:text-white',
        {
          'border border-gray-200 border-opacity-50 dark:border-none': withBorder,
          'w-24 h-24': size === 'md',
          'w-16 h-16': size === 'sm'
        }
      )}
      onClick={onClick}
    >
      <Icon
        className={clsx({
          'w-24 h-24': size === 'md',
          'w-8 h-8': size === 'sm'
        })}
      />
    </button>
  )
}

const PomodoroPage: FC = (): JSX.Element => {
  const isRunning = useStore(pomodoroModel.$isRunning)
  const mode = useStore(pomodoroModel.$mode)
  const controlsRef = useRef(null)

  function start() {
    pomodorLib.startTimer(mode)
  }

  useHotkey(HotKey.of('p', HotKey.Meta), {
    description: 'open pomodoro preferences',
    handler() {
      universalDrawerModel.showDrawer('pomodoro-settings')
    }
  })

  useHotkey(HotKey.of(' '), {
    description: 'open pomodoro preferences',
    handler() {
      if (isRunning) {
        pomodoroModel.pauseTimer()
      } else {
        start()
      }
    }
  })

  useHotkey(HotKey.of('s', HotKey.Meta), {
    description: 'skip pomodoro',
    handler() {
      globalThis.console.info('skip ')
    }
  })

  return (
    <div className={clsx('flex-1 text-dark-600 dark:text-white')}>
      <Header />
      <main className="px-4">
        <PomodoroModeSwitcher />
        <div className="mt-4 flex flex-col justify-center items-center">
          <PomodoroTimer />
          <StatusText />
          <Transition.Shift appear nodeRef={controlsRef}>
            <div
              ref={controlsRef}
              className="fixed bottom-0 pb-10 flex items-center space-x-4 sm:space-x-8"
            >
              <Control
                withBorder
                size="sm"
                Icon={AdjustmentsIcon}
                onClick={() =>
                  universalDrawerModel.showDrawer('pomodoro-settings')
                }
              />
              <Control
                size="md"
                Icon={isRunning ? PauseIcon : PlayIcon}
                onClick={() => {
                  if (isRunning) {
                    pomodoroModel.pauseTimer()
                  } else {
                    start()
                  }
                }}
              />
              <Control size="sm" withBorder Icon={FastForwardIcon} />
            </div>
          </Transition.Shift>
        </div>
        <UniversalDrawer name="pomodoro-settings" className="p-6 space-y-2">
          <label className="flex justify-between font-semibold">
            Focus time duration
            <input type="number" className="ml-6" />
          </label>
          <label className="flex justify-between font-semibold">
            Short break duration
            <input type="number" className="ml-6" />
          </label>
          <label className="flex justify-between font-semibold">
            Long break duration
            <input type="number" className="ml-6" />
          </label>
        </UniversalDrawer>
      </main>
    </div>
  )
}

export default PomodoroPage
