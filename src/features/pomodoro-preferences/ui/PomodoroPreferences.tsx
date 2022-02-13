import React, {FC, FormEventHandler, useState} from 'react'
import {useStore} from 'effector-react'
import clsx from 'clsx'
import {UniversalDrawer, universalDrawerModel} from 'widgets/universal-drawer'
import {pomodoroModel} from 'entities/pomodoro'
import {Button} from 'shared/ui/button'

type InputProps = {} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>

const Input: FC<InputProps> = ({className, ...props}) => (
  <input
    type="text"
    className={clsx(
      'appearance-none px-3 py-1 rounded-md border border-gray-100',
      'dark:bg-dark-500 dark:border-dark-400',
      'focus:outline-none focus:border-indigo-500',
      'transition',
      className,
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

  const [focusDurationDraft, setFocusDuration] = useState(focusDuration)
  const [shortBreakDurationDraft, setShortBreakDuration] = useState(
    shortBreakDuration,
  )
  const [longBreakDurationDraft, setLongBreakDuration] = useState(
    longBreakDuration,
  )

  const onSubmit: FormEventHandler = event => {
    event.preventDefault()
    universalDrawerModel.hideDrawer()

    pomodoroModel.saveSettings({
      focusDuration: focusDurationDraft,
      shortBreakDuration: shortBreakDurationDraft,
      longBreakDuration: longBreakDurationDraft,
    })
  }

  return (
    <UniversalDrawer name="pomodoro-settings" className="p-6">
      <form className="h-full flex flex-col" onSubmit={onSubmit}>
        <div className="space-y-4 mb-6 sm:w-80">
          <Label>
            Focus time (min)
            <Input
              type="number"
              min="0"
              value={focusDurationDraft}
              className="ml-6 w-20"
              onChange={event =>
                setFocusDuration(parseInt(event.target.value, 10))
              }
            />
          </Label>
          <Label>
            Short break (min)
            <Input
              type="number"
              min="0"
              value={shortBreakDurationDraft}
              className="ml-6 w-20"
              onChange={event =>
                setShortBreakDuration(parseInt(event.target.value, 10))
              }
            />
          </Label>
          <Label>
            Long break (min)
            <Input
              type="number"
              min="0"
              value={longBreakDurationDraft}
              className="ml-6 w-20"
              onChange={event =>
                setLongBreakDuration(parseInt(event.target.value, 10))
              }
            />
          </Label>
        </div>
        <Button type="submit" size="md" className="mt-auto">
          Apply
        </Button>
      </form>
    </UniversalDrawer>
  )
}
