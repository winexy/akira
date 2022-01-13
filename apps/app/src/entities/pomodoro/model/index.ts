import addMinutes from 'date-fns/addMinutes'
import addSeconds from 'date-fns/addSeconds'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import {
  combine,
  createEffect,
  createEvent,
  createStore,
  forward,
  sample
} from 'effector'
import floor from 'lodash/floor'
import isNull from 'lodash/isNull'
import padStart from 'lodash/padStart'
import {exhaustiveCheck} from 'shared/lib/utils'

enum PomodoroMode {
  Focus = 'focus',
  ShortBreak = 'short-break',
  LongBreak = 'long-break'
}

const MINUTES_25 = 60 * 25
const MINUTES_5 = 60 * 5
const MINUTES_10 = 60 * 10

const changeMode = createEvent<PomodoroMode>()
const switchMode = createEvent()

const $mode = createStore(PomodoroMode.Focus)

$mode.on(changeMode, (_, mode) => mode)
$mode.on(switchMode, mode => {
  return mode === PomodoroMode.Focus
    ? PomodoroMode.ShortBreak
    : PomodoroMode.Focus
})

const $isFocusMode = $mode.map(mode => mode === PomodoroMode.Focus)
const $isBreakMode = $mode.map(mode => mode === PomodoroMode.ShortBreak)

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
  Math.max(differenceInSeconds(endDate, new Date()), 0)

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
    switch (mode) {
      case PomodoroMode.Focus:
        return MINUTES_25
      case PomodoroMode.ShortBreak:
        return MINUTES_5
      case PomodoroMode.LongBreak:
        return MINUTES_10
      default:
        return exhaustiveCheck(mode)
    }
  })
  .on(updateTimer, (_, time) => time)

const startFocusTimer = createEvent()
const startShortBreakTimer = createEvent()
const startLongBreakTimer = createEvent()

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
  clock: startShortBreakTimer,
  source: startTimerMeta,
  fn: source =>
    source.isPaused
      ? addSeconds(new Date(), source.timeLeft)
      : addMinutes(new Date(), 5),
  target: startTimer
})

sample({
  clock: startLongBreakTimer,
  source: startTimerMeta,
  fn: source =>
    source.isPaused
      ? addSeconds(new Date(), source.timeLeft)
      : addMinutes(new Date(), 10),
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
  switch (mode) {
    case PomodoroMode.Focus:
      return 100 - (total / MINUTES_25) * 100
    case PomodoroMode.ShortBreak:
      return 100 - (total / MINUTES_5) * 100
    case PomodoroMode.LongBreak:
      return 100 - (total / MINUTES_10) * 100
    default:
      return exhaustiveCheck(mode)
  }
})

export {
  PomodoroMode,
  $mode,
  $isFocusMode,
  $isBreakMode,
  $isIdle,
  $isRunning,
  $isPaused,
  $isAborted,
  $isFinished,
  $progress,
  $time,
  changeMode,
  pauseTimer,
  abortTimer,
  finishTimer,
  startFocusTimer,
  startShortBreakTimer,
  startLongBreakTimer
}
