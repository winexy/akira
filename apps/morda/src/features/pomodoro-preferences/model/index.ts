import {HotKey, useHotkey} from 'shared/lib/hotkey'
import {universalDrawerModel} from 'widgets/universal-drawer'

export function usePreferencesHotKey() {
  useHotkey(HotKey.of('p', HotKey.Meta), {
    description: 'open pomodoro preferences',
    handler() {
      universalDrawerModel.showDrawer('pomodoro-settings')
    },
  })
}
