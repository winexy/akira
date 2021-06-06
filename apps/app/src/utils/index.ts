export const always = <T>(v: T) => () => v
export const invert = (v: boolean) => !v

export const rejectNotImplemented = () =>
  Promise.reject(new Error('not implemented'))
