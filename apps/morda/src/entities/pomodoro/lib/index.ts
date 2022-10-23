import {pomodoroModel} from 'entities/pomodoro'
import {exhaustiveCheck} from 'shared/lib/utils'

export function startTimer(mode: pomodoroModel.PomodoroMode) {
  switch (mode) {
    case pomodoroModel.PomodoroMode.Focus:
      return pomodoroModel.startFocusTimer()
    case pomodoroModel.PomodoroMode.ShortBreak:
      return pomodoroModel.startShortBreakTimer()
    case pomodoroModel.PomodoroMode.LongBreak:
      return pomodoroModel.startLongBreakTimer()
    default:
      return exhaustiveCheck(mode)
  }
}
