import clsx from 'clsx'
import React, {FC} from 'react'
import {useStore} from 'effector-react'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {HotKey} from 'modules/hotkeys/HotKey'
import {pomodoroModel, pomodoroLib} from 'entities/pomodoro'
import {PomodoroModeSwitcher, PomodoroTimer} from 'features/pomodoro'
import {Header, StatusText, ControlPanel} from './ui'
import './pomodoro.css'

const PomodoroPage: FC = (): JSX.Element => {
  const isRunning = useStore(pomodoroModel.$isRunning)
  const mode = useStore(pomodoroModel.$mode)

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
        pomodoroLib.startTimer(mode)
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
          <ControlPanel />
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
