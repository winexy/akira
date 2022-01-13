import React, {FC} from 'react'
import {UniversalDrawer} from 'widgets/universal-drawer'

const Input = () => (
  <input
    type="number"
    min="0"
    className="ml-6 appearance-none px-3 py-1 rounded-md border border-gray-100"
  />
)

const Label: FC = ({children}) => (
  <label className="flex justify-between items-center font-semibold">
    {children}
  </label>
)

export const PomodoroPreferences: FC = () => {
  return (
    <UniversalDrawer name="pomodoro-settings" className="p-6 space-y-4">
      <Label>
        Focus time duration
        <Input />
      </Label>
      <Label>
        Short break duration
        <Input />
      </Label>
      <Label>
        Long break duration
        <Input />
      </Label>
    </UniversalDrawer>
  )
}
