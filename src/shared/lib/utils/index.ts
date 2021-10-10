export const always = <T>(v: T) => () => v
export const invert = (v: boolean) => !v

export const rejectNotImplemented = () =>
  Promise.reject(new Error('not implemented'))

export const exhaustiveCheck = (arg: never): never => {
  throw new Error(`[ExhaustiveCheck]: ${arg}`)
}

export function prop<T, K extends keyof T = keyof T>(key: K) {
  return (source: NonNullable<T>) => source[key]
}
