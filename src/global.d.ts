type AsyncFunc = (...args: any[]) => Promise<any>
type AnyFunc = (...args: any[]) => any

type LazyThen<T extends AsyncFunc> = T extends (
  ...args: any[]
) => Promise<infer R>
  ? R
  : T

type RT2<F extends AnyFunc> = ReturnType<ReturnType<F>>
