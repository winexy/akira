import noop from 'lodash/noop'

export function createDebugger(tag: string) {
  function log(...args: any[]) {
    globalThis.console.debug(`[${tag}]`, ...args)
  }

  log.skip = noop

  return log
}

export function Invariant(message: string) {
  return new Error(`Invariant Violation: ${message}`)
}
