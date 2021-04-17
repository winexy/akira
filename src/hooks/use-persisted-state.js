import {useState, useEffect} from 'react'

export function usePersistedState(storage, {key, defaultState}) {
  const [state, setState] = useState(() => storage.get(key) ?? defaultState)
  useEffect(() => storage.set(key, state), [state])
  return [state, setState]
}
