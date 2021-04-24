import {useState, useEffect, Dispatch} from 'react'
import {StorageT} from '@/models/Storage';

type PersistedStateParams<T> = {
  key: string
  defaultState: T
}

export function usePersistedState<T>(storage: StorageT, {key, defaultState}: PersistedStateParams<T>) {
  const [state, setState] = useState(() => storage.get(key) ?? defaultState)
  useEffect(() => storage.set(key, state), [state])
  return [state, setState] as [T, Dispatch<T>]
}
