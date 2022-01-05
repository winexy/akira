import clsx from 'clsx'
import React, {FC, useEffect} from 'react'
import {PageView} from 'shared/ui/page-view'
import {
  combine,
  createEffect,
  createEvent,
  createStore,
  forward,
  guard,
  sample
} from 'effector'
import {useStore} from 'effector-react'
import padStart from 'lodash/padStart'
import floor from 'lodash/floor'
import addMinutes from 'date-fns/addMinutes'
import differenceInSeconds from 'date-fns/differenceInSeconds'
import addSeconds from 'date-fns/addSeconds'
import {Header} from 'shared/ui/header'
import {Transition} from 'shared/ui/transition'
import isNull from 'lodash/isNull'

function createCountdown() {
  const start = createEvent<Date>()
  const abort = createEvent()
  const pause = createEvent()

  const wait = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms))

  type Status = 'idle' | 'paused' | 'running' | 'aborted' | 'finished'

  const $endsAt = createStore<Date | null>(null)
  const $status = createStore<Status>('idle')
  const $timeLeft = createStore(0)
  const $isRunning = $status.map(status => status === 'running')
  const $isPaused = $status.map(status => status === 'paused')
  const $isIdle = $status.map(status => status === 'idle')
  const $isFinished = $status.map(status => status === 'finished')
  const tick = createEvent()

  const updateDiffFx = createEffect((end: Date | null) => {
    return isNull(end) ? 0 : differenceInSeconds(end, new Date())
  })

  const timerFx = createEffect(async (end: Date | null) => {
    if (isNull(end)) {
      return end
    }

    await wait(1000)
    return end
  })

  forward({
    from: timerFx.doneData,
    to: updateDiffFx
  })

  forward({
    from: start,
    to: updateDiffFx
  })

  $endsAt.on(start, (_, date) => date)

  const isFinishedGuard = guard({
    source: updateDiffFx.doneData,
    filter: ms => ms === 0
  })

  $status
    .on(start, () => 'running')
    .on(pause, () => 'paused')
    .on(abort, () => 'aborted')
    .on(isFinishedGuard, () => 'finished')

  guard({
    source: start,
    filter: timerFx.pending.map(is => !is),
    target: tick
  })

  sample({
    clock: tick,
    source: $endsAt,
    fn: timerFx
  })

  const willTick = guard({
    source: updateDiffFx.doneData,
    filter: ms => ms >= 0
  })

  guard({
    source: willTick,
    filter: $isRunning,
    target: tick
  })

  const shouldUpdateIfRunning = guard({
    source: updateDiffFx.doneData,
    filter: $isRunning
  })

  const shouldUpdateIfFinished = guard({
    source: updateDiffFx.doneData,
    filter: $isFinished
  })

  $timeLeft.on(shouldUpdateIfRunning, (_, time) => time)
  $timeLeft.on(shouldUpdateIfFinished, (_, time) => time)

  return {
    startTimer: start,
    abortTimer: abort,
    pauseTimer: pause,
    $isIdle,
    $isRunning,
    $isPaused,
    $isFinished,
    $timeLeft
  }
}

const {
  startTimer,
  pauseTimer,
  $timeLeft,
  $isIdle,
  $isPaused,
  $isRunning,
  $isFinished
} = createCountdown()

const $time = combine($timeLeft, $isIdle, (totalSeconds, isIdle) => {
  if (isIdle) {
    return {minutes: '25', seconds: '00'}
  }

  const format = (x: number) => padStart(String(floor(x)), 2, '0')

  const minutes = format(totalSeconds / 60)
  const seconds = format(totalSeconds % 60)

  return {minutes, seconds}
})

const separator = (
  <span className="space-y-1">
    <span className="block w-2 h-2 rounded-full bg-white" />
    <span className="block w-2 h-2 rounded-full bg-white" />
  </span>
)

const PressButton: FC<{onClick(): void}> = ({onClick, children}) => {
  return (
    <button
      className={clsx(
        'w-48 h-48 rounded-full bg-red-500 text-white',
        'border-4 border-red-600',
        'shadow-xl transition ease-in duration-150',
        'focus:outline-none',
        'active:bg-red-600 active:shadow-inner'
      )}
      onClick={onClick}
    >
      <span className="font-bold">{children}</span>
    </button>
  )
}

const PomodoroPage: FC = () => {
  const timeLeft = useStore($timeLeft)
  const time = useStore($time)
  const isRunning = useStore($isRunning)
  const isPaused = useStore($isPaused)
  const isFinished = useStore($isFinished)

  useEffect(() => {
    if (isFinished) {
      if ('Notification' in window) {
        // eslint-disable-next-line
        new Notification('Time to Relax')
      }
    }
  }, [isFinished])

  function start() {
    const endDate = isPaused
      ? addSeconds(new Date(), timeLeft)
      : addMinutes(new Date(), 25)

    startTimer(endDate)
  }

  const countdown = (
    <span className="text-4xl flex justify-center items-center">
      <span className="w-14 text-center">{time.minutes}</span>
      {separator}
      <span className="w-14 text-center">{time.seconds}</span>
    </span>
  )

  return (
    <PageView
      className="p-4 h-full bg-red-500"
      header={
        <Header className="bg-red-500">
          <span role="img" aria-label="tomato emoji" className="text-xl">
            🍅
          </span>{' '}
          <span className="font-semibold ml-3 text-xl">Pomodoro</span>
        </Header>
      }
    >
      <div className="flex flex-col justify-center items-center">
        <Transition.Scale appear>
          <div className="mt-6">
            {isRunning ? (
              <PressButton onClick={() => pauseTimer()}>
                {countdown}
                PAUSE
              </PressButton>
            ) : (
              <PressButton onClick={start}>
                {countdown}
                {isPaused ? 'CONTINUE' : 'START'}
              </PressButton>
            )}
          </div>
        </Transition.Scale>
        <Transition.Scale appear in={isRunning} unmountOnExit>
          <p className="mt-8 font-semibold text-xl">Time to focus!</p>
        </Transition.Scale>
      </div>
    </PageView>
  )
}

export default PomodoroPage
