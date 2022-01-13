import React, {FC} from 'react'
import {UniversalDrawer} from 'widgets/universal-drawer'

export const PomodoroPreferences: FC = () => {
  return (
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
  )
}
