export type StorageT = {
  set<T>(key: string, data: T): void;
  get(key: string): unknown;
  remove(key: string): void;
}

export const storage: StorageT = {
  set(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
  },
  get(key) {
    return JSON.parse(localStorage.getItem(key))
  },
  remove(key) {
    localStorage.removeItem(key)
  }
}