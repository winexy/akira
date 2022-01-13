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

const $focusDuration = createStore(25)
const $shortBreakDuration = createStore(5)
const $longBreakDuration = createStore(10)

const saveSettings = createEvent<{
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
}>()

$focusDuration.on(saveSettings, (_, data) => Math.abs(data.focusDuration))
$shortBreakDuration.on(saveSettings, (_, data) =>
  Math.abs(data.shortBreakDuration)
)
$longBreakDuration.on(saveSettings, (_, data) =>
  Math.abs(data.longBreakDuration)
)

const changeMode = createEvent<PomodoroMode>()
const modeRotated = createEvent<PomodoroMode>()
const switchMode = createEvent()

const $mode = createStore(PomodoroMode.Focus)

const $settings = combine(
  {
    $focusDuration,
    $shortBreakDuration,
    $longBreakDuration,
    $mode
  },
  settings => ({
    focusDurationInSeconds: settings.$focusDuration * 60,
    shortBreakDurationInSeconds: settings.$shortBreakDuration * 60,
    longBreakDurationInSeconds: settings.$longBreakDuration * 60,
    mode: settings.$mode
  })
)

$mode.on(changeMode, (_, mode) => mode)
$mode.on(modeRotated, (_, mode) => mode)
$mode.on(switchMode, mode => {
  return mode === PomodoroMode.Focus
    ? PomodoroMode.ShortBreak
    : PomodoroMode.Focus
})

const $isFocusMode = $mode.map(mode => mode === PomodoroMode.Focus)
const $isBreakMode = $mode.map(mode => mode === PomodoroMode.ShortBreak)

const startTimer = createEvent<Date>()
const continueTimer = createEvent()
const abortTimer = createEvent()
const pauseTimer = createEvent()
const finishTimer = createEvent()

type Status = 'idle' | 'paused' | 'running' | 'aborted' | 'finished'

const $intervalId = createStore<number | null>(null)
const $timeLeft = createStore($settings.getState().focusDurationInSeconds)

const $status = createStore<Status>('idle')
const $isIdle = $status.map(status => status === 'idle')
const $isRunning = $status.map(status => status === 'running')
const $isPaused = $status.map(status => status === 'paused')
const $isAborted = $status.map(status => status === 'aborted')
const $isFinished = $status.map(status => status === 'finished')

const notifyFx = createEffect((mode: PomodoroMode) => {
  const message =
    mode === PomodoroMode.Focus ? 'Time to break' : 'Time to get back to work'

  if ('Notification' in window) {
    // eslint-disable-next-line
    new Notification(message, {})
  }
})

$status.on(startTimer, () => 'running')
$status.on(pauseTimer, () => 'paused')
$status.on(abortTimer, () => 'aborted')
$status.on(finishTimer, () => 'finished')

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

$intervalId.on(runTimerFx.doneData, (_, id) => id)
$intervalId.on(stopTimerFx.done, () => null)

forward({
  from: startTimer,
  to: runTimerFx
})

sample({
  clock: changeMode,
  source: $settings,
  fn(settings, mode) {
    switch (mode) {
      case PomodoroMode.Focus:
        return settings.focusDurationInSeconds
      case PomodoroMode.ShortBreak:
        return settings.shortBreakDurationInSeconds
      case PomodoroMode.LongBreak:
        return settings.longBreakDurationInSeconds
      default:
        return exhaustiveCheck(mode)
    }
  },
  target: updateTimer
})

$timeLeft.on(updateTimer, (_, time) => time)

const startFocusTimer = createEvent()
const startShortBreakTimer = createEvent()
const startLongBreakTimer = createEvent()

forward({
  from: saveSettings,
  to: abortTimer
})

sample({
  clock: saveSettings,
  source: combine({settings: $settings, mode: $mode}),
  fn(source) {
    switch (source.mode) {
      case PomodoroMode.Focus:
        return source.settings.focusDurationInSeconds
      case PomodoroMode.ShortBreak:
        return source.settings.shortBreakDurationInSeconds
      case PomodoroMode.LongBreak:
        return source.settings.longBreakDurationInSeconds
      default:
        return exhaustiveCheck(source.mode)
    }
  },
  target: updateTimer
})

sample({
  clock: continueTimer,
  source: $timeLeft,
  fn: timeLeft => addSeconds(new Date(), timeLeft),
  target: startTimer
})

sample({
  clock: startFocusTimer,
  source: $settings,
  fn: source => addSeconds(new Date(), source.focusDurationInSeconds),
  target: startTimer
})

sample({
  clock: startShortBreakTimer,
  source: $settings,
  fn: source => addSeconds(new Date(), source.shortBreakDurationInSeconds),
  target: startTimer
})

sample({
  clock: startLongBreakTimer,
  source: $settings,
  fn: source => addSeconds(new Date(), source.longBreakDurationInSeconds),
  target: startTimer
})

forward({
  from: changeMode,
  to: abortTimer
})

forward({
  from: modeRotated,
  to: abortTimer
})

sample({
  clock: notifyFx.done,
  source: $settings,
  target: switchMode
})

const formatTimeUnit = (x: number) => padStart(String(floor(x)), 2, '0')

const $time = combine($timeLeft, totalSeconds => {
  const minutes = formatTimeUnit(totalSeconds / 60)
  const seconds = formatTimeUnit(totalSeconds % 60)

  return {minutes, seconds}
})

const $progress = combine(
  $timeLeft,
  $mode,
  $settings,
  (total, mode, settings) => {
    const progressFrom = (max: number) => 100 - (total / max) * 100

    switch (mode) {
      case PomodoroMode.Focus:
        return progressFrom(settings.focusDurationInSeconds)
      case PomodoroMode.ShortBreak:
        return progressFrom(settings.shortBreakDurationInSeconds)
      case PomodoroMode.LongBreak:
        return progressFrom(settings.longBreakDurationInSeconds)
      default:
        return exhaustiveCheck(mode)
    }
  }
)

const $pomodoroIndex = createStore(0)

const skipPomodoro = createEvent()

function rotatePomodoroMode(index: number) {
  const isEven = index % 2 === 0

  if (isEven) {
    return PomodoroMode.Focus
  }

  const focusModesPassed = 4
  const shortBreaksPassed = 3
  const pomodorosPased = focusModesPassed + shortBreaksPassed

  return index >= pomodorosPased
    ? PomodoroMode.LongBreak
    : PomodoroMode.ShortBreak
}

sample({
  clock: skipPomodoro,
  source: $pomodoroIndex,
  fn: rotatePomodoroMode,
  target: modeRotated
})

sample({
  clock: skipPomodoro,
  source: $settings,
  fn(settings) {
    switch (settings.mode) {
      case PomodoroMode.Focus:
        return addSeconds(new Date(), settings.focusDurationInSeconds)
      case PomodoroMode.ShortBreak:
        return addSeconds(new Date(), settings.shortBreakDurationInSeconds)
      case PomodoroMode.LongBreak:
        return addSeconds(new Date(), settings.longBreakDurationInSeconds)
      default:
        return exhaustiveCheck(settings.mode)
    }
  },
  target: startTimer
})

$pomodoroIndex
  .on(finishTimer, index => index + 1)
  .on(skipPomodoro, index => index + 1)
  .reset(changeMode)

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
  continueTimer,
  abortTimer,
  finishTimer,
  startFocusTimer,
  skipPomodoro,
  startShortBreakTimer,
  startLongBreakTimer,
  $focusDuration,
  $shortBreakDuration,
  $longBreakDuration,
  saveSettings
}
