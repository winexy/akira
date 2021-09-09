import React, {FC, useEffect, createContext, useContext} from 'react'
import isNil from 'lodash/isNil'

type HotkeyDef = string
type HotkeyHandler = () => void
type HotkeyMap = Map<HotkeyDef, HotkeyHandler>

const hotkeyMap = new Map()
const HotkeyContext = createContext<HotkeyMap>(hotkeyMap)

function useHotkey(definition: HotkeyDef, handler: HotkeyHandler) {
  const context = useContext(HotkeyContext)

  if (isNil(context)) {
    throw new Error(
      'useHotkey hook should be used within HotkeyContext.Provider'
    )
  }

  useEffect(() => {
    context.set(definition, handler)
    return () => {
      context.delete(definition)
    }
  }, [context, definition, handler])
}

function Handler(event: KeyboardEvent) {
  const {key, metaKey} = event

  const definition = `${key}${metaKey ? '.meta' : ''}`

  if (hotkeyMap.has(definition)) {
    hotkeyMap.get(definition)()
  }
}

const HotkeyProvider: FC = ({children}) => {
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
