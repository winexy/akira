import React, {FC, useEffect, createContext, useContext} from 'react'
import isNil from 'lodash/isNil'
import isUndefined from 'lodash/fp/isUndefined'
import {config} from 'shared/config'
import {HotKey} from './HotKey'

type HotkeyHandler = () => void
type HotKeyInfo = {
  description: string
  handler: HotkeyHandler
}
type HotkeyMap = Map<string, HotKeyInfo>

const hotkeyMap: HotkeyMap = new Map()
const HotkeyContext = createContext<HotkeyMap>(hotkeyMap)

function useHotkey(definition: string, info: HotKeyInfo) {
  const context = useContext(HotkeyContext)

  if (isNil(context)) {
    throw new Error(
      'useHotkey hook should be used within HotkeyContext.Provider',
    )
  }

  useEffect(() => {
    context.set(definition, info)
    return () => {
      context.delete(definition)
    }
  }, [context, definition, info])
}

function Handler(event: KeyboardEvent) {
  const hotkey = HotKey.fromEvent(event)
  const hotkeyInfo = hotkeyMap.get(hotkey)

  if (isUndefined(hotkeyInfo)) {
    return
  }

  if (config.env.dev) {
    window.console.debug(
      `[HotKeyContext]: ${HotKey.inspect(hotkey)} "${hotkeyInfo.description}"`,
    )
  }

  event.preventDefault()
  hotkeyInfo.handler()
}

const HotkeyProvider: FC<{
  children: React.ReactNode
}> = ({children}) => {
  useEffect(() => {
    window.addEventListener('keydown', Handler)
    return () => window.removeEventListener('keydown', Handler)
  }, [])

  return (
    <HotkeyContext.Provider value={hotkeyMap}>
      {children}
    </HotkeyContext.Provider>
  )
}

export {HotkeyProvider, useHotkey}
