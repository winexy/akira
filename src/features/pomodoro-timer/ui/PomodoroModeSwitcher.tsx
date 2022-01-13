import React, {FC} from 'react'
import {useStore} from 'effector-react'
import {Segment, SegmentedControl} from 'shared/ui/segmented-control'
import {pomodoroModel} from 'entities/pomodoro'

export const PomodoroModeSwitcher: FC = () => {
  const mode = useStore(pomodoroModel.$mode)

  return (
    <SegmentedControl
      className="mx-auto max-w-lg text-xs sm:text-base"
      activeId={mode}
      onChange={pomodoroModel.changeMode}
    >
      <Segment id={pomodoroModel.PomodoroMode.Focus}>Focus</Segment>
      <Segment id={pomodoroModel.PomodoroMode.ShortBreak}>Short break</Segment>
      <Segment id={pomodoroModel.PomodoroMode.LongBreak}>Long break</Segment>
    </SegmentedControl>
  )
}
