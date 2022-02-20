import clsx from 'clsx'
import React, {FC} from 'react'
import {useStore} from 'effector-react'
import {HotKey, useHotkey} from 'shared/lib/hotkey'
import {pomodoroModel, pomodoroLib} from 'entities/pomodoro'
import {PomodoroModeSwitcher, PomodoroTimer} from 'features/pomodoro-timer'
import {
  PomodoroPreferences,
  pomodoroPreferencesModel,
} from 'features/pomodoro-preferences'
import {Header, StatusText, ControlPanel} from './ui'
import './pomodoro.css'

const PomodoroPage: FC = (): JSX.Element => {
  const isRunning = useStore(pomodoroModel.$isRunning)
  const mode = useStore(pomodoroModel.$mode)

  pomodoroPreferencesModel.usePreferencesHotKey()

  useHotkey(HotKey.of('Enter', HotKey.Meta), {
    description: 'toggle pomodor timer',
    handler() {
      if (isRunning) {
        pomodoroModel.pauseTimer()
      } else {
        pomodoroLib.startTimer(mode)
      }
    },
  })

  useHotkey(HotKey.of('s', HotKey.Meta), {
    description: 'skip pomodoro',
    handler() {
      globalThis.console.info('skip ')
    },
  })

  return (
    <div className={clsx('flex-1 text-dark-600 dark:text-white')}>
      <Header />
      <main className="px-4">
        <PomodoroModeSwitcher />
        <div className="mt-4 flex flex-col justify-center items-center">
          <PomodoroTimer />
          <StatusText />
          <ControlPanel />
        </div>
        <PomodoroPreferences />
      </main>
    </div>
  )
}

export default PomodoroPage
