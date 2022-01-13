import React, {FC} from 'react'
import {useStore} from 'effector-react'
import clsx from 'clsx'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import {pomodoroModel} from 'entities/pomodoro'

type InputProps = {} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

const Input: FC<InputProps> = ({className, ...props}) => (
  <input
    type="text"
    className={clsx(
      'appearance-none px-3 py-1 rounded-md border border-gray-100',
      'focus:outline-none focus:border-indigo-500',
      'transition',
      className
    )}
    {...props}
  />
)

const Label: FC = ({children}) => (
  <label className="flex justify-between items-center font-semibold">
    {children}
  </label>
)

export const PomodoroPreferences: FC = () => {
  const focusDuration = useStore(pomodoroModel.$focusDuration)
  const shortBreakDuration = useStore(pomodoroModel.$shortBreakDuration)
  const longBreakDuration = useStore(pomodoroModel.$longBreakDuration)

  return (
    <UniversalDrawer name="pomodoro-settings" className="p-6">
      <form
        className="h-full flex flex-col"
        onSubmit={event => {
          event.preventDefault()
          universalDrawerModel.hideDrawer()
        }}
      >
        <div className="space-y-4 mb-6 sm:w-80">
          <Label>
            Focus time (min)
            <Input
              type="number"
              min="0"
              value={focusDuration}
              className="ml-6 w-20"
              onChange={event =>
                pomodoroModel.changeFocusDuration(
                  parseInt(event.target.value, 10)
                )
              }
            />
          </Label>
          <Label>
            Short break (min)
            <Input
              type="number"
              min="0"
              value={shortBreakDuration}
              className="ml-6 w-20"
              onChange={event =>
                pomodoroModel.changeShortBreakDuration(
                  parseInt(event.target.value, 10)
                )
              }
            />
          </Label>
          <Label>
            Long break (min)
            <Input
              type="number"
              min="0"
              value={longBreakDuration}
              className="ml-6 w-20"
              onChange={event =>
                pomodoroModel.changeLongBreakDuration(
                  parseInt(event.target.value, 10)
                )
              }
            />
          </Label>
        </div>
      </form>
    </UniversalDrawer>
  )
}
