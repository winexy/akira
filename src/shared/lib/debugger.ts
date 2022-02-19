import noop from 'lodash/noop'

export const createDebugger = (tag: string) => {
  function log(...args: any[]) {
    globalThis.console.debug(`[${tag}]`, ...args)
  }

  log.skip = noop

  return log
}
