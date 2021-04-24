import isNull from 'lodash/isNull';

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
    const value = localStorage.getItem(key);

    if (isNull(value)) {
      return value;
    }

    return JSON.parse(value)
  },
  remove(key) {
    localStorage.removeItem(key)
  }
}