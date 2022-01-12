import clsx from 'clsx'
import React, {FC, useRef} from 'react'
import {
  combine,
  createEffect,
  createEvent,
  createStore,
  forward,
  sample
} from 'effector'
import {useStore} from 'effector-react'
import padStart from 'lodash/padStart'
import floor from 'lodash/floor'
import addMinutes from 'date-fns/addMinutes'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import addSeconds from 'date-fns/addSeconds'
import {Transition} from 'shared/ui/transition'
import isNull from 'lodash/isNull'
import {MenuIcon} from '@heroicons/react/solid'
import {toggleMenu} from 'shared/ui/menu'
import {exhaustiveCheck} from 'shared/lib/utils'
import {Segment, SegmentedControl} from 'shared/ui/segmented-control'
import './pomodoro.css'

enum PomodoroMode {
  Focus = 'focus',
  Rest = 'rest'
}

const MINUTES_25 = 60 * 25
const MINUTES_5 = 60 * 5

const changeMode = createEvent<PomodoroMode>()
const switchMode = createEvent()

const $mode = createStore(PomodoroMode.Focus)

$mode.on(changeMode, (_, mode) => mode)
$mode.on(switchMode, mode => {
  return mode === PomodoroMode.Focus ? PomodoroMode.Rest : PomodoroMode.Focus
})

const $isFocusMode = $mode.map(mode => mode === PomodoroMode.Focus)
const $isRestMode = $mode.map(mode => mode === PomodoroMode.Rest)

const startTimer = createEvent<Date>()
const abortTimer = createEvent()
const pauseTimer = createEvent()
const finishTimer = createEvent()

type Status = 'idle' | 'paused' | 'running' | 'aborted' | 'finished'

const $intervalId = createStore<number | null>(null)
const $timeLeft = createStore(MINUTES_25)

const $status = createStore<Status>('idle')
const $isIdle = $status.map(status => status === 'idle')
const $isRunning = $status.map(status => status === 'running')
const $isPaused = $status.map(status => status === 'paused')
const $isAborted = $status.map(status => status === 'aborted')
const $isFinished = $status.map(status => status === 'finished')

const notifyFx = createEffect((mode: PomodoroMode) => {
  const message =
    mode === PomodoroMode.Focus ? 'Time to relax' : 'Time to get back to work'

  if ('Notification' in window) {
    // eslint-disable-next-line
    new Notification(message, {})
  }
})

$status
  .on(startTimer, () => 'running')
  .on(pauseTimer, () => 'paused')
  .on(abortTimer, () => 'aborted')
  .on(finishTimer, () => 'finished')

sample({
  clock: finishTimer,
  source: $mode,
  target: notifyFx
})

const updateTimer = createEvent<number>()

const getRemainingTime = (endDate: Date) =>
  differenceInSeconds(endDate, new Date())

const runTimerFx = createEffect((endDate: Date) => {
  const currentIntervalId = $intervalId.getState()

  if (!isNull(currentIntervalId)) {
    return currentIntervalId
  }

  const timeLeft = getRemainingTime(endDate)
  updateTimer(timeLeft)

  const intervalId = setInterval(() => {
    const timeLeft = getRemainingTime(endDate)
    updateTimer(timeLeft)

    if (timeLeft <= 0) {
      finishTimer()
    }
  }, 1000)

  return intervalId
})

const stopTimerFx = createEffect((timerId: number | null) => {
  if (!isNull(timerId)) {
    clearInterval(timerId)
  }
})

sample({
  clock: abortTimer,
  source: $intervalId,
  target: stopTimerFx
})

sample({
  clock: pauseTimer,
  source: $intervalId,
  target: stopTimerFx
})

sample({
  clock: finishTimer,
  source: $intervalId,
  target: stopTimerFx
})

$intervalId
  .on(runTimerFx.doneData, (_, id) => id)
  .on(stopTimerFx.done, () => null)

forward({
  from: startTimer,
  to: runTimerFx
})

$timeLeft
  .on(changeMode, (_, mode) => {
    return mode === PomodoroMode.Focus ? MINUTES_25 : MINUTES_5
  })
  .on(updateTimer, (_, time) => time)

const startFocusTimer = createEvent()
const startRestTimer = createEvent()

const startTimerMeta = combine($isPaused, $timeLeft, (isPaused, timeLeft) => ({
  isPaused,
  timeLeft
}))

sample({
  clock: startFocusTimer,
  source: startTimerMeta,
  fn: source =>
    source.isPaused
      ? addSeconds(new Date(), source.timeLeft)
      : addMinutes(new Date(), 25),
  target: startTimer
})

sample({
  clock: startRestTimer,
  source: startTimerMeta,
  fn: source =>
    source.isPaused
      ? addSeconds(new Date(), source.timeLeft)
      : addMinutes(new Date(), 5),
  target: startTimer
})

forward({
  from: changeMode,
  to: abortTimer
})

sample({
  clock: notifyFx.done,
  target: switchMode
})

const formatTimeUnit = (x: number) => padStart(String(floor(x)), 2, '0')

const $time = combine($timeLeft, totalSeconds => {
  const minutes = formatTimeUnit(totalSeconds / 60)
  const seconds = formatTimeUnit(totalSeconds % 60)

  return {minutes, seconds}
})

const $progress = combine($timeLeft, $mode, (total, mode) => {
  return mode === PomodoroMode.Focus
    ? 100 - (total / MINUTES_25) * 100
    : 100 - (total / MINUTES_5) * 100
})

const Countdown: FC = () => {
  const time = useStore($time)

  return (
    <strong className="text-4xl flex justify-center items-center">
      <span className="w-14 text-center">{time.minutes}</span>
      <span className="space-y-1">
        <span className="block w-2 h-2 rounded-full bg-white" />
        <span className="block w-2 h-2 rounded-full bg-white" />
      </span>
      <span className="w-14 text-center">{time.seconds}</span>
    </strong>
  )
}

const PressButton: FC<{className: string; onClick(): void}> = ({
  className,
  onClick,
  children
}) => {
  const isRestMode = useStore($isRestMode)
  const isFocusMode = useStore($isFocusMode)

  return (
    <button
      className={clsx(
        'w-48 h-48 rounded-full text-white',
        'border-2 border-opacity-50',
        'shadow-xl transition ease-in duration-150',
        'focus:outline-none',
        'active:shadow-inner',
        {
          'border-red-600 bg-red-500 active:bg-red-600': isFocusMode,
          'border-green-500 bg-green-400 active:bg-green-500': isRestMode
        },
        className
      )}
      onClick={onClick}
    >
      <Countdown />
      <span className="font-bold">{children}</span>
    </button>
  )
}

type RingProps = {
  className?: string
  radius: number
  stroke: number
  progress: number
}

const Ring: FC<RingProps> = props => {
  const {radius, stroke, progress, className} = props

  const normalizedRadius = radius - stroke * 2
  const circumference = normalizedRadius * 2 * Math.PI

  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg className={className} height={radius * 2} width={radius * 2}>
      <circle
        stroke="currentColor"
        fill="transparent"
        strokeWidth={stroke}
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

const PomodoroPage: FC = () => {
  const isIdle = useStore($isIdle)
  const isRunning = useStore($isRunning)
  const isPaused = useStore($isPaused)
  const mode = useStore($mode)
  const progress = useStore($progress)
  const isFocusMode = useStore($isFocusMode)
  const isRestMode = useStore($isRestMode)
  const triggerRef = useRef(null)
  const textRef = useRef(null)

  function start() {
    switch (mode) {
      case PomodoroMode.Focus:
        return startFocusTimer()
      case PomodoroMode.Rest:
        return startRestTimer()
      default:
        return exhaustiveCheck(mode)
    }
  }

  return (
    <div
      className={clsx('flex-1 text-dark-600 dark:text-white', 'transition', {
        'bg-red-400': isFocusMode && isRunning,
        'bg-green-400': isRestMode && isRunning
      })}
    >
      <header className="flex items-center px-4 py-2">
        <span role="img" aria-label="tomato emoji" className="text-xl">
          🍅
        </span>{' '}
        <span
          className={clsx('font-semibold ml-3 text-xl', {
            'text-white': isRunning
          })}
        >
          Pomodoro
        </span>
        <button
          className={clsx(
            'ml-auto w-8 h-8 -mr-1',
            'flex items-center justify-center ',
            'rounded ',
            'transition ease-in duration-150',
            'focus:outline-none',
            {
              'active:bg-red-600 focus:bg-red-600': isFocusMode && isRunning,
              'active:bg-green-400 focus:bg-green-400': isRestMode && isRunning,
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
          className="mx-auto max-w-lg"
          activeId={mode}
          onChange={changeMode}
        >
          <Segment id={PomodoroMode.Focus}>Focus</Segment>
          <Segment id={PomodoroMode.Rest}>Rest</Segment>
        </SegmentedControl>
        <div className="mt-8 flex flex-col justify-center items-center">
          <Transition.Scale appear nodeRef={triggerRef}>
            <div
              ref={triggerRef}
              className="relative flex items-center justify-center"
            >
              <Ring
                className="z-10 text-blue-500 pointer-events-none"
                radius={150}
                progress={progress}
                stroke={20}
              />
              {isRunning ? (
                <PressButton
                  className="absolute z-10"
                  onClick={() => pauseTimer()}
                >
                  PAUSE
                </PressButton>
              ) : (
                <PressButton className="absolute z-10" onClick={start}>
                  {isPaused ? 'CONTINUE' : 'START'}
                </PressButton>
              )}
              <div
                style={{width: 250, height: 250}}
                className="rounded-full shadow-inner absolute bg-white"
              />
            </div>
          </Transition.Scale>
          <Transition.Scale
            nodeRef={textRef}
            appear
            in={isRunning}
            unmountOnExit
          >
            <p
              ref={textRef}
              className={clsx('mt-8 font-semibold text-3xl transition', {
                'text-white': isRunning
              })}
            >
              {isFocusMode ? 'Time to focus! 👩🏼‍💻' : 'Time to rest! 🧘🏼‍♀️'}
            </p>
          </Transition.Scale>
        </div>
      </main>
    </div>
  )
}

export default PomodoroPage
