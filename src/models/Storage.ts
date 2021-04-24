import isNull from 'lodash/isNull'

export type StorageT = {
  set<T>(key: string, data: T): void
  get<T = null>(key: string, defaultValue: T): T
  remove(key: string): void
}

export const storage: StorageT = {
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  },
  get(key, defaultValue) {
    const value = localStorage.getItem(key)

    return isNull(value) ? defaultValue : JSON.parse(value)
  },
  remove(key) {
    localStorage.removeItem(key)
  }
}
