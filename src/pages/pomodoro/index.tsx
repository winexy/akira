import clsx from 'clsx'
import React, {FC, ReactNode, useRef} from 'react'
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
import {MenuIcon, PlayIcon, PauseIcon} from '@heroicons/react/solid'
import {toggleMenu} from 'shared/ui/menu'
import {exhaustiveCheck} from 'shared/lib/utils'
import {Segment, SegmentedControl} from 'shared/ui/segmented-control'
import './pomodoro.css'
import {WIP} from 'modules/tags/components/Tag'

enum PomodoroMode {
  Focus = 'focus',
  Break = 'break'
}

const MINUTES_25 = 60 * 25
const MINUTES_5 = 60 * 5

const changeMode = createEvent<PomodoroMode>()
const switchMode = createEvent()

const $mode = createStore(PomodoroMode.Focus)

$mode.on(changeMode, (_, mode) => mode)
$mode.on(switchMode, mode => {
  return mode === PomodoroMode.Focus ? PomodoroMode.Break : PomodoroMode.Focus
})

const $isFocusMode = $mode.map(mode => mode === PomodoroMode.Focus)
const $isBreakMode = $mode.map(mode => mode === PomodoroMode.Break)

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
const startBreakTimer = createEvent()

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
  clock: startBreakTimer,
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
    <strong className="text-5xl flex justify-center items-center space-x-1">
      <span className="w-18 text-center">{time.minutes}</span>
      <span className="space-y-1">
        <span className="block w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-white" />
        <span className="block w-2.5 h-2.5 rounded-full bg-indigo-500 dark:bg-white" />
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

const PomodoroPage: FC = () => {
  const isIdle = useStore($isIdle)
  const isRunning = useStore($isRunning)
  const isPaused = useStore($isPaused)
  const mode = useStore($mode)
  const progress = useStore($progress)
  const isFocusMode = useStore($isFocusMode)
  const isBreakMode = useStore($isBreakMode)
  const countdownRef = useRef(null)
  const triggerRef = useRef(null)
  const textRef = useRef(null)

  function start() {
    switch (mode) {
      case PomodoroMode.Focus:
        return startFocusTimer()
      case PomodoroMode.Break:
        return startBreakTimer()
      default:
        return exhaustiveCheck(mode)
    }
  }

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
          className="mx-auto max-w-lg"
          activeId={mode}
          onChange={changeMode}
        >
          <Segment id={PomodoroMode.Focus}>Focus</Segment>
          <Segment id={PomodoroMode.Break}>Break</Segment>
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
          <div className="fixed bottom-0 pb-10">
            <Transition.Shift appear nodeRef={triggerRef}>
              <button
                ref={triggerRef}
                className={clsx(
                  'flex justify-center items-center w-24 h-24',
                  'rounded-full shadow-2xl bg-gray-100 dark:bg-dark-500',
                  'transition ease-in transform',
                  'focus:outline-none',
                  'dark:active:bg-dark-700',
                  'active:shadow-lg active:scale-90',
                  'text-indigo-500 dark:text-gray-200'
                )}
                onClick={() => {
                  if (isRunning) {
                    pauseTimer()
                  } else {
                    start()
                  }
                }}
              >
                {isRunning ? (
                  <PauseIcon className="w-24 h-24" />
                ) : (
                  <PlayIcon className="w-24 h-24" />
                )}
              </button>
            </Transition.Shift>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PomodoroPage
