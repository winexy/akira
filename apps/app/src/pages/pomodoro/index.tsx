import clsx from 'clsx'
import React, {FC, ReactNode, useRef} from 'react'
import {useStore} from 'effector-react'
import {Transition} from 'shared/ui/transition'
import {
  MenuIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsIcon,
  FastForwardIcon
} from '@heroicons/react/solid'
import {toggleMenu} from 'shared/ui/menu'
import {exhaustiveCheck} from 'shared/lib/utils'
import {Segment, SegmentedControl} from 'shared/ui/segmented-control'
import './pomodoro.css'
import {WIP} from 'modules/tags/components/Tag'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {HotKey} from 'modules/hotkeys/HotKey'
import {pomodoroModel} from 'entities/pomodoro'

const Countdown: FC = () => {
  const time = useStore(pomodoroModel.$time)

  return (
    <strong className="text-5xl flex justify-center items-center space-x-1">
      <span className="w-18 text-center">{time.minutes}</span>
      <span className="space-y-1">
        <span className="block w-2 h-2 rounded-full bg-indigo-500 dark:bg-white" />
        <span className="block w-2 h-2 rounded-full bg-indigo-500 dark:bg-white" />
      </span>
      <span className="w-18 text-center">{time.seconds}</span>
    </strong>
  )
}

const CountdownWrapper: FC<{className: string}> = ({className}) => {
  return (
    <div
      className={clsx(
        'relative flex justify-center items-center',
        'w-48 h-48 rounded-full text-indigo-500 dark:text-white bg-white dark:bg-dark-600',
        'shadow transition ease-in duration-150',
        'focus:outline-none',
        className
      )}
    >
      <Countdown />
    </div>
  )
}

type RingProps = {
  className?: string
  radius: number
  stroke: string
  defs: ReactNode
  strokeWidth: number
  progress: number
}

const Ring: FC<RingProps> = props => {
  const {radius, strokeWidth, progress, className, stroke, defs} = props

  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg className={className} height={radius * 2} width={radius * 2}>
      <defs>{defs}</defs>
      <circle
        stroke={stroke}
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{strokeDashoffset}}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  )
}

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
  const isIdle = useStore(pomodoroModel.$isIdle)
  const isRunning = useStore(pomodoroModel.$isRunning)
  const mode = useStore(pomodoroModel.$mode)
  const progress = useStore(pomodoroModel.$progress)
  const isFocusMode = useStore(pomodoroModel.$isFocusMode)
  const isBreakMode = useStore(pomodoroModel.$isBreakMode)
  const countdownRef = useRef(null)
  const controlsRef = useRef(null)
  const textRef = useRef(null)

  function start() {
    switch (mode) {
      case pomodoroModel.PomodoroMode.Focus:
        return pomodoroModel.startFocusTimer()
      case pomodoroModel.PomodoroMode.ShortBreak:
        return pomodoroModel.startShortBreakTimer()
      case pomodoroModel.PomodoroMode.LongBreak:
        return pomodoroModel.startLongBreakTimer()
      default:
        return exhaustiveCheck(mode)
    }
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
      <header className="flex items-center px-4 py-2">
        <span role="img" aria-label="tomato emoji" className="text-xl">
          🍅
        </span>{' '}
        <span className={clsx('font-semibold ml-3 text-xl flex items-center')}>
          Pomodoro
          <WIP className="ml-3" />
        </span>
        <button
          className={clsx(
            'ml-auto w-8 h-8 -mr-1',
            'flex items-center justify-center ',
            'rounded ',
            'transition ease-in duration-150',
            'focus:outline-none',
            {
              'dark:active:bg-dark-700': isIdle
            }
          )}
          onClick={() => toggleMenu()}
        >
          <MenuIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="px-4">
        <SegmentedControl
          className="mx-auto max-w-lg text-xs sm:text-base"
          activeId={mode}
          onChange={pomodoroModel.changeMode}
        >
          <Segment id={pomodoroModel.PomodoroMode.Focus}>Focus</Segment>
          <Segment id={pomodoroModel.PomodoroMode.ShortBreak}>
            Short break
          </Segment>
          <Segment id={pomodoroModel.PomodoroMode.LongBreak}>
            Long break
          </Segment>
        </SegmentedControl>
        <div className="mt-4 flex flex-col justify-center items-center">
          <Transition.Fade appear nodeRef={countdownRef}>
            <div
              ref={countdownRef}
              className="relative flex items-center justify-center"
            >
              <Ring
                className={clsx('z-10 pointer-events-none', {
                  'text-red-300': isFocusMode,
                  'text-green-300': isBreakMode
                })}
                radius={150}
                progress={progress}
                strokeWidth={20}
                stroke={
                  isFocusMode ? 'url(#focus-gradient)' : 'url(#break-gradient)'
                }
                defs={
                  <>
                    <radialGradient
                      id="break-gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="50%" stopColor="#D1FAE5" />
                      <stop offset="100%" stopColor="#6EE7B7" />
                    </radialGradient>
                    <radialGradient
                      id="focus-gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="50%" stopColor="#FEE2E2" />
                      <stop offset="100%" stopColor="#F87171" />
                    </radialGradient>
                  </>
                }
              />
              <CountdownWrapper className="absolute z-10" />
              <div
                style={{width: 248, height: 248}}
                className="rounded-full shadow-inner absolute bg-gray-50 dark:bg-dark-500"
              />
            </div>
          </Transition.Fade>
          <Transition.Scale
            nodeRef={textRef}
            appear
            in={isRunning}
            unmountOnExit
          >
            <p
              ref={textRef}
              className={clsx('mt-8 font-semibold text-3xl transition', {
                'dark:text-white': isRunning
              })}
            >
              {isFocusMode ? 'Time to focus! 👩🏼‍💻' : 'Time to Break! 🧘🏼‍♀️'}
            </p>
          </Transition.Scale>
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
