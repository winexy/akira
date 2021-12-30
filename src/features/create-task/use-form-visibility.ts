import {useEffect, useState} from 'react'
import {HotKey} from 'modules/hotkeys/HotKey'
import {useHotkey} from 'modules/hotkeys/HotKeyContext'

export function useFormVisibility({
  onVisibilityChange
}: {
  onVisibilityChange(isVisible: boolean): void
}): [boolean, (v: boolean) => void] {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    onVisibilityChange(isVisible)
  }, [isVisible, onVisibilityChange])

  useEffect(() => {
    if (!isVisible) {
      return () => {}
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handler)

    return () => {
      window.removeEventListener('keydown', handler)
    }
  }, [isVisible])

  useHotkey(HotKey.of('k', HotKey.Meta), {
    description: 'open task form',
    handler() {
      setIsVisible(true)
    }
  })

  return [isVisible, setIsVisible]
}
