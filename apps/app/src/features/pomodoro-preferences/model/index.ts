import {HotKey} from 'modules/hotkeys/HotKey'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'
import {universalDrawerModel} from 'widgets/universal-drawer'

export function usePreferencesHotKey() {
  useHotkey(HotKey.of('p', HotKey.Meta), {
    description: 'open pomodoro preferences',
    handler() {
      universalDrawerModel.showDrawer('pomodoro-settings')
    }
  })
}
